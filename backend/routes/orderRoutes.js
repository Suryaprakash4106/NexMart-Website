const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Product, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { wrap, sign, publicUser, calcDiscount } = require('../utils/helpers');
const { makeOrder, restock } = require('../utils/orderService');
const { ADMIN_EMAIL } = process.env;

module.exports = (app) => {
  app.post('/api/orders', auth, wrap(async (req, res) => {
    req.body.payment = 'cod';
    const r = await makeOrder(req, 'Placed');
    if (r.err) return res.status(r.err[0]).json({ error: r.err[1] });
    await User.findByIdAndUpdate(req.auth.id, { cart: [] });
    res.status(201).json({ order: r.order });
  }));

  app.get('/api/orders', auth, wrap(async (req, res) => {
    const orders = await Order.find({ user: req.auth.id, status: { $ne: 'Pending Payment' } }).sort('-createdAt').lean();
    res.json({ orders });
  }));

  app.post('/api/orders/:orderId/cancel', auth, wrap(async (req, res) => {
    const o = await Order.findOne({ orderId: req.params.orderId, user: req.auth.id });
    if (!o || !['Placed', 'Processing'].includes(o.status)) return res.status(400).json({ error: 'This order cannot be cancelled' });
    await restock(o); o.status = 'Cancelled'; await o.save();
    res.json({ order: o });
  }));
};
