const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

const auth = (req, res, next) => {
  const h = req.headers.authorization || '';
  try {
    req.auth = jwt.verify(h.replace('Bearer ', ''), JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Please sign in' }); }
};
const adminOnly = (req, res, next) =>
  req.auth.role === 'admin' ? next() : res.status(403).json({ error: 'Admin only' });

// Staff access. Admin always passes; other roles must be listed, e.g. allow('manager').
// allow() with no roles means admin only. The role is read from the database on every
// request, so changing someone's role takes effect immediately (not after the token expires).
const allow = (...roles) => async (req, res, next) => {
  try {
    const u = await User.findById(req.auth.id).select('name role');
    if (!u || (u.role !== 'admin' && !roles.includes(u.role))) return res.status(403).json({ error: 'You do not have access to this' });
    req.staff = { id: u._id, name: u.name, role: u.role };
    next();
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
};

module.exports = { auth, adminOnly, allow };