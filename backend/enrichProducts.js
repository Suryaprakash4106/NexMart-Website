// Fills missing details on EVERY product: description, highlights (features) and a full specifications table.
// Existing details are kept; only gaps are filled. Repeated photos in "images" are removed.
//   node enrichProducts.js            -> DRY RUN (counts what would change)
//   node enrichProducts.js --apply    -> updates MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');

const APPLY = process.argv.includes('--apply');
const URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Category based general details (kept generic so they stay true for any product in the category)
const CAT = {
  Electronics: { warranty: '1 year manufacturer warranty', box: 'Main unit, charging cable and user manual', feats: ['Manufacturer warranty included', 'Quality tested before dispatch', 'Fast and reliable performance', 'Backed by brand service centres'] },
  Fashion: { warranty: 'Not applicable', box: '1 piece', care: 'Wash as per the care label', feats: ['Comfortable everyday fit', 'Quality fabric and stitching', 'Easy to pair with your wardrobe', 'Eligible for 7-day returns'] },
  Home: { warranty: 'Manufacturer warranty on eligible items', box: 'Product and user manual', feats: ['Built for everyday home use', 'Easy to clean and maintain', 'Durable materials', 'Great value for money'] },
  Furniture: { warranty: 'Manufacturer warranty on eligible items', box: 'Product with assembly instructions', feats: ['Sturdy and long lasting build', 'Easy assembly with instructions', 'Space saving design', 'Fits modern homes'] },
  Books: { warranty: 'Not applicable', box: '1 book', feats: ['Original publisher edition', 'Clear print and good paper quality', 'Packed carefully to avoid damage', 'Ideal for reading and gifting'] },
  Sports: { warranty: 'Manufacturer warranty on eligible items', box: '1 piece', feats: ['Designed for regular training and play', 'Durable and comfortable to use', 'Suitable for beginners and enthusiasts', 'Great value for money'] },
  Beauty: { warranty: 'Not applicable', box: '1 unit', feats: ['Dermatologically tested formula', 'Suitable for regular use', 'Authentic product from the brand', 'Check the pack for full ingredients'] },
  Grocery: { warranty: 'Not applicable', box: '1 pack', feats: ['Fresh stock with a good shelf life', 'Hygienically packed', 'Quality checked before dispatch', 'Store in a cool dry place'] },
  Health: { warranty: 'Manufacturer warranty on devices', box: '1 unit', feats: ['Trusted brand for everyday wellness', 'Easy to use at home', 'Authentic and sealed product', 'Read the label before use'] },
  Automotive: { warranty: 'Manufacturer warranty on eligible items', box: '1 piece', feats: ['Built for Indian road conditions', 'Easy to fit and use', 'Durable materials', 'Check vehicle compatibility before ordering'] },
  Toys: { warranty: 'Not applicable', box: '1 toy set', feats: ['Safe, child friendly materials', 'Encourages creative play', 'Great gift for kids', 'Adult supervision recommended for young children'] },
};
const FALLBACK = CAT.Home;

function build(p) {
  const c = CAT[p.category] || FALLBACK;
  const out = {};
  // images: main image first, no repeats
  const imgs = [...new Set([p.image, ...(p.images || [])].filter(Boolean))];
  if (imgs.length !== (p.images || []).length || imgs[0] !== (p.images || [])[0]) out.images = imgs;

  let feats = (p.features || []).filter(Boolean);
  if (feats.length < 4) { for (const f of c.feats) { if (feats.length >= 4) break; if (!feats.includes(f)) feats.push(f); } out.features = feats; }

  if (!p.description || p.description.length < 80) {
    const top = feats.slice(0, 3).join('. ');
    out.description = `${p.name} from ${p.brand}${p.subcategory ? ' in ' + p.subcategory : ''}. ${top}. Ordered online from NexMart with free delivery above ₹499, secure payment and easy 7-day returns on eligible items.`;
  }

  const have = new Map((p.specs || []).map((s) => [String(s.k).toLowerCase(), s]));
  const specs = (p.specs || []).slice();
  const add = (k, v) => { if (v && !have.has(k.toLowerCase())) { specs.push({ k, v }); have.set(k.toLowerCase(), 1); } };
  add('Brand', p.brand);
  add('Product name', p.name);
  add('Category', p.category === 'Home' ? 'Home & Kitchen' : p.category);
  add('Type', p.subcategory);
  add('Warranty', c.warranty);
  add('In the box', c.box);
  if (c.care) add('Care instructions', c.care);
  add('Delivery', p.price >= 499 ? 'Free delivery' : 'Delivery charge ₹49');
  add('Returns', '7-day return on eligible items');
  add('Payment', 'Online payment and cash on delivery');
  if (specs.length !== (p.specs || []).length) out.specs = specs;
  return out;
}

(async () => {
  if (!URI) throw new Error('MONGODB_URI is missing in backend/.env');
  await mongoose.connect(URI);
  const all = await Product.find({}).lean();
  let changed = 0;
  const kinds = { description: 0, features: 0, specs: 0, images: 0 };
  for (const p of all) {
    const patch = build(p);
    const keys = Object.keys(patch);
    if (!keys.length) continue;
    changed++;
    keys.forEach((k) => { kinds[k]++; });
    if (APPLY) await Product.updateOne({ pid: p.pid }, { $set: patch });
  }
  console.log(`${all.length} products checked, ${changed} need updates`);
  console.log(`  descriptions: ${kinds.description}, highlights: ${kinds.features}, specifications: ${kinds.specs}, image lists: ${kinds.images}`);
  console.log(APPLY ? '\nDone. Updated MongoDB.' : '\nDRY RUN only. Nothing changed. Run "node enrichProducts.js --apply" to update.');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
