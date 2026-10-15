const { Product, Order, Review, User } = require('../models');
const { auth } = require('../middleware/auth');
const { wrap } = require('../utils/helpers');

// keep the product's average rating and count in sync with its reviews
async function refreshRating(pid) {
  const [agg] = await Review.aggregate([{ $match: { pid } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  if (agg) await Product.updateOne({ pid }, { rating: Math.round(agg.avg * 10) / 10, reviews: agg.n });
  else await Product.updateOne({ pid }, { reviews: 0 });
}

module.exports = (app) => {
  app.get('/api/products/:pid/reviews', wrap(async (req, res) => {
    const pid = +req.params.pid;
    const reviews = await Review.find({ pid }).sort('-createdAt').limit(100).lean();
    const hist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { hist[r.rating]++; });
    const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
    res.json({ reviews, hist, count: reviews.length, avg: Math.round(avg * 10) / 10 });
  }));

  app.post('/api/products/:pid/reviews', auth, wrap(async (req, res) => {
    const pid = +req.params.pid;
    const { rating, title = '', comment = '' } = req.body;
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Choose a rating from 1 to 5' });
    if (comment.length > 2000 || title.length > 120) return res.status(400).json({ error: 'Review is too long' });
    if (!(await Product.exists({ pid }))) return res.status(404).json({ error: 'Product not found' });
    const user = await User.findById(req.auth.id);
    const verified = !!(await Order.exists({ user: req.auth.id, 'items.productId': pid, status: { $nin: ['Cancelled', 'Pending Payment'] } }));
    const review = await Review.findOneAndUpdate(
      { pid, user: req.auth.id },
      { pid, user: req.auth.id, userName: user.name, rating: Math.round(rating), title, comment, verified, sample: false },
      { upsert: true, new: true, setDefaultsOnInsert: true });
    await refreshRating(pid);
    res.status(201).json({ review });
  }));

  app.delete('/api/products/:pid/reviews', auth, wrap(async (req, res) => {
    const pid = +req.params.pid;
    await Review.deleteOne({ pid, user: req.auth.id });
    await refreshRating(pid);
    res.json({ ok: true });
  }));
};
