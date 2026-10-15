const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Product, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { wrap, sign, publicUser, calcDiscount } = require('../utils/helpers');
const { makeOrder, restock } = require('../utils/orderService');
const { ADMIN_EMAIL } = process.env;

module.exports = (app) => {
  app.post('/api/auth/register', wrap(async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });
    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be 8+ characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'Email already registered' });
    const role = ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    const user = await User.create({ name, email, phone, role, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  }));

  app.post('/api/auth/login', wrap(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(401).json({ error: 'Wrong email or password' });
    res.json({ token: sign(user), user: publicUser(user) });
  }));
};
