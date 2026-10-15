const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const COUPONS = { NEXMART15: { pct: 15 }, FIRST10: { pct: 10 }, SAVE20: { pct: 20 }, WELCOME: { pct: 5 }, FLAT100: { flat: 100 } };
const calcDiscount = (code, sub) => {
  const c = COUPONS[(code || '').toUpperCase()];
  if (!c) return 0;
  return c.flat ? Math.min(c.flat, sub) : Math.round(sub * c.pct / 100);
};
const sign = (u) => jwt.sign({ id: u._id, role: u.role }, JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, addresses: u.addresses || [] });
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => { console.error(e); res.status(500).json({ error: 'Server error' }); });

module.exports = { COUPONS, calcDiscount, sign, publicUser, wrap };
