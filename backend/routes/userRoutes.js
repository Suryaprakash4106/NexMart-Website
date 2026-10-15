const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Product, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { wrap, sign, publicUser, calcDiscount } = require('../utils/helpers');
const { makeOrder, restock } = require('../utils/orderService');
const { ADMIN_EMAIL } = process.env;

module.exports = (app) => {
  app.get('/api/users/me', auth, wrap(async (req, res) => {
    const user = await User.findById(req.auth.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: publicUser(user) });
  }));

  app.put('/api/users/me', auth, wrap(async (req, res) => {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const u = await User.findByIdAndUpdate(req.auth.id, { name, phone }, { new: true });
    res.json({ user: publicUser(u) });
  }));
  app.put('/api/users/password', auth, wrap(async (req, res) => {
    const { current, next } = req.body;
    const u = await User.findById(req.auth.id);
    if (!(await bcrypt.compare(current || '', u.password))) return res.status(400).json({ error: 'Current password is wrong' });
    if (!next || next.length < 8) return res.status(400).json({ error: 'New password must be 8+ characters' });
    u.password = await bcrypt.hash(next, 12); await u.save();
    res.json({ ok: true });
  }));
  app.post('/api/users/addresses', auth, wrap(async (req, res) => {
    const a = req.body;
    if (!a.name || !/^\d{10}$/.test(a.phone || '') || !a.addr || !a.city || !/^\d{6}$/.test(a.pin || ''))
      return res.status(400).json({ error: 'Invalid address' });
    const u = await User.findByIdAndUpdate(req.auth.id, { $push: { addresses: { label: a.label, name: a.name, phone: a.phone, addr: a.addr, city: a.city, state: a.state, pin: a.pin } } }, { new: true });
    res.json({ addresses: u.addresses });
  }));
  app.delete('/api/users/addresses/:id', auth, wrap(async (req, res) => {
    const u = await User.findByIdAndUpdate(req.auth.id, { $pull: { addresses: { _id: req.params.id } } }, { new: true });
    res.json({ addresses: u.addresses });
  }));
};
