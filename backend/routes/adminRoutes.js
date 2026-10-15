const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Product, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { wrap, sign, publicUser, calcDiscount } = require('../utils/helpers');
const { makeOrder, restock } = require('../utils/orderService');
const { ADMIN_EMAIL } = process.env;

module.exports = (app) => {
  app.get('/api/admin/stats', auth, adminOnly, wrap(async (req, res) => {
    const [users, orders, revenueAgg, byStatus, lowStock] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.find({ stock: { $lte: 5 } }).select('pid name stock').lean(),
    ]);
    res.json({ users, orders, revenue: revenueAgg[0]?.total || 0, byStatus, lowStock });
  }));
  app.get('/api/admin/orders', auth, adminOnly, wrap(async (req, res) => {
    const orders = await Order.find().sort('-createdAt').limit(200).populate('user', 'name email').lean();
    res.json({ orders });
  }));
  app.patch('/api/admin/orders/:orderId', auth, adminOnly, wrap(async (req, res) => {
    const order = await Order.findOneAndUpdate({ orderId: req.params.orderId }, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  }));
  app.get('/api/admin/users', auth, adminOnly, wrap(async (req, res) => {
    const users = await User.find().select('-password -cart -wishlist').sort('-createdAt').lean();
    res.json({ users });
  }));


  const pickProduct = (b) => ({
    name: b.name, brand: b.brand, category: b.category, price: +b.price, originalPrice: +b.originalPrice || +b.price,
    stock: +b.stock || 0, image: b.image, images: Array.isArray(b.images) && b.images.length ? b.images : [b.image],
    subcategory: b.subcategory || b.category, description: b.description,
    features: Array.isArray(b.features) ? b.features : [], deal: !!b.deal, featured: !!b.featured, badge: b.badge || null,
  });
  app.post('/api/admin/products', auth, adminOnly, wrap(async (req, res) => {
    const last = await Product.findOne().sort('-pid').lean();
    const p = await Product.create({ ...pickProduct(req.body), pid: (last?.pid || 0) + 1, rating: 4.5, reviews: 0 });
    res.status(201).json({ product: p });
  }));
  app.put('/api/admin/products/:pid', auth, adminOnly, wrap(async (req, res) => {
    const p = await Product.findOneAndUpdate({ pid: +req.params.pid }, pickProduct(req.body), { new: true });
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: p });
  }));
  app.delete('/api/admin/products/:pid', auth, adminOnly, wrap(async (req, res) => {
    await Product.deleteOne({ pid: +req.params.pid });
    res.json({ ok: true });
  }));
};
