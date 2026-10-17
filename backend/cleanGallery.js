// Removes the extra Pixabay photos that were added to product galleries (fixGallery.js / addMoreProducts.js)
// because broad searches brought unrelated pictures (a jet for a charger, a hospital room for a book...).
// Each product keeps its MAIN photo plus any older photos that did not come from those two scripts.
// Photo files on disk are NOT deleted, so nothing is lost.
//   node cleanGallery.js            -> DRY RUN (shows how many products change)
//   node cleanGallery.js --apply    -> updates MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');

const APPLY = process.argv.includes('--apply');
const URI = process.env.MONGODB_URI || process.env.MONGO_URI;
// photos downloaded by pixabayLib.js end with "<pixabay id>w.jpg"
const added = (u) => /-\d+w\.jpg$/.test(u);

(async () => {
  if (!URI) throw new Error('MONGODB_URI is missing in backend/.env');
  await mongoose.connect(URI);
  const all = await Product.find({}, 'pid name image images').lean();
  let changed = 0, removed = 0;
  for (const p of all) {
    const list = [...new Set([p.image, ...(p.images || [])].filter(Boolean))];
    const keep = list.filter((u, i) => i === 0 || !added(u));
    if (keep.length === list.length) continue;
    changed++; removed += list.length - keep.length;
    if (APPLY) await Product.updateOne({ pid: p.pid }, { $set: { image: keep[0], images: keep } });
  }
  console.log(`${all.length} products checked, ${changed} products change, ${removed} extra photos removed from galleries.`);
  console.log(APPLY ? '\nDone. Updated MongoDB.' : '\nDRY RUN only. Nothing changed. Run "node cleanGallery.js --apply" to clean the galleries.');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
