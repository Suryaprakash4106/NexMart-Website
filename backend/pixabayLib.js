// Shared Pixabay helper used by addMoreProducts.js and fixGallery.js
// Needs PIXABAY_API_KEY in backend/.env
const fs = require('fs');
const path = require('path');

const UA = 'NexMart/1.0 (student project)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const uniq = (a) => [...new Set(a)];
const STOP = new Set(['pack', 'of', 'with', 'for', 'and', 'the', 'size', 'set', 'full', 'new', 'pro', 'max', 'plus', 'classic']);

function createPixabay({ key, outDir, cachePath }) {
  let cache = {};
  try { cache = JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch { cache = {}; }
  fs.mkdirSync(outDir, { recursive: true });

  async function search(query) {
    const c = cache[query];
    if (c && Date.now() - c.time < 7 * 24 * 3600 * 1000) return c.hits;
    const url = 'https://pixabay.com/api/?' + new URLSearchParams({
      key, q: query.slice(0, 100), image_type: 'photo', safesearch: 'true', per_page: '30', order: 'popular',
    });
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429) { console.log('  rate limit hit, waiting 60s...'); await sleep(61000); continue; }
      if (!res.ok) throw new Error('Pixabay HTTP ' + res.status + ' for "' + query + '"');
      const data = await res.json();
      const hits = (data.hits || []).map((h) => ({ id: h.id, url: h.webformatURL, big: h.largeImageURL })).filter((h) => h.url);
      cache[query] = { time: Date.now(), hits };
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
      await sleep(1500);
      return hits;
    }
    throw new Error('Pixabay kept rate-limiting "' + query + '"');
  }

  // saves the photo into uploads/products and returns the public path
  async function download(hit, label) {
    const file = slug(label) + '-' + hit.id + 'w.jpg';
    const full = path.join(outDir, file);
    if (!fs.existsSync(full)) {
      const res = await fetch(hit.url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error('download failed, HTTP ' + res.status);
      fs.writeFileSync(full, Buffer.from(await res.arrayBuffer()));
      await sleep(400);
    }
    return '/uploads/products/' + file;
  }

  return { search, download };
}

// search texts for a product, best first
function candidates(p) {
  const brandWords = (p.brand || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  const words = (p.name || '').replace(/\(.*?\)/g, ' ').replace(/[^A-Za-z\s]/g, ' ').split(/\s+/).filter(Boolean)
    .filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()) && !brandWords.includes(w.toLowerCase()));
  const list = [];
  if (p.term) list.push(p.term);
  if (words.length) list.push(words.slice(0, 3).join(' '));
  if (words.length > 2) list.push(words.slice(-2).join(' '));
  if (words.length > 1) list.push(words[words.length - 1]);
  if (p.subcategory) list.push(String(p.subcategory).replace(/[^A-Za-z ]/g, ' ').trim());
  return uniq(list.filter(Boolean));
}

module.exports = { createPixabay, candidates, sleep, slug, uniq };
