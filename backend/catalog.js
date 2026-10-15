// Turns the free DummyJSON catalog (matching white-background photos, specs, sample reviews)
// plus your old Indian-brand products into NexMart products. No database or network code here.
const USD_TO_INR = 85;
const CAT_ORDER = ['Electronics', 'Fashion', 'Home', 'Furniture', 'Books', 'Sports', 'Beauty', 'Grocery', 'Health', 'Automotive', 'Toys'];

// DummyJSON category -> [NexMart category, sub-category]. Cars and motorcycles are skipped on purpose.
const MAP = {
  smartphones: ['Electronics', 'Mobiles'], laptops: ['Electronics', 'Laptops'], tablets: ['Electronics', 'Tablets'],
  'mobile-accessories': ['Electronics', 'Mobile Accessories'],
  'mens-shirts': ['Fashion', "Men's Clothing"], 'mens-shoes': ['Fashion', "Men's Footwear"], 'mens-watches': ['Fashion', 'Watches'],
  'womens-watches': ['Fashion', 'Watches'], tops: ['Fashion', "Women's Clothing"], 'womens-dresses': ['Fashion', "Women's Clothing"],
  'womens-shoes': ['Fashion', "Women's Footwear"], 'womens-bags': ['Fashion', 'Bags'], 'womens-jewellery': ['Fashion', 'Jewellery'],
  sunglasses: ['Fashion', 'Eyewear'],
  'kitchen-accessories': ['Home', 'Kitchen'], 'home-decoration': ['Home', 'Home Décor'],
  furniture: ['Furniture', 'Furniture'],
  'sports-accessories': ['Sports', 'Sports Equipment'],
  beauty: ['Beauty', 'Makeup'], 'skin-care': ['Beauty', 'Skin Care'], fragrances: ['Beauty', 'Fragrances'],
  groceries: ['Grocery', 'Fresh & Staples'],
};
const OLD_KEEP = { Books: () => 'Non-fiction', Toys: () => 'Toys & Games', Grocery: () => 'Staples & Beverages', Automotive: () => 'Car & Bike Care',
  Health: (n) => (/monitor|oximeter|sanitizer/i.test(n) ? 'Health Devices' : 'Wellness & Nutrition') };

const price = (x) => (x >= 1000 ? Math.round(x / 100) * 100 - 1 : x >= 100 ? Math.round(x / 10) * 10 - 1 : Math.max(1, Math.round(x)));

function fromDummy(d) {
  const m = MAP[d.category];
  if (!m) return null;
  const usd = Number(d.price) || 0, disc = Number(d.discountPercentage) || 0;
  const p = price(usd * USD_TO_INR);
  const original = disc >= 5 ? Math.max(p, price((usd * USD_TO_INR) / (1 - disc / 100))) : p;
  const imgs = [...new Set([d.thumbnail, ...(d.images || [])].filter(Boolean))];
  const revs = (d.reviews || []).map((r) => ({ rating: r.rating, title: '', comment: r.comment, userName: r.reviewerName || 'Customer', verified: false, sample: true, createdAt: r.date ? new Date(r.date) : new Date() }));
  const avg = revs.length ? revs.reduce((a, r) => a + r.rating, 0) / revs.length : 0;
  const specs = [['Brand', d.brand], ['Category', m[1]], ['Warranty', d.warrantyInformation], ['Shipping', d.shippingInformation], ['Returns', d.returnPolicy], ['SKU', d.sku]]
    .filter(([, v]) => v).map(([k, v]) => ({ k, v: String(v) }));
  return {
    key: 'dj' + d.id,
    product: {
      name: d.title, brand: d.brand || 'NexMart', category: m[0], subcategory: m[1], price: p, originalPrice: original,
      rating: Math.round(avg * 10) / 10, reviews: revs.length, image: imgs[0], images: imgs, stock: Math.max(0, d.stock | 0),
      description: d.description || '', features: [d.warrantyInformation, d.shippingInformation, d.returnPolicy].filter(Boolean),
      specs, tags: d.tags || [], deal: disc >= 15, featured: false, badge: null,
    },
    reviews: revs,
  };
}

function fromOld(o, usedImages) {
  const sub = OLD_KEEP[o.category];
  if (!sub || !o.image || usedImages.has(o.image)) return null; // skip other categories and repeated photos
  usedImages.add(o.image);
  return {
    key: 'old' + o.id,
    product: {
      name: o.name, brand: o.brand, category: o.category, subcategory: sub(o.name), price: o.price, originalPrice: o.originalPrice,
      rating: 0, reviews: 0, image: o.image, images: [o.image], stock: o.stock, description: o.description || '',
      features: o.features || [], specs: [{ k: 'Brand', v: o.brand }], tags: [], deal: !!o.deal, featured: false, badge: null,
    },
    reviews: [],
  };
}

function buildCatalog(dummyProducts, oldProducts = []) {
  const used = new Set(), names = new Set(), items = [];
  const add = (x) => {
    if (!x) return;
    const nk = x.product.name.trim().toLowerCase();
    if (names.has(nk)) return;                      // every product appears only once
    names.add(nk); items.push(x);
  };
  dummyProducts.forEach((d) => { const x = fromDummy(d); if (x) { used.add(x.product.image); add(x); } });
  oldProducts.forEach((o) => add(fromOld(o, used)));

  // arrange by category -> sub-category -> name so every category page is neatly grouped
  items.sort((a, b) => CAT_ORDER.indexOf(a.product.category) - CAT_ORDER.indexOf(b.product.category)
    || a.product.subcategory.localeCompare(b.product.subcategory) || a.product.name.localeCompare(b.product.name));
  items.forEach((x, i) => { x.product.pid = i + 1; });

  // badges: best rated item of each sub-category, featured: top 2 of each category
  const best = {}, top = {};
  items.forEach((x) => {
    const p = x.product, k = p.category + '|' + p.subcategory;
    if (p.rating && (!best[k] || p.rating > best[k].rating)) best[k] = p;
    (top[p.category] = top[p.category] || []).push(p);
  });
  Object.values(best).forEach((p) => { p.badge = 'bestseller'; });
  Object.values(top).forEach((l) => l.filter((p) => p.rating).sort((a, b) => b.rating - a.rating).slice(0, 2).forEach((p) => { p.featured = true; }));
  return items;
}

module.exports = { buildCatalog };
