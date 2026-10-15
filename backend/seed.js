// Builds the full product catalog (about 190 products) and sample reviews in MongoDB.
// Needs internet (downloads the free DummyJSON catalog). Run once:  npm run seed
// Optional: put your old app.js here as old-app.js to also keep your Indian-brand Books, Toys, Health, Grocery and Automotive items.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Product, Review } = require('./models');
const { buildCatalog } = require('./catalog');

function loadOld() {
  const file = path.join(__dirname, 'old-app.js');
  if (!fs.existsSync(file)) { console.log('old-app.js not found, skipping your old products'); return []; }
  const src = fs.readFileSync(file, 'utf8');
  const a = src.indexOf('const PRODUCTS = ['), b = src.indexOf('];', a);
  return new Function(src.slice(a, b + 2).replace('const PRODUCTS =', 'return'))();
}

(async () => {
  console.log('Downloading catalog...');
  const res = await fetch('https://dummyjson.com/products?limit=0');
  if (!res.ok) throw new Error('Could not download the catalog (HTTP ' + res.status + '). Check your internet and try again.');
  const { products: dummy } = await res.json();
  const items = buildCatalog(dummy, loadOld());

  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Review.deleteMany({});
  const docs = await Product.insertMany(items.map((x) => x.product));
  const reviews = [];
  docs.forEach((d, i) => items[i].reviews.forEach((r) => reviews.push({ ...r, pid: d.pid })));
  if (reviews.length) await Review.insertMany(reviews);

  const count = {};
  docs.forEach((d) => { count[d.category] = (count[d.category] || 0) + 1; });
  console.log(`Seeded ${docs.length} products and ${reviews.length} sample reviews`, count);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
