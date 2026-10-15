const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Product, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { wrap, sign, publicUser, calcDiscount } = require('../utils/helpers');
const { makeOrder, restock } = require('../utils/orderService');
const { ADMIN_EMAIL } = process.env;

module.exports = (app) => {
  app.get('/api/products', wrap(async (req, res) => {
    const { category, q, deal, featured, sort, maxPrice, minRating } = req.query;
    const f = {};
    if (category) f.category = category;
    if (deal === 'true') f.deal = true;
    if (featured === 'true') f.featured = true;
    if (maxPrice) f.price = { $lte: +maxPrice };
    if (minRating) f.rating = { $gte: +minRating };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      f.$or = [{ name: rx }, { brand: rx }, { category: rx }];
    }
    const sorts = { 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, rating: { rating: -1 }, default: { pid: 1 } };
    const products = await Product.find(f).sort(sorts[sort] || sorts.default).lean();
    res.json({ products: products.map((p) => ({ ...p, id: p.pid })) });
  }));

  app.get('/api/products/:pid', wrap(async (req, res) => {
    const p = await Product.findOne({ pid: +req.params.pid }).lean();
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: { ...p, id: p.pid } });
  }));
};
