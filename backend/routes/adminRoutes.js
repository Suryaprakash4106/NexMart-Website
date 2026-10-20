const { User, Product, Order, Review, Activity } = require('../models');
const { auth, allow } = require('../middleware/auth');
const { wrap } = require('../utils/helpers');
const { restock } = require('../utils/orderService');

const ROLES = ['user', 'support', 'manager', 'admin'];
const STATUS = ['Pending Payment', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PERMS = {
  admin: ['dashboard', 'orders', 'orders.edit', 'orders.export', 'products', 'reviews', 'users', 'activity', 'revenue'],
  manager: ['dashboard', 'orders', 'orders.edit', 'orders.export', 'products', 'reviews', 'revenue'],
  support: ['dashboard', 'orders', 'reviews'],
};

const staff = [auth, allow('manager', 'support')]; // any staff member
const mgr = [auth, allow('manager')];               // admin + manager
const adm = [auth, allow()];                        // admin only

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const log = (req, action, target, detail = '') =>
  Activity.create({ user: req.staff.id, userName: req.staff.name, role: req.staff.role, action, target, detail })
    .catch((e) => console.error('activity log failed:', e.message));
const paging = (req, def = 20) => ({
  p: Math.max(1, parseInt(req.query.page) || 1),
  l: Math.min(100, Math.max(1, parseInt(req.query.limit) || def)),
});
const IST = 5.5 * 3600 * 1000;
const istDay = (back = 0) => new Date(Date.now() + IST - back * 86400000).toISOString().slice(0, 10);
const isId = (s) => /^[a-f\d]{24}$/i.test(String(s));
const csvCell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };

// filters shared by the order list and the CSV export
async function orderQuery(qs) {
  const q = {};
  if (STATUS.includes(qs.status)) q.status = qs.status;
  if (qs.payment === 'cod' || qs.payment === 'razorpay') q.payment = qs.payment;
  const day = /^\d{4}-\d{2}-\d{2}$/, range = {};
  const from = day.test(qs.from || '') ? new Date(qs.from + 'T00:00:00+05:30') : null;
  const to = day.test(qs.to || '') ? new Date(qs.to + 'T23:59:59.999+05:30') : null;
  if (from && !isNaN(from)) range.$gte = from;
  if (to && !isNaN(to)) range.$lte = to;
  if (Object.keys(range).length) q.createdAt = range;
  const s = String(qs.search || '').trim().slice(0, 60);
  if (s) {
    const rx = new RegExp(esc(s), 'i');
    const ids = (await User.find({ $or: [{ name: rx }, { email: rx }] }).select('_id').limit(100).lean()).map((u) => u._id);
    q.$or = [{ orderId: rx }, { 'address.name': rx }, { 'address.phone': rx }, { 'address.city': rx }, { user: { $in: ids } }];
  }
  return q;
}

// keep the product's average rating and count in sync with its reviews
async function refreshRating(pid) {
  const [agg] = await Review.aggregate([{ $match: { pid } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  if (agg) await Product.updateOne({ pid }, { rating: Math.round(agg.avg * 10) / 10, reviews: agg.n });
  else await Product.updateOne({ pid }, { reviews: 0 });
}

module.exports = (app) => {
  // who am I + what can I open
  app.get('/api/admin/me', ...staff, wrap(async (req, res) => {
    res.json({ role: req.staff.role, name: req.staff.name, perms: PERMS[req.staff.role] });
  }));

  // ---------- dashboard ----------
  app.get('/api/admin/stats', ...staff, wrap(async (req, res) => {
    const canRev = PERMS[req.staff.role].includes('revenue');
    const live = { status: { $nin: ['Cancelled', 'Pending Payment'] } };
    const since = new Date(istDay(29) + 'T00:00:00+05:30');
    const [users, orders, revenueAgg, byStatus, lowStock, lowCount, dailyAgg, top] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments({ status: { $ne: 'Pending Payment' } }),
      Order.aggregate([{ $match: live }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'Pending Payment' } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.find({ stock: { $lte: 5 } }).sort('stock').limit(8).select('pid name stock').lean(),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.aggregate([
        { $match: { ...live, createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: live }, { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.name' }, qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
        { $sort: { qty: -1 } }, { $limit: 5 },
      ]),
    ]);
    const byDay = Object.fromEntries(dailyAgg.map((d) => [d._id, d]));
    const daily = Array.from({ length: 30 }, (_, i) => {
      const date = istDay(29 - i), d = byDay[date];
      return { date, orders: d ? d.orders : 0, revenue: canRev ? (d ? d.revenue : 0) : null };
    });
    res.json({
      users, orders, revenue: canRev ? revenueAgg[0]?.total || 0 : null, byStatus, lowStock, lowCount, daily,
      top: top.map((t) => ({ productId: t._id, name: t.name, qty: t.qty, revenue: canRev ? t.revenue : null })),
    });
  }));

  // ---------- orders ----------
  app.get('/api/admin/orders', ...staff, wrap(async (req, res) => {
    const { p, l } = paging(req, 15);
    const q = await orderQuery(req.query);
    const [orders, total] = await Promise.all([
      Order.find(q).sort('-createdAt').skip((p - 1) * l).limit(l).populate('user', 'name email').lean(),
      Order.countDocuments(q),
    ]);
    res.json({ orders, total, page: p, pages: Math.ceil(total / l) || 1 });
  }));

  app.get('/api/admin/orders/export', ...mgr, wrap(async (req, res) => {
    const q = await orderQuery(req.query);
    const orders = await Order.find(q).sort('-createdAt').limit(5000).populate('user', 'name email').lean();
    const head = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'City', 'State', 'Pin', 'Items', 'Subtotal', 'Shipping', 'Discount', 'Total', 'Coupon', 'Payment', 'Paid', 'Status'];
    const rows = orders.map((o) => [
      o.orderId, new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      o.user?.name || o.address?.name, o.user?.email, o.address?.phone, o.address?.city, o.address?.state, o.address?.pin,
      (o.items || []).map((i) => `${i.name} x${i.qty}`).join('; '),
      o.subtotal, o.shipping, o.discount, o.total, o.coupon, o.payment === 'cod' ? 'COD' : 'Online', o.paid ? 'Yes' : 'No', o.status,
    ]);
    const csv = [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    await log(req, 'orders.export', orders.length + ' orders');
    res.json({ csv, count: orders.length });
  }));

  app.patch('/api/admin/orders/:orderId', ...mgr, wrap(async (req, res) => {
    const status = req.body.status;
    if (!STATUS.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    // claim the change atomically so a double click cannot restock twice
    const prev = await Order.findOneAndUpdate({ orderId: req.params.orderId, status: { $nin: ['Cancelled', status] } }, { status });
    if (!prev) {
      const cur = await Order.findOne({ orderId: req.params.orderId }).lean();
      if (!cur) return res.status(404).json({ error: 'Order not found' });
      if (cur.status === 'Cancelled') return res.status(400).json({ error: 'Cancelled orders cannot be changed' });
      return res.json({ order: cur }); // already in this status
    }
    if (status === 'Cancelled') await restock(prev);
    if (status === 'Delivered' && prev.payment === 'cod' && !prev.paid) await Order.updateOne({ _id: prev._id }, { paid: true });
    await log(req, 'order.status', prev.orderId, `${prev.status} → ${status}`);
    res.json({ order: await Order.findById(prev._id).populate('user', 'name email').lean() });
  }));

  // ---------- products ----------
  const pickProduct = (b) => ({
    name: b.name, brand: b.brand, category: b.category, price: +b.price, originalPrice: +b.originalPrice || +b.price,
    stock: +b.stock || 0, image: b.image, images: Array.isArray(b.images) && b.images.length ? b.images : [b.image],
    subcategory: b.subcategory || b.category, description: b.description,
    features: Array.isArray(b.features) ? b.features : [], deal: !!b.deal, featured: !!b.featured, badge: b.badge || null,
  });
  app.post('/api/admin/products', ...mgr, wrap(async (req, res) => {
    const last = await Product.findOne().sort('-pid').lean();
    const p = await Product.create({ ...pickProduct(req.body), pid: (last?.pid || 0) + 1, rating: 4.5, reviews: 0 });
    await log(req, 'product.create', p.name, 'pid ' + p.pid);
    res.status(201).json({ product: p });
  }));
  app.put('/api/admin/products/:pid', ...mgr, wrap(async (req, res) => {
    const p = await Product.findOneAndUpdate({ pid: +req.params.pid }, pickProduct(req.body), { new: true });
    if (!p) return res.status(404).json({ error: 'Product not found' });
    await log(req, 'product.update', p.name, 'pid ' + p.pid);
    res.json({ product: p });
  }));
  app.patch('/api/admin/products/:pid/stock', ...mgr, wrap(async (req, res) => {
    const n = Math.floor(Number(req.body.stock));
    if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: 'Enter a valid stock number' });
    const before = await Product.findOneAndUpdate({ pid: +req.params.pid }, { stock: n });
    if (!before) return res.status(404).json({ error: 'Product not found' });
    await log(req, 'product.stock', before.name, `${before.stock} → ${n}`);
    res.json({ ok: true });
  }));
  app.delete('/api/admin/products/:pid', ...mgr, wrap(async (req, res) => {
    const p = await Product.findOneAndDelete({ pid: +req.params.pid });
    if (p) await log(req, 'product.delete', p.name, 'pid ' + p.pid);
    res.json({ ok: true });
  }));

  // ---------- reviews ----------
  app.get('/api/admin/reviews', ...staff, wrap(async (req, res) => {
    const { p, l } = paging(req, 10);
    const q = {};
    const rating = parseInt(req.query.rating);
    if (rating >= 1 && rating <= 5) q.rating = rating;
    const s = String(req.query.search || '').trim().slice(0, 60);
    if (s) { const rx = new RegExp(esc(s), 'i'); q.$or = [{ userName: rx }, { title: rx }, { comment: rx }]; }
    const [rows, total] = await Promise.all([
      Review.find(q).sort('-createdAt').skip((p - 1) * l).limit(l).lean(),
      Review.countDocuments(q),
    ]);
    const prods = await Product.find({ pid: { $in: [...new Set(rows.map((r) => r.pid))] } }).select('pid name').lean();
    const names = Object.fromEntries(prods.map((x) => [x.pid, x.name]));
    res.json({ reviews: rows.map((r) => ({ ...r, productName: names[r.pid] || '#' + r.pid })), total, page: p, pages: Math.ceil(total / l) || 1 });
  }));
  app.delete('/api/admin/reviews/:id', ...staff, wrap(async (req, res) => {
    if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid review' });
    const r = await Review.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'Review not found' });
    await refreshRating(r.pid);
    await log(req, 'review.delete', r.userName || 'Customer', `product #${r.pid}, ${r.rating} stars`);
    res.json({ ok: true });
  }));

  // ---------- users and roles (admin only) ----------
  app.get('/api/admin/users', ...adm, wrap(async (req, res) => {
    const { p, l } = paging(req, 15);
    const q = {};
    if (ROLES.includes(req.query.role)) q.role = req.query.role;
    const s = String(req.query.search || '').trim().slice(0, 60);
    if (s) { const rx = new RegExp(esc(s), 'i'); q.$or = [{ name: rx }, { email: rx }, { phone: rx }]; }
    const [users, total] = await Promise.all([
      User.find(q).select('name email phone role createdAt').sort('-createdAt').skip((p - 1) * l).limit(l).lean(),
      User.countDocuments(q),
    ]);
    res.json({ users, total, page: p, pages: Math.ceil(total / l) || 1 });
  }));
  app.patch('/api/admin/users/:id/role', ...adm, wrap(async (req, res) => {
    const role = req.body.role;
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid user' });
    if (String(req.params.id) === String(req.staff.id)) return res.status(400).json({ error: 'You cannot change your own role' });
    const target = await User.findById(req.params.id).select('name email role');
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'admin' && role !== 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1)
      return res.status(400).json({ error: 'At least one admin is required' });
    await User.updateOne({ _id: target._id }, { role });
    await log(req, 'user.role', target.email, `${target.role} → ${role}`);
    res.json({ ok: true, role });
  }));

  // ---------- activity log (admin only) ----------
  app.get('/api/admin/activity', ...adm, wrap(async (req, res) => {
    const { p, l } = paging(req, 25);
    const [items, total] = await Promise.all([
      Activity.find().sort('-createdAt').skip((p - 1) * l).limit(l).lean(),
      Activity.countDocuments(),
    ]);
    res.json({ items, total, page: p, pages: Math.ceil(total / l) || 1 });
  }));
};