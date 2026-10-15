const { Product, Order } = require('../models');
const { calcDiscount } = require('./helpers');

const restock = (o) => Promise.all(o.items.map((l) => Product.updateOne({ pid: l.productId }, { $inc: { stock: l.qty } })));
async function makeOrder(req, status) {
  const { items, address: a = {}, coupon, payment } = req.body;
  if (!Array.isArray(items) || !items.length) return { err: [400, 'Cart is empty'] };
  if (!a.name || !/^\d{10}$/.test(a.phone || '') || !a.addr || !a.city || !/^\d{6}$/.test(a.pin || ''))
    return { err: [400, 'Invalid delivery address'] };
  const lines = [];
  for (const it of items) {
    const qty = Math.max(1, Math.min(20, +it.qty || 1));
    const p = await Product.findOneAndUpdate({ pid: +it.productId, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true });
    if (!p) { await restock({ items: lines }); return { err: [409, `Not enough stock for product #${it.productId}`] }; }
    lines.push({ productId: p.pid, name: p.name, price: p.price, qty, image: p.image });
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const discount = calcDiscount(coupon, subtotal);
  const order = await Order.create({
    orderId: 'NX' + Date.now().toString(36).toUpperCase(), user: req.auth.id, items: lines,
    subtotal, shipping, discount, total: subtotal + shipping - discount, coupon: coupon || '',
    address: a, payment: payment || 'cod', status,
  });
  return { order };
}

module.exports = { makeOrder, restock };
