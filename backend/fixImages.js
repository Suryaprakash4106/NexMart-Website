// Fixes products whose images are broken ("...?lock=N" placeholder URLs).
// Downloads matching photos from Pixabay into backend/uploads/products and updates MongoDB.
// Only the image / images fields of the broken products are changed. Nothing else is touched.
//
// Run inside the backend folder:
//   node fixImages.js            -> DRY RUN: lists what would change (no Pixabay calls, no DB writes)
//   node fixImages.js --apply    -> downloads the images and updates the products
//
// Needs in backend/.env:  MONGODB_URI=...   PIXABAY_API_KEY=...
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Product } = require('./models');

const APPLY = process.argv.includes('--apply');
const KEY = process.env.PIXABAY_API_KEY;
const OUT = path.join(__dirname, 'uploads', 'products');
const CACHE = path.join(__dirname, 'uploads', 'pixabay-cache.json');
const BROKEN = /[?&]lock=\d+/;
const UA = 'NexMart/1.0 (student project)';
const OVERRIDE = { dashcam: 'car camera' }; // keywords that returned no Pixabay results -> use this instead
const PER_PRODUCT = Number(process.env.IMAGES_PER_PRODUCT || 1); // keep low: Pixabay forbids mass downloads
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uniq = (a) => [...new Set(a)];

// "https://host/640/640/computer,mouse?lock=24"  ->  "computer mouse"
function keywordOf(url) {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(seg).replace(/[,+_-]+/g, ' ').trim();
  } catch { return ''; }
}
const lockOf = (url) => Number((String(url).match(/lock=(\d+)/) || [])[1] || 0);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch { return {}; }
}

// One Pixabay search per distinct keyword. Results are cached for 24 hours (Pixabay rule).
async function search(query, cache) {
  const c = cache[query];
  if (c && Date.now() - c.time < 24 * 3600 * 1000) return c.hits;
  const url = 'https://pixabay.com/api/?' + new URLSearchParams({
    key: KEY, q: query.slice(0, 100), image_type: 'photo', safesearch: 'true', per_page: '20', order: 'popular',
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status === 429) { console.log('  rate limit hit, waiting 60s...'); await sleep(61000); continue; }
    if (!res.ok) throw new Error('Pixabay HTTP ' + res.status + ' for "' + query + '"');
    const data = await res.json();
    const hits = (data.hits || []).map((h) => ({ id: h.id, url: h.largeImageURL })).filter((h) => h.url);
    cache[query] = { time: Date.now(), hits };
    fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
    await sleep(1500);
    return hits;
  }
  throw new Error('Pixabay kept rate-limiting "' + query + '"');
}

// Downloads to our own server (Pixabay does not allow hotlinking).
async function download(hit, query) {
  const file = slug(query) + '-' + hit.id + '.jpg';
  const full = path.join(OUT, file);
  if (!fs.existsSync(full)) {
    const res = await fetch(hit.url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error('download failed, HTTP ' + res.status);
    fs.writeFileSync(full, Buffer.from(await res.arrayBuffer()));
    await sleep(500);
  }
  return '/uploads/products/' + file;
}

const pick = (hits, start, n) => {
  const out = [];
  for (let i = 0; out.length < n && i < hits.length; i++) out.push(hits[(start + i) % hits.length]);
  return out;
};

(async () => {
  if (APPLY && !KEY) throw new Error('PIXABAY_API_KEY is missing in backend/.env');
  await mongoose.connect(process.env.MONGODB_URI);

  const all = await Product.find({}, 'pid name subcategory image images').lean();
  const bad = all.filter((p) => BROKEN.test(p.image || '') || (p.images || []).some((u) => BROKEN.test(u)));
  console.log(`${bad.length} of ${all.length} products have broken ?lock= images\n`);
  if (!bad.length) { console.log('Nothing to fix.'); process.exit(0); }

  const plan = bad.map((p) => {
    const urls = uniq([p.image, ...(p.images || [])].filter(Boolean));
    const brokenUrls = urls.filter((u) => BROKEN.test(u));
    const good = urls.filter((u) => !BROKEN.test(u));
    const kw = keywordOf(brokenUrls[0]) || p.subcategory || p.name;
    const query = OVERRIDE[kw] || kw;
    return { p, brokenUrls, good, query };
  });

  const byQuery = {};
  plan.forEach((x) => { byQuery[x.query] = (byQuery[x.query] || 0) + 1; });
  plan.forEach((x) => console.log(`#${x.p.pid}  ${x.p.name}   -> search "${x.query}"  (${x.brokenUrls.length} broken, ${x.good.length} ok)`));
  console.log(`\nDistinct Pixabay searches needed: ${Object.keys(byQuery).length}`);
  Object.entries(byQuery).forEach(([q, n]) => console.log(`  "${q}"  x${n} products`));

  if (!APPLY) {
    console.log('\nDRY RUN only. Nothing changed. Run "node fixImages.js --apply" to fix them.');
    process.exit(0);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const cache = loadCache();
  let fixed = 0, skipped = 0;

  for (const { p, brokenUrls, good, query } of plan) {
    try {
      let downloaded = [];
      if (!good.length) {
        const hits = await search(query, cache);
        if (!hits.length) { console.log(`#${p.pid} no Pixabay results for "${query}", skipped`); skipped++; continue; }
        const want = PER_PRODUCT;
        const chosen = pick(hits, lockOf(brokenUrls[0]) % hits.length, want);
        for (const h of chosen) downloaded.push(await download(h, query));
      }
      const final = uniq([...good, ...downloaded]);
      if (!final.length) { skipped++; continue; }
      await Product.updateOne({ pid: p.pid }, { $set: { image: final[0], images: final } });
      console.log(`#${p.pid} fixed (${final.length} images)`);
      fixed++;
    } catch (e) {
      console.log(`#${p.pid} failed: ${e.message}`);
      skipped++;
    }
  }
  console.log(`\nDone. Fixed ${fixed}, skipped ${skipped}.`);
  console.log('Images are saved in backend/uploads/products');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
