// Adds believable demo reviews to every product so each one shows stars, a rating and customer reviews.
// Demo reviews are marked sample:true, so real customer reviews are never touched.
//   node seedReviews.js                -> DRY RUN (shows how many reviews would be added)
//   node seedReviews.js --apply        -> adds reviews and updates each product's rating and review count
//   node seedReviews.js --apply --reset -> first removes old demo reviews, then creates fresh ones
require('dotenv').config();
const mongoose = require('mongoose');
const { Product, Review } = require('./models');
const { makeReviews } = require('./reviewGen');

const APPLY = process.argv.includes('--apply');
const RESET = process.argv.includes('--reset');
const URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const MIN = 5; // products with fewer reviews than this get demo reviews

(async () => {
  if (!URI) throw new Error('MONGODB_URI is missing in backend/.env');
  await mongoose.connect(URI);
  if (APPLY && RESET) { const d = await Review.deleteMany({ sample: true }); console.log(`Removed ${d.deletedCount} old demo reviews.`); }

  const products = await Product.find({}, 'pid name category rating reviews').lean();
  const counts = Object.fromEntries((await Review.aggregate([{ $group: { _id: '$pid', n: { $sum: 1 } } }])).map((x) => [x._id, x.n]));
  let added = 0, touched = 0;
  const batch = [];
  for (const p of products) {
    const have = counts[p.pid] || 0;
    if (have >= MIN) continue;
    const want = MIN + (p.pid % 4) - have; // 5 to 8 reviews per product
    batch.push(...makeReviews(p, want));
    added += want; touched++;
  }
  console.log(`${products.length} products, ${touched} need reviews, ${added} reviews to add.`);
  if (!APPLY) { console.log('\nDRY RUN only. Nothing changed. Run "node seedReviews.js --apply" to add them.'); process.exit(0); }

  if (batch.length) await Review.insertMany(batch);
  // refresh rating + review count for every product from the real review data
  const agg = await Review.aggregate([{ $group: { _id: '$pid', avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  for (const a of agg) await Product.updateOne({ pid: a._id }, { rating: Math.round(a.avg * 10) / 10, reviews: a.n });
  console.log(`Done. Added ${batch.length} reviews and refreshed ratings for ${agg.length} products.`);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
