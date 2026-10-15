// Finds products whose MAIN image does not load (dead URL, empty, missing file) and fixes them.
//  - if the product has another image that loads, that one becomes the main image
//  - otherwise downloads a matching photo from Pixabay into backend/uploads/products
// Only image / images fields are changed.
//
//   node fixMissingImages.js            -> DRY RUN (tests image URLs only, no Pixabay calls, no DB writes)
//   node fixMissingImages.js --apply    -> fixes them
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
const UA = 'NexMart/1.0 (student project)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uniq = (a) => [...new Set(a)];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// If a product still gets a bad photo, put a better search text here:  pid -> 'search words'
const OVERRIDES = { 297: 'car camera' };
const STOP = new Set(['pack', 'of', 'with', 'for', 'and', 'the', 'size', 'set', 'full', 'new', 'pro', 'max', 'plus']);

async function loads(url) {
  if (!url) return false;
  if (url.startsWith('/uploads/')) return fs.existsSync(path.join(__dirname, url));
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(12000) });
    const ok = res.ok && /image|octet-stream/i.test(res.headers.get('content-type') || '');
    try { await res.body.cancel(); } catch { /* ignore */ }
    return ok;
  } catch { return false; }
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

// Search texts to try, best first: "Pulse Oximeter", "Oximeter", subcategory
function candidates(p) {
  const brandWords = (p.brand || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  const words = (p.name || '').replace(/\(.*?\)/g, ' ').replace(/[^A-Za-z\s]/g, ' ').split(/\s+/).filter(Boolean)
    .filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()) && !brandWords.includes(w.toLowerCase()));
  const list = [];
  if (OVERRIDES[p.pid]) list.push(OVERRIDES[p.pid]);
  if (words.length) list.push(words.slice(0, 3).join(' '));
  if (words.length > 2) list.push(words.slice(-2).join(' '));
  if (words.length > 1) list.push(words[words.length - 1]);
  if (p.subcategory) list.push(String(p.subcategory).replace(/[^A-Za-z ]/g, ' ').trim());
  return uniq(list.filter(Boolean));
}

function loadCache() { try { return JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch { return {}; } }

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
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
    await sleep(1500);
    return hits;
  }
  throw new Error('Pixabay kept rate-limiting "' + query + '"');
}

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

(async () => {
  if (APPLY && !KEY) throw new Error('PIXABAY_API_KEY is missing in backend/.env');
  await mongoose.connect(process.env.MONGODB_URI);
  const all = await Product.find({}, 'pid name brand category subcategory image images').lean();
  console.log(`Testing the main image of ${all.length} products (about a minute)...`);

  const tested = await pool(all, 10, async (p) => ({ p, ok: await loads(p.image) }));
  const failed = tested.filter((x) => !x.ok).map((x) => x.p);
  console.log(`${failed.length} products have a main image that does not load\n`);
  if (!failed.length) { console.log('Nothing to fix.'); process.exit(0); }

  const plan = [];
  for (const p of failed) {
    const others = uniq((p.images || []).filter((u) => u && u !== p.image));
    const good = [];
    for (const u of others) if (await loads(u)) good.push(u);
    plan.push({ p, good, queries: candidates(p) });
    console.log(`#${p.pid}  ${p.name}  [${p.category}]  -> ` +
      (good.length ? `use its other image (${good.length} ok)` : `Pixabay search: ${candidates(p).join(' | ')}`));
  }

  if (!APPLY) { console.log('\nDRY RUN only. Nothing changed. Run "node fixMissingImages.js --apply" to fix them.'); process.exit(0); }

  fs.mkdirSync(OUT, { recursive: true });
  const cache = loadCache();
  let fixed = 0, skipped = 0;
  for (const { p, good, queries } of plan) {
    try {
      let final = good;
      if (!good.length) {
        let hits = [], used = '';
        for (const q of queries) { hits = await search(q, cache); if (hits.length) { used = q; break; } }
        if (!hits.length) { console.log(`#${p.pid} no Pixabay results (${queries.join(' | ')}), skipped`); skipped++; continue; }
        final = [await download(hits[p.pid % hits.length], used)];
      }
      await Product.updateOne({ pid: p.pid }, { $set: { image: final[0], images: final } });
      console.log(`#${p.pid} fixed`);
      fixed++;
    } catch (e) { console.log(`#${p.pid} failed: ${e.message}`); skipped++; }
  }
  console.log(`\nDone. Fixed ${fixed}, skipped ${skipped}.`);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
