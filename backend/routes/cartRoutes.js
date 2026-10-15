const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Product, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { wrap, sign, publicUser, calcDiscount } = require('../utils/helpers');
const { makeOrder, restock } = require('../utils/orderService');
const { ADMIN_EMAIL } = process.env;

module.exports = (app) => {
  app.get('/api/cart', auth, wrap(async (req, res) => {
    const u = await User.findById(req.auth.id).lean();
    res.json({ cart: u.cart || [] });
  }));
  app.put('/api/cart', auth, wrap(async (req, res) => {
    const cart = (Array.isArray(req.body.cart) ? req.body.cart : [])
      .map((i) => ({ productId: +i.productId, qty: Math.max(1, Math.min(20, +i.qty || 1)) }));
    await User.findByIdAndUpdate(req.auth.id, { cart });
    res.json({ cart });
  }));
  app.get('/api/wishlist', auth, wrap(async (req, res) => {
    const u = await User.findById(req.auth.id).lean();
    res.json({ wishlist: u.wishlist || [] });
  }));
  app.put('/api/wishlist', auth, wrap(async (req, res) => {
    const wishlist = [...new Set((req.body.wishlist || []).map(Number))];
    await User.findByIdAndUpdate(req.auth.id, { wishlist });
    res.json({ wishlist });
  }));


  app.post('/api/coupons/check', auth, wrap(async (req, res) => {
    const sub = +req.body.subtotal || 0;
    const discount = calcDiscount(req.body.code, sub);
    if (!discount) return res.status(400).json({ error: 'Invalid coupon' });
    res.json({ discount });
  }));
};
