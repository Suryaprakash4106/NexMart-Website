// Gives sub-categories to the products #207 to #306 (added by addProducts.js without one),
// so the sidebar stops showing "undefined". Only products with an EMPTY subcategory are changed.
//
//   node fixSubcategories.js            -> DRY RUN (lists what would change)
//   node fixSubcategories.js --apply    -> updates MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');

const APPLY = process.argv.includes('--apply');

const MAP = {
  // Electronics
  207: 'Mobiles', 208: 'Mobiles', 209: 'Headphones & Speakers', 210: 'Headphones & Speakers', 211: 'Wearables',
  212: 'Headphones & Speakers', 213: 'Cameras', 214: 'Computer Accessories', 215: 'Computer Accessories',
  216: 'Networking', 217: 'Storage', 218: 'TV & Streaming',
  // Fashion
  219: "Men's Clothing", 220: "Men's Clothing", 221: "Men's Footwear", 222: 'Watches', 223: 'Eyewear',
  224: "Women's Clothing", 225: "Women's Clothing", 226: 'Bags', 227: 'Accessories', 228: "Men's Clothing",
  // Home & Kitchen
  229: 'Kitchen', 230: 'Kitchen', 231: 'Kitchen', 232: 'Kitchen', 233: 'Lighting', 234: 'Home Appliances',
  235: 'Bedding', 236: 'Home Décor', 237: 'Kitchen', 238: 'Home Décor',
  // Furniture
  239: 'Beds & Mattresses', 240: 'Chairs', 241: 'Storage', 242: 'Chairs', 243: 'Tables', 244: 'Tables',
  245: 'Storage', 246: 'Chairs', 247: 'Storage', 248: 'Chairs',
  // Books
  249: 'Non-fiction', 250: 'Fiction', 251: 'Non-fiction', 252: 'Non-fiction', 253: 'Technology', 254: 'Technology',
  255: 'Non-fiction', 256: 'Non-fiction', 257: 'Fiction', 258: 'Non-fiction',
  // Sports
  259: 'Racket Sports', 260: 'Fitness', 261: 'Fitness', 262: 'Fitness', 263: 'Cricket', 264: 'Football',
  265: 'Cycling', 266: 'Fitness',
  // Beauty
  267: 'Makeup', 268: 'Makeup', 269: 'Skin Care', 270: 'Hair Care', 271: 'Hair Care', 272: 'Skin Care',
  273: 'Skin Care', 274: 'Grooming',
  // Grocery
  275: 'Staples & Beverages', 276: 'Staples & Beverages', 277: 'Staples & Beverages', 278: 'Snacks & Breakfast',
  279: 'Spices & Masalas', 280: 'Spices & Masalas', 281: 'Snacks & Breakfast', 282: 'Dry Fruits',
  // Health
  283: 'Personal Care', 284: 'Health Devices', 285: 'Health Devices', 286: 'Wellness & Nutrition',
  287: 'Wellness & Nutrition', 288: 'Personal Care', 289: 'Personal Care', 290: 'Pain Relief',
  291: 'Wellness & Nutrition', 292: 'Health Devices',
  // Automotive
  293: 'Car Accessories', 294: 'Car Accessories', 295: 'Car & Bike Care', 296: 'Bike Accessories',
  297: 'Car Accessories', 298: 'Car Accessories', 299: 'Car Accessories', 300: 'Car & Bike Care',
  // Toys
  301: 'Dolls & Soft Toys', 302: 'Remote Control', 303: 'Games & Puzzles', 304: 'Building Toys',
  305: 'Outdoor Toys', 306: 'Dolls & Soft Toys',
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const missing = await Product.find({ $or: [{ subcategory: { $exists: false } }, { subcategory: null }, { subcategory: '' }] },
    'pid name category subcategory').lean();
  console.log(`${missing.length} products have no sub-category\n`);
  let todo = 0, unknown = 0;
  for (const p of missing) {
    const sub = MAP[p.pid];
    if (!sub) { console.log(`#${p.pid} ${p.name} [${p.category}] -> no mapping, left as is`); unknown++; continue; }
    console.log(`#${p.pid} ${p.name} [${p.category}] -> ${sub}`);
    todo++;
    if (APPLY) await Product.updateOne({ pid: p.pid }, { $set: { subcategory: sub } });
  }
  console.log(APPLY ? `\nDone. Updated ${todo}, left ${unknown}.` : `\nDRY RUN only. Nothing changed. Run "node fixSubcategories.js --apply" to update ${todo} products.`);
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
