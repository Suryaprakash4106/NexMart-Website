// backend/addProducts.js
// Run: node addProducts.js           -> adds new products only (skips duplicates by name)
//      node addProducts.js --dry     -> just prints what would be added
require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');
const raw = require('./nexmart_products.json');

const DRY = process.argv.includes('--dry');
const URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

(async () => {
  if (!URI) throw new Error('Mongo URI env variable not found - check .env variable name');
  await mongoose.connect(URI);

  const last = await Product.findOne().sort({ pid: -1 }).select('pid').lean();
  let nextPid = (last?.pid || 0) + 1;

  const existing = new Set((await Product.find().select('name').lean()).map((p) => p.name.toLowerCase()));

  const docs = [];
  raw.forEach((r, i) => {
    if (existing.has(r.name.toLowerCase())) return;
    const isDeal = i % 4 === 0; // every 4th product is a deal
    const originalPrice = isDeal ? Math.round((r.price * 1.25) / 10) * 10 - 1 : undefined;
    docs.push({
      pid: nextPid++,
      name: r.name,
      brand: r.brand,
      category: r.category,
      price: r.price,
      originalPrice,
      rating: r.rating,
      reviews: r.numReviews,
      image: r.image,
      images: r.images,
      stock: r.stock,
      badge: isDeal ? 'Deal' : undefined,
      deal: isDeal,
      featured: i % 10 === 0,
      features: r.description.split('. ').map((s) => s.replace(/\.$/, '')).filter(Boolean),
      description: r.description,
      specs: [
        { k: 'Brand', v: r.brand },
        { k: 'Category', v: r.category },
      ],
      tags: [r.brand, r.category, ...r.name.split(' ').filter((w) => w.length > 3)].map((t) => t.toLowerCase()),
    });
  });

  console.log(`Ready to add ${docs.length} products (pid ${docs[0]?.pid} - ${docs.at(-1)?.pid})`);
  if (!DRY && docs.length) {
    await Product.insertMany(docs);
    console.log('Done. Total products now:', await Product.countDocuments());
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
