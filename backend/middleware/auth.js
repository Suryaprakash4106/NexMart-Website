const jwt = require('jsonwebtoken');
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

module.exports = { auth, adminOnly };
