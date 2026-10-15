const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Product, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { wrap, sign, publicUser, calcDiscount } = require('../utils/helpers');
const { makeOrder, restock } = require('../utils/orderService');
const { ADMIN_EMAIL } = process.env;

module.exports = (app) => {
  const RZP_ID = process.env.RAZORPAY_KEY_ID, RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;
  app.post('/api/payments/create', auth, wrap(async (req, res) => {
    if (!RZP_ID || !RZP_SECRET) return res.status(503).json({ error: 'Online payment is not set up yet. Please choose Cash on delivery.' });
    req.body.payment = 'razorpay';
    const r = await makeOrder(req, 'Pending Payment');
    if (r.err) return res.status(r.err[0]).json({ error: r.err[1] });
    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(RZP_ID + ':' + RZP_SECRET).toString('base64') },
      body: JSON.stringify({ amount: r.order.total * 100, currency: 'INR', receipt: r.order.orderId }),
    });
    const rz = await resp.json();
    if (!resp.ok) { await restock(r.order); await Order.deleteOne({ _id: r.order._id }); return res.status(502).json({ error: 'Payment gateway error. Try again.' }); }
    r.order.rzpOrderId = rz.id; await r.order.save();
    res.json({ key: RZP_ID, rzpOrderId: rz.id, amount: rz.amount, orderId: r.order.orderId });
  }));
  app.post('/api/payments/verify', auth, wrap(async (req, res) => {
    const { orderId, razorpay_payment_id, razorpay_signature } = req.body;
    const o = await Order.findOne({ orderId, user: req.auth.id, status: 'Pending Payment' });
    if (!o) return res.status(404).json({ error: 'Order not found' });
    const expected = crypto.createHmac('sha256', RZP_SECRET).update(o.rzpOrderId + '|' + razorpay_payment_id).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ error: 'Payment verification failed' });
    o.status = 'Placed'; o.paid = true; o.rzpPaymentId = razorpay_payment_id; await o.save();
    await User.findByIdAndUpdate(req.auth.id, { cart: [] });
    res.json({ order: o });
  }));
  app.post('/api/payments/cancel', auth, wrap(async (req, res) => {
    const o = await Order.findOne({ orderId: req.body.orderId, user: req.auth.id, status: 'Pending Payment' });
    if (o) { await restock(o); o.status = 'Cancelled'; await o.save(); }
    res.json({ ok: true });
  }));
};
