// Adds the 108 new products from moreProducts.js (with description, highlights, specs, 3 photos each).
//   node addMoreProducts.js            -> DRY RUN (lists what would be added)
//   node addMoreProducts.js --apply    -> adds them and downloads photos from Pixabay
// Products whose name already exists are skipped, so it is safe to run twice.
// Needs in backend/.env:  MONGODB_URI=...   PIXABAY_API_KEY=...
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const { Product } = require('./models');
const { createPixabay } = require('./pixabayLib');
const LIST = require('./moreProducts');

const APPLY = process.argv.includes('--apply');
const KEY = process.env.PIXABAY_API_KEY;
const URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const mrp = (price, i) => Math.round((price * (1.12 + (i % 5) * 0.07)) / 10) * 10 - 1;

(async () => {
  if (!URI) throw new Error('MONGODB_URI is missing in backend/.env');
  if (APPLY && !KEY) throw new Error('PIXABAY_API_KEY is missing in backend/.env');
  await mongoose.connect(URI);
  const last = await Product.findOne().sort({ pid: -1 }).select('pid').lean();
  let pid = (last && last.pid) || 0;
  const have = new Set((await Product.find({}, 'name').lean()).map((p) => p.name.toLowerCase()));
  const todo = LIST.filter((r) => !have.has(r[0].toLowerCase()));
  console.log(`${LIST.length} products in the list, ${LIST.length - todo.length} already exist, ${todo.length} to add.\n`);

  if (!APPLY) {
    todo.forEach((r) => console.log(`${r[2]} / ${r[3]}  ${r[0]}  Rs ${r[4]}`));
    console.log('\nDRY RUN only. Nothing changed. Run "node addMoreProducts.js --apply" to add them.');
    process.exit(0);
  }

  const px = createPixabay({ key: KEY, outDir: path.join(__dirname, 'uploads', 'products'), cachePath: path.join(__dirname, 'uploads', 'pixabay-cache2.json') });
  const usedByQuery = {};
  let added = 0, noPhoto = 0;
  for (let i = 0; i < todo.length; i++) {
    const [name, brand, category, subcategory, price, term, feats, specs] = todo[i];
    const features = feats.split(';').map((s) => s.trim());
    const specList = specs.split('|').map((s) => { const k = s.indexOf(':'); return { k: s.slice(0, k).trim(), v: s.slice(k + 1).trim() }; });
    let images = [];
    try {
      for (const q of [term, subcategory.replace(/[^A-Za-z ]/g, ' ')]) {
        const hits = await px.search(q);
        if (!hits.length) continue;
        const used = (usedByQuery[q] = usedByQuery[q] || new Set());
        const fresh = hits.filter((h) => !used.has(h.id));
        const pool = fresh.length >= 3 ? fresh : hits;
        for (let k = 0; k < pool.length && images.length < 3; k++) {
          const h = pool[k];
          used.add(h.id);
          images.push(await px.download(h, name));
        }
        if (images.length >= 3) break;
      }
    } catch (e) { console.log(`  photo problem for "${name}": ${e.message}`); }
    if (!images.length) { noPhoto++; images = ['/uploads/products/placeholder.jpg']; }
    pid += 1;
    const isDeal = i % 3 === 0;
    await Product.create({
      pid, name, brand, category, subcategory, price, originalPrice: mrp(price, i),
      rating: 0, reviews: 0, stock: 20 + ((i * 7) % 90), deal: isDeal, featured: i % 9 === 0,
      image: images[0], images,
      description: `${name} by ${brand}. ${features[0]}. ${features[1]}. ${features[2]}.`,
      features, specs: specList,
    });
    added++;
    console.log(`#${pid} ${name} (${images.length} photos)`);
  }
  console.log(`\nDone. Added ${added}${noPhoto ? ', ' + noPhoto + ' without a photo (run fixGallery.js later)' : ''}.`);
  console.log('Next: node enrichProducts.js --apply, node fixGallery.js --apply, node seedReviews.js --apply');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
