// Makes sure every product has at least 3 different photos (main photo + extra angles/photos) for the product page gallery and 360 view.
// Downloads extra photos from Pixabay into backend/uploads/products. Existing photos are never removed.
//   node fixGallery.js                  -> DRY RUN (how many products need photos, no API calls)
//   node fixGallery.js --apply          -> downloads and updates MongoDB
//   node fixGallery.js --apply --limit 40   -> only the first 40 products (good for testing)
// Needs in backend/.env:  MONGODB_URI=...   PIXABAY_API_KEY=...
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Product } = require('./models');
const { createPixabay, candidates, uniq } = require('./pixabayLib');

// NOTE: broad Pixabay searches bring unrelated pictures (a jet for a charger, a hospital room for a book).
// Use cleanGallery.js to remove them. This script now needs --force to run.
if (!process.argv.includes('--force')) { console.log('fixGallery.js is switched off because it added unrelated photos. Use cleanGallery.js instead (or add --force to run this anyway).'); process.exit(0); }
const APPLY = process.argv.includes('--apply');
const li = process.argv.indexOf('--limit');
const LIMIT = li > -1 ? +process.argv[li + 1] : Infinity;
const WANT = 3;
const KEY = process.env.PIXABAY_API_KEY;
const URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const OUT = path.join(__dirname, 'uploads', 'products');

const okLocal = (u) => !u.startsWith('/uploads/') || fs.existsSync(path.join(__dirname, u));

(async () => {
  if (!URI) throw new Error('MONGODB_URI is missing in backend/.env');
  if (APPLY && !KEY) throw new Error('PIXABAY_API_KEY is missing in backend/.env');
  await mongoose.connect(URI);
  const all = await Product.find({}, 'pid name brand category subcategory image images').lean();
  const need = all.map((p) => {
    const imgs = uniq([p.image, ...(p.images || [])].filter(Boolean)).filter(okLocal);
    return { p, imgs };
  }).filter((x) => x.imgs.length < WANT).slice(0, LIMIT);
  console.log(`${all.length} products, ${need.length} have fewer than ${WANT} different photos.`);
  if (!APPLY) { console.log('\nDRY RUN only. Nothing changed. Run "node fixGallery.js --apply" to add photos.'); process.exit(0); }

  const px = createPixabay({ key: KEY, outDir: OUT, cachePath: path.join(__dirname, 'uploads', 'pixabay-cache2.json') });
  const usedByQuery = {};
  let done = 0, skipped = 0;
  for (const { p, imgs } of need) {
    try {
      const out = imgs.slice();
      const taken = new Set(out.map((u) => (u.match(/-(\d+)w?\.jpg$/) || [])[1]).filter(Boolean));
      for (const q of candidates(p)) {
        if (out.length >= WANT) break;
        const hits = await px.search(q);
        const used = (usedByQuery[q] = usedByQuery[q] || new Set());
        const pool = [...hits.filter((h) => !used.has(h.id)), ...hits.filter((h) => used.has(h.id))];
        for (const h of pool) {
          if (out.length >= WANT) break;
          if (taken.has(String(h.id))) continue;
          used.add(h.id); taken.add(String(h.id));
          out.push(await px.download(h, p.name));
        }
      }
      if (out.length > imgs.length) {
        await Product.updateOne({ pid: p.pid }, { $set: { image: out[0], images: out } });
        console.log(`#${p.pid} ${p.name}: ${imgs.length} -> ${out.length} photos`);
        done++;
      } else { console.log(`#${p.pid} ${p.name}: no new photos found, skipped`); skipped++; }
    } catch (e) { console.log(`#${p.pid} failed: ${e.message}`); skipped++; }
  }
  console.log(`\nDone. Updated ${done}, skipped ${skipped}.`);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
