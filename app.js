/* ============================================
   NEXMART — FULL ECOMMERCE JAVASCRIPT
   MongoDB Atlas Backend Ready
   ============================================ */

'use strict';

// ============================================
// SECTION 1: BACKEND CONFIGURATION
// ============================================

const BACKEND_CONFIG = {
  MONGODB_URI: 'mongodb+srv://enterprise_sop_user_admin:mohycoK23Ju1Bk0s@enterprise-sop-agent.yig4pl9.mongodb.net/NexMart?retryWrites=true&w=majority',
  API_BASE: 'http://localhost:5000/api',
  COLLECTIONS: {
    USERS: 'users',
    ORDERS: 'orders',
    PRODUCTS: 'products',
    REVIEWS: 'reviews',
    CART: 'cart',
    WISHLIST: 'wishlist',
  },
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ORDERS: '/orders',
    CART: '/cart',
    WISHLIST: '/wishlist',
    PRODUCTS: '/products',
    PROFILE: '/users/profile',
  }
};

// ============================================
// SECTION 2: PRODUCT DATABASE
// ============================================

const PRODUCTS = [
  // Electronics
  { id: 1, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Electronics', price: 89999, originalPrice: 124999, rating: 4.7, reviews: 3842, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop'], stock: 15, badge: 'bestseller', deal: true, featured: true, features: ['200MP Camera System', '5000mAh Battery', 'S Pen Included', 'Snapdragon 8 Gen 3', '12GB RAM + 256GB'], description: 'The ultimate Galaxy experience with pro-grade camera.' },
  { id: 2, name: 'Apple MacBook Air M3', brand: 'Apple', category: 'Electronics', price: 114900, originalPrice: 129900, rating: 4.9, reviews: 5210, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop'], stock: 8, badge: 'new', deal: false, featured: true, features: ['Apple M3 Chip', '18hr Battery', '13.6" Retina Display', '8GB Unified Memory', 'MagSafe Charging'], description: 'Supercharged by M3 chip.' },
  { id: 3, name: 'Sony WH-1000XM5', brand: 'Sony', category: 'Electronics', price: 24990, originalPrice: 34990, rating: 4.8, reviews: 8901, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop'], stock: 23, badge: null, deal: true, featured: true, features: ['Industry-leading ANC', '30hr Battery', 'Speak-to-Chat', 'Multipoint Connection', 'Hi-Res Audio'], description: 'Industry-leading noise canceling.' },
  { id: 4, name: 'iPad Pro 12.9" M4', brand: 'Apple', category: 'Electronics', price: 109900, originalPrice: 119900, rating: 4.8, reviews: 2341, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&auto=format&fit=crop'], stock: 5, badge: 'new', deal: false, featured: false, features: ['Apple M4 Chip', 'Ultra Retina XDR Display', 'Wi-Fi 6E', 'All-day Battery', 'ProMotion 120Hz'], description: 'The ultimate iPad with M4 chip.' },
  { id: 5, name: 'OnePlus 12R 5G', brand: 'OnePlus', category: 'Electronics', price: 39999, originalPrice: 49999, rating: 4.5, reviews: 4521, image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700&auto=format&fit=crop'], stock: 30, badge: null, deal: true, featured: false, features: ['Snapdragon 8 Gen 2', '5500mAh Battery', '100W SuperVOOC', '50MP Camera', '6.78" AMOLED'], description: 'Premium performance at great price.' },
  { id: 6, name: 'LG OLED 55" C3 4K TV', brand: 'LG', category: 'Electronics', price: 89990, originalPrice: 119990, rating: 4.7, reviews: 1832, image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=700&auto=format&fit=crop'], stock: 7, badge: null, deal: true, featured: true, features: ['55" OLED Display', '4K 120Hz', 'Dolby Vision & Atmos', 'webOS Smart TV', 'AI Picture Pro'], description: 'Perfect blacks, vivid colors.' },
  { id: 7, name: 'Logitech MX Master 3S', brand: 'Logitech', category: 'Electronics', price: 8995, originalPrice: 10995, rating: 4.7, reviews: 12401, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&auto=format&fit=crop'], stock: 50, badge: null, deal: false, featured: false, features: ['8000 DPI Sensor', 'MagSpeed Scroll', '70-day Battery', 'Bluetooth + USB-C', 'Multi-device'], description: 'The master of mice.' },
  { id: 8, name: 'JBL Charge 5 Speaker', brand: 'JBL', category: 'Electronics', price: 12999, originalPrice: 16999, rating: 4.6, reviews: 7823, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&auto=format&fit=crop'], stock: 18, badge: null, deal: true, featured: false, features: ['IP67 Waterproof', '20hr Playtime', 'PartyBoost', 'Power Bank Built-in', 'JBL Pro Sound'], description: 'Bold sound with IP67 waterproofing.' },
  { id: 9, name: 'Canon EOS R50 Camera', brand: 'Canon', category: 'Electronics', price: 69999, originalPrice: 84999, rating: 4.7, reviews: 1234, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&fit=crop'], stock: 6, badge: 'new', deal: false, featured: true, features: ['24.2MP APS-C', '4K Video', 'Dual Pixel CMOS AF', 'Wi-Fi + Bluetooth', 'Compact Mirrorless'], description: 'Perfect entry-level mirrorless camera.' },
  { id: 10, name: 'Apple Watch Ultra 2', brand: 'Apple', category: 'Electronics', price: 89900, originalPrice: 99900, rating: 4.8, reviews: 3421, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=700&auto=format&fit=crop'], stock: 10, badge: 'bestseller', deal: false, featured: true, features: ['49mm Titanium Case', '60hr Battery', 'Dual-frequency GPS', 'Siren 86dB', 'Water 100m'], description: 'The most rugged Apple Watch ever.' },
  { id: 11, name: 'Dell XPS 15 Laptop', brand: 'Dell', category: 'Electronics', price: 149999, originalPrice: 174999, rating: 4.6, reviews: 987, image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=700&auto=format&fit=crop'], stock: 4, badge: null, deal: true, featured: false, features: ['Intel i9-13900H', '32GB RAM', '1TB SSD', 'RTX 4060', '15.6" OLED 4K'], description: 'Creator-grade laptop.' },
  { id: 12, name: 'Bose QuietComfort 45', brand: 'Bose', category: 'Electronics', price: 26990, originalPrice: 33990, rating: 4.6, reviews: 6543, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop'], stock: 20, badge: null, deal: true, featured: false, features: ['World-class ANC', '24hr Battery', 'TriPort Technology', 'USB-C Charging', 'Alexa Built-in'], description: 'Premium noise cancelling headphones.' },
  { id: 13, name: 'Realme GT 6 5G', brand: 'Realme', category: 'Electronics', price: 34999, originalPrice: 42999, rating: 4.4, reviews: 2890, image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=700&auto=format&fit=crop'], stock: 25, badge: 'hot', deal: true, featured: false, features: ['Snapdragon 8s Gen 3', '120Hz AMOLED', '5000mAh', '80W SuperDart', '50MP Sony Camera'], description: 'Flagship performance at mid-range price.' },
  { id: 14, name: 'Nothing Phone 2', brand: 'Nothing', category: 'Electronics', price: 44999, originalPrice: 54999, rating: 4.6, reviews: 3456, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=700&auto=format&fit=crop'], stock: 12, badge: null, deal: false, featured: true, features: ['Glyph Interface', 'Snapdragon 8+ Gen 1', '120Hz OLED', '50MP Dual Camera', 'Nothing OS'], description: 'Distinctive design with Glyph Interface.' },
  { id: 15, name: 'Microsoft Surface Laptop 5', brand: 'Microsoft', category: 'Electronics', price: 129999, originalPrice: 149999, rating: 4.5, reviews: 1234, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop'], stock: 6, badge: null, deal: false, featured: false, features: ['Intel Evo Platform', 'Touchscreen', '3:2 Aspect Ratio', 'Dolby Vision', 'Premium Build'], description: 'Elegant laptop with touchscreen.' },
  { id: 16, name: 'Echo Dot 5th Gen', brand: 'Amazon', category: 'Electronics', price: 4499, originalPrice: 5999, rating: 4.7, reviews: 23456, image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=700&auto=format&fit=crop'], stock: 45, badge: 'bestseller', deal: true, featured: false, features: ['Alexa', 'Improved Audio', 'Motion Detection', 'Temperature Sensor', 'Eero Built-in'], description: 'Smart speaker with Alexa.' },
  { id: 17, name: 'Google Pixel 8 Pro', brand: 'Google', category: 'Electronics', price: 79999, originalPrice: 99999, rating: 4.7, reviews: 5678, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700&auto=format&fit=crop'], stock: 9, badge: 'new', deal: true, featured: true, features: ['Google Tensor G3', 'Pro Camera', 'AI Features', '7 Years Updates', 'Pure Android'], description: 'The ultimate Pixel experience.' },
  { id: 18, name: 'ASUS ROG Strix G16', brand: 'ASUS', category: 'Electronics', price: 139999, originalPrice: 169999, rating: 4.6, reviews: 2345, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&auto=format&fit=crop'], stock: 7, badge: null, deal: true, featured: false, features: ['Intel i9-13980HX', 'RTX 4070', '16" 240Hz Display', '16GB DDR5', '1TB SSD'], description: 'Ultimate gaming laptop.' },
  { id: 19, name: 'Fire TV Stick 4K', brand: 'Amazon', category: 'Electronics', price: 3999, originalPrice: 5999, rating: 4.5, reviews: 78901, image: 'https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=700&auto=format&fit=crop'], stock: 100, badge: null, deal: true, featured: false, features: ['4K Ultra HD', 'Dolby Vision', 'Wi-Fi 6', 'Alexa Voice Remote', 'Streaming Apps'], description: 'Stream 4K content effortlessly.' },
  { id: 20, name: 'WD 2TB External HDD', brand: 'Western Digital', category: 'Electronics', price: 5999, originalPrice: 7999, rating: 4.4, reviews: 45678, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&auto=format&fit=crop'], stock: 35, badge: null, deal: true, featured: false, features: ['2TB Storage', 'USB 3.0', 'Compact Design', 'Plug & Play', 'Password Protection'], description: 'Reliable external storage.' },

  // Fashion (21-40)
  { id: 21, name: "Levi's 511 Slim Jeans", brand: "Levi's", category: 'Fashion', price: 2799, originalPrice: 4499, rating: 4.4, reviews: 6780, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=700&auto=format&fit=crop'], stock: 100, badge: null, deal: true, featured: true, features: ['Slim Fit', '99% Cotton 1% Elastane', '5 Colors', 'Machine Washable', 'Zip Fly'], description: "Classic slim fit jeans." },
  { id: 22, name: "Nike Air Force 1 '07", brand: 'Nike', category: 'Fashion', price: 7495, originalPrice: 8495, rating: 4.8, reviews: 21340, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop'], stock: 45, badge: 'bestseller', deal: false, featured: true, features: ['Leather Upper', 'Nike Air Cushioning', 'Rubber Outsole', 'Padded Collar', 'Iconic Design'], description: "The radiance lives on." },
  { id: 23, name: 'H&M Oversized Hoodie', brand: 'H&M', category: 'Fashion', price: 1499, originalPrice: 2499, rating: 4.3, reviews: 4320, image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&auto=format&fit=crop'], stock: 80, badge: 'new', deal: false, featured: false, features: ['100% Cotton Fleece', 'Relaxed Fit', 'Kangaroo Pocket', 'Ribbed Cuffs', '8 Colors'], description: 'Stay cozy and stylish.' },
  { id: 24, name: 'Adidas Ultraboost 22', brand: 'Adidas', category: 'Fashion', price: 13999, originalPrice: 17999, rating: 4.7, reviews: 8932, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700&auto=format&fit=crop'], stock: 22, badge: null, deal: false, featured: true, features: ['BOOST Midsole', 'Primeknit+ Upper', 'Continental Rubber', 'Sustainable Materials', 'Linear Energy Push'], description: 'Returning energy with every step.' },
  { id: 25, name: 'Ray-Ban Aviator Classic', brand: 'Ray-Ban', category: 'Fashion', price: 8490, originalPrice: 10990, rating: 4.6, reviews: 5678, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&auto=format&fit=crop'], stock: 35, badge: null, deal: false, featured: false, features: ['Crystal Green Lenses', 'Gold Frame', '100% UV Protection', 'Italian Craftsmanship', 'Case Included'], description: 'The iconic aviator silhouette.' },
  { id: 26, name: 'Peter England Formal Shirt', brand: 'Peter England', category: 'Fashion', price: 999, originalPrice: 1799, rating: 4.3, reviews: 14230, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop'], stock: 120, badge: null, deal: true, featured: false, features: ['100% Cotton', 'Regular Fit', 'Full Sleeves', '10 Colors', 'Easy Iron'], description: 'Classic formal shirt.' },
  { id: 27, name: 'Fastrack Analog Watch', brand: 'Fastrack', category: 'Fashion', price: 1999, originalPrice: 2999, rating: 4.3, reviews: 9870, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop'], stock: 60, badge: null, deal: true, featured: false, features: ['Analog Display', 'Leather Strap', 'Water Resistant', 'Stainless Steel Case', '1-Year Warranty'], description: 'Stylish everyday watch.' },
  { id: 28, name: 'Puma Track Jacket', brand: 'Puma', category: 'Fashion', price: 2499, originalPrice: 3999, rating: 4.4, reviews: 3456, image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=700&auto=format&fit=crop'], stock: 45, badge: 'hot', deal: true, featured: false, features: ['Polyester Blend', 'Full Zip', 'Side Pockets', 'Slim Fit', '4 Colors'], description: 'Performance track jacket.' },
  { id: 29, name: 'Zara Women\'s Dress', brand: 'Zara', category: 'Fashion', price: 3999, originalPrice: 5999, rating: 4.5, reviews: 12345, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=700&auto=format&fit=crop'], stock: 25, badge: null, deal: false, featured: true, features: ['Floral Print', 'Flowy Fabric', 'Summer Style', 'Machine Wash', 'European Size'], description: 'Elegant summer dress.' },
  { id: 30, name: 'Woodland Leather Boots', brand: 'Woodland', category: 'Fashion', price: 3299, originalPrice: 4999, rating: 4.5, reviews: 12340, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop'], stock: 35, badge: null, deal: true, featured: false, features: ['Full-grain Leather', 'Rubber Sole', 'Water Resistant', 'Steel Shank', '5 Sizes'], description: 'Rugged leather boots.' },
  { id: 31, name: 'Arrow Non-Iron Shirt', brand: 'Arrow', category: 'Fashion', price: 1499, originalPrice: 2299, rating: 4.4, reviews: 8901, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&auto=format&fit=crop'], stock: 90, badge: null, deal: false, featured: false, features: ['Non-Iron Technology', '100% Cotton', 'Slim Fit', 'Button-Down Collar', '6 Colors'], description: 'Stay sharp all day.' },
  { id: 32, name: 'Van Heusen Chino Trousers', brand: 'Van Heusen', category: 'Fashion', price: 1799, originalPrice: 2999, rating: 4.3, reviews: 6780, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=700&auto=format&fit=crop'], stock: 70, badge: null, deal: true, featured: false, features: ['Slim Fit', 'Stretch Fabric', 'Multiple Pockets', 'Machine Washable', '8 Colors'], description: 'Versatile chino trousers.' },
  { id: 33, name: 'Titan Raga Ladies Watch', brand: 'Titan', category: 'Fashion', price: 4995, originalPrice: 6995, rating: 4.6, reviews: 9870, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&auto=format&fit=crop'], stock: 40, badge: null, deal: false, featured: false, features: ['Rose Gold Case', 'Leather Strap', 'Analog Display', '30m Water Resistant', '2-Year Warranty'], description: 'Elegant rose gold watch.' },
  { id: 34, name: 'Wildcraft Backpack 45L', brand: 'Wildcraft', category: 'Fashion', price: 2299, originalPrice: 3499, rating: 4.4, reviews: 7890, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop'], stock: 55, badge: null, deal: true, featured: false, features: ['45L Capacity', 'Laptop Sleeve 17"', 'Rain Cover', 'Ergonomic Straps', 'Multiple Pockets'], description: 'Spacious travel backpack.' },
  { id: 35, name: 'U.S. Polo Assn. T-shirt', brand: 'U.S. Polo', category: 'Fashion', price: 999, originalPrice: 1499, rating: 4.3, reviews: 23456, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&auto=format&fit=crop'], stock: 150, badge: null, deal: true, featured: false, features: ['100% Cotton', 'Regular Fit', 'Crew Neck', 'Machine Wash', '5 Colors'], description: 'Classic polo t-shirt.' },
  { id: 36, name: 'Bata Formal Shoes', brand: 'Bata', category: 'Fashion', price: 1999, originalPrice: 2999, rating: 4.2, reviews: 34567, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700&auto=format&fit=crop'], stock: 60, badge: null, deal: true, featured: false, features: ['Leather Upper', 'Cushioned Insole', 'Durable Sole', 'Formal Design', 'UK Sizes'], description: 'Comfortable formal shoes.' },
  { id: 37, name: 'FabIndia Kurta', brand: 'FabIndia', category: 'Fashion', price: 1499, originalPrice: 2499, rating: 4.4, reviews: 12345, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop'], stock: 45, badge: null, deal: false, featured: true, features: ['100% Cotton', 'Hand Block Print', 'Traditional Design', 'Comfortable Fit', 'Made in India'], description: 'Ethnic cotton kurta.' },
  { id: 38, name: 'Puma Sports Shoes', brand: 'Puma', category: 'Fashion', price: 3499, originalPrice: 4999, rating: 4.5, reviews: 23456, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop'], stock: 40, badge: 'bestseller', deal: true, featured: false, features: ['Breathable Mesh', 'Cushioned Sole', 'Lightweight', 'Running Shoes', '5 Colors'], description: 'High-performance sports shoes.' },
  { id: 39, name: 'Tommy Hilfiger Jacket', brand: 'Tommy Hilfiger', category: 'Fashion', price: 7999, originalPrice: 12999, rating: 4.6, reviews: 5678, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop'], stock: 12, badge: null, deal: false, featured: true, features: ['Premium Fabric', 'Quilted Design', 'Zip Closure', 'Side Pockets', 'Brand Logo'], description: 'Stylish winter jacket.' },
  { id: 40, name: 'Decathlon Trekking Shoes', brand: 'Decathlon', category: 'Fashion', price: 1999, originalPrice: 2999, rating: 4.4, reviews: 45678, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop'], stock: 80, badge: null, deal: true, featured: false, features: ['Water Resistant', 'Grip Sole', 'Ankle Support', 'Breathable', 'Lightweight'], description: 'Durable trekking shoes.' },

  // Home & Kitchen (41-55)
  { id: 41, name: 'Instant Pot Duo 7-in-1', brand: 'Instant Pot', category: 'Home', price: 8999, originalPrice: 12999, rating: 4.7, reviews: 43210, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&auto=format&fit=crop'], stock: 29, badge: 'bestseller', deal: true, featured: true, features: ['7-in-1 Functions', '6 Quart Capacity', '13 Smart Programs', 'Delay Start', 'Safety Certified'], description: '7-in-1 multi-cooker.' },
  { id: 42, name: 'Philips Air Fryer XXL', brand: 'Philips', category: 'Home', price: 14995, originalPrice: 19995, rating: 4.6, reviews: 8901, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=700&auto=format&fit=crop'], stock: 14, badge: null, deal: true, featured: true, features: ['3kg Capacity', 'Rapid Air Technology', '90% Less Fat', 'Touch Screen', 'NutriU App'], description: "World's #1 Air Fryer." },
  { id: 43, name: 'Dyson V15 Detect Vacuum', brand: 'Dyson', category: 'Home', price: 52900, originalPrice: 62900, rating: 4.8, reviews: 4512, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&auto=format&fit=crop'], stock: 6, badge: 'new', deal: false, featured: false, features: ['Laser Detection', 'HEPA Filtration', '60min Runtime', 'LCD Screen', '240 AW Suction'], description: 'Laser detects invisible dust.' },
  { id: 44, name: 'Prestige Induction Cooktop', brand: 'Prestige', category: 'Home', price: 3499, originalPrice: 5499, rating: 4.3, reviews: 12890, image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=700&auto=format&fit=crop'], stock: 40, badge: null, deal: true, featured: false, features: ['2000W Power', 'Touch Controls', 'Auto Shut Off', '7 Preset Menus', 'Indian Cooking Modes'], description: "Trusted induction cooktop." },
  { id: 45, name: 'Milton Thermosteel Flask', brand: 'Milton', category: 'Home', price: 699, originalPrice: 1199, rating: 4.5, reviews: 34560, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop'], stock: 200, badge: null, deal: true, featured: false, features: ['1L Capacity', '18/8 Stainless Steel', '24hr Hot/Cold', 'Leak-proof', '5-Year Warranty'], description: 'Keep beverages hot or cold.' },
  { id: 46, name: 'Crompton Ceiling Fan', brand: 'Crompton', category: 'Home', price: 2499, originalPrice: 3499, rating: 4.4, reviews: 7890, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=700&auto=format&fit=crop'], stock: 30, badge: null, deal: false, featured: false, features: ['1200mm Sweep', '35W Power', '4-Speed', 'Remote Control', '3-Year Warranty'], description: 'Energy-efficient ceiling fan.' },
  { id: 47, name: 'Borosil Glass Casserole', brand: 'Borosil', category: 'Home', price: 1299, originalPrice: 1999, rating: 4.5, reviews: 18930, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=700&auto=format&fit=crop'], stock: 75, badge: null, deal: true, featured: false, features: ['Borosilicate Glass', 'Microwave Safe', 'Dishwasher Safe', 'Airtight Lid', '1.5L Capacity'], description: 'Premium glass casserole.' },
  { id: 48, name: 'Havells Geyser 15L', brand: 'Havells', category: 'Home', price: 8499, originalPrice: 11999, rating: 4.4, reviews: 6780, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=700&auto=format&fit=crop'], stock: 12, badge: null, deal: true, featured: false, features: ['15L Capacity', '2000W', 'Glasslined Tank', 'Magnesium Anode', '5-Year Warranty'], description: 'Energy-efficient water heater.' },
  { id: 49, name: 'Eureka Forbes RO Purifier', brand: 'Eureka Forbes', category: 'Home', price: 9999, originalPrice: 14999, rating: 4.5, reviews: 23450, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=700&auto=format&fit=crop'], stock: 20, badge: null, deal: true, featured: false, features: ['7-Stage Purification', 'RO+UV+UF+TDS', '15L/hr Flow', '10L Storage', 'Auto Shut-off'], description: 'Advanced water purifier.' },
  { id: 50, name: 'Bajaj Mixer Grinder 750W', brand: 'Bajaj', category: 'Home', price: 2799, originalPrice: 3999, rating: 4.4, reviews: 18901, image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=700&auto=format&fit=crop'], stock: 35, badge: null, deal: true, featured: false, features: ['750W Motor', '3 Jars', '3-Speed + Pulse', 'Anti-Rust Blades', '2-Year Warranty'], description: 'Powerful mixer grinder.' },
  { id: 51, name: 'Pigeon Non-Stick Cookware Set', brand: 'Pigeon', category: 'Home', price: 1999, originalPrice: 3499, rating: 4.3, reviews: 34560, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=700&auto=format&fit=crop'], stock: 50, badge: null, deal: true, featured: false, features: ['5-Piece Set', 'PFOA Free', 'Induction Compatible', 'Soft-touch Handles', 'Dishwasher Safe'], description: 'Non-stick cookware set.' },
  { id: 52, name: 'Godrej Refrigerator 350L', brand: 'Godrej', category: 'Home', price: 34999, originalPrice: 45999, rating: 4.5, reviews: 6780, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=700&auto=format&fit=crop'], stock: 8, badge: null, deal: false, featured: true, features: ['350L Frost-Free', 'Inverter Compressor', '5-Star Energy', 'Multi-Air Flow', '10-Year Warranty'], description: 'Energy-efficient refrigerator.' },
  { id: 53, name: 'IKEA KALLAX Shelf Unit', brand: 'IKEA', category: 'Furniture', price: 8999, originalPrice: 11999, rating: 4.5, reviews: 8901, image: 'https://images.unsplash.com/photo-1555041469-a586c81ea9bc?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1555041469-a586c81ea9bc?w=700&auto=format&fit=crop'], stock: 15, badge: null, deal: false, featured: false, features: ['4-Cube Design', 'White/Oak Options', 'Wall Mountable', '35kg Per Shelf', 'Easy Assemble'], description: 'Versatile cube shelf unit.' },
  { id: 54, name: 'Pepperfry Wooden Dining Table', brand: 'Pepperfry', category: 'Furniture', price: 18999, originalPrice: 27999, rating: 4.4, reviews: 2341, image: 'https://images.unsplash.com/photo-1555041469-a586c81ea9bc?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1555041469-a586c81ea9bc?w=700&auto=format&fit=crop'], stock: 6, badge: null, deal: true, featured: false, features: ['6-Seater', 'Sheesham Wood', 'Honey Oak Finish', 'Pre-Assembled', 'Free Delivery'], description: 'Solid wood dining table.' },
  { id: 55, name: 'IKEA MALM Bed Frame', brand: 'IKEA', category: 'Furniture', price: 19999, originalPrice: 25999, rating: 4.4, reviews: 3241, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&auto=format&fit=crop'], stock: 10, badge: null, deal: false, featured: false, features: ['Queen Size', 'Particle Board', 'Storage Compartments', 'Easy Assembly', '5-Year Warranty'], description: 'Clean, simple bed frame.' },

  // Books (56-60)
  { id: 56, name: 'Atomic Habits - James Clear', brand: 'Penguin', category: 'Books', price: 399, originalPrice: 699, rating: 4.9, reviews: 89032, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=700&auto=format&fit=crop'], stock: 200, badge: 'bestseller', deal: false, featured: true, features: ['Paperback', '320 Pages', 'Self-Help', 'International Bestseller', 'Hindi Edition Available'], description: 'Tiny changes, remarkable results.' },
  { id: 57, name: 'The Psychology of Money', brand: 'Jaico', category: 'Books', price: 299, originalPrice: 499, rating: 4.8, reviews: 54210, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=700&auto=format&fit=crop'], stock: 150, badge: null, deal: true, featured: false, features: ['Paperback', '256 Pages', 'Finance', 'Morgan Housel', '18 Timeless Lessons'], description: 'Timeless lessons on wealth.' },
  { id: 58, name: 'Rich Dad Poor Dad', brand: 'Manjul', category: 'Books', price: 249, originalPrice: 395, rating: 4.6, reviews: 123450, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&auto=format&fit=crop'], stock: 300, badge: 'bestseller', deal: false, featured: false, features: ['Paperback', '336 Pages', 'Robert Kiyosaki', 'Personal Finance', 'All-Time Bestseller'], description: 'What the rich teach their kids.' },
  { id: 59, name: 'Zero to One - Peter Thiel', brand: 'Virgin Books', category: 'Books', price: 349, originalPrice: 599, rating: 4.7, reviews: 34560, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=700&auto=format&fit=crop'], stock: 100, badge: null, deal: true, featured: false, features: ['Paperback', '224 Pages', 'Startup', 'Peter Thiel', 'Startup Bible'], description: 'Notes on startups.' },
  { id: 60, name: 'Deep Work - Cal Newport', brand: 'Piatkus', category: 'Books', price: 399, originalPrice: 650, rating: 4.7, reviews: 23450, image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=700&auto=format&fit=crop'], stock: 120, badge: null, deal: false, featured: false, features: ['Paperback', '304 Pages', 'Productivity', 'Cal Newport', 'Actionable Strategies'], description: 'Rules for focused success.' },

  // Sports (61-68)
  { id: 61, name: 'Yonex Arcsaber 11 Racket', brand: 'Yonex', category: 'Sports', price: 8999, originalPrice: 12999, rating: 4.7, reviews: 2341, image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=700&auto=format&fit=crop'], stock: 15, badge: null, deal: false, featured: false, features: ['Graphite Frame', 'Isometric Head', '4U G5 Weight', 'Built-in T-joint', 'Full Cover'], description: 'Professional-grade racket.' },
  { id: 62, name: 'Nivia Force Football', brand: 'Nivia', category: 'Sports', price: 899, originalPrice: 1299, rating: 4.3, reviews: 5670, image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=700&auto=format&fit=crop'], stock: 80, badge: null, deal: true, featured: false, features: ['Size 5', 'Rubber Bladder', 'PU Material', 'Hand Stitched', 'All-Surface'], description: 'High-quality football.' },
  { id: 63, name: 'Decathlon Quechua Tent', brand: 'Decathlon', category: 'Sports', price: 4999, originalPrice: 6999, rating: 4.5, reviews: 3421, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=700&auto=format&fit=crop'], stock: 20, badge: null, deal: false, featured: false, features: ['3-Person', '2000mm Waterproof', 'Quick Pitch 60s', 'Fiberglass Poles', 'Carry Bag'], description: 'Tent that pitches in 60 seconds.' },
  { id: 64, name: 'Boldfit Gym Gloves', brand: 'Boldfit', category: 'Sports', price: 499, originalPrice: 999, rating: 4.4, reviews: 8901, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&auto=format&fit=crop'], stock: 120, badge: null, deal: true, featured: false, features: ['Anti-Slip Grip', 'Breathable', 'Wrist Support', 'Open Fingers', 'Unisex'], description: 'Professional gym gloves.' },
  { id: 65, name: 'Cosco Cricket Bat', brand: 'Cosco', category: 'Sports', price: 1299, originalPrice: 1999, rating: 4.3, reviews: 4567, image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=700&auto=format&fit=crop'], stock: 35, badge: null, deal: true, featured: false, features: ['Kashmir Willow', 'Full Size', 'Rubber Handle', '1100-1200g Weight', 'Oiled Finish'], description: 'Premium cricket bat.' },
  { id: 66, name: 'Boldfit Resistance Bands Set', brand: 'Boldfit', category: 'Sports', price: 799, originalPrice: 1499, rating: 4.5, reviews: 12340, image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=700&auto=format&fit=crop'], stock: 150, badge: 'bestseller', deal: true, featured: false, features: ['5 Resistance Levels', 'Natural Latex', 'Handles + Ankle Straps', 'Door Anchor', 'Travel Bag'], description: 'Complete home workout kit.' },
  { id: 67, name: 'Reebok Running Shoes', brand: 'Reebok', category: 'Sports', price: 6999, originalPrice: 9999, rating: 4.5, reviews: 5670, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop'], stock: 28, badge: null, deal: true, featured: false, features: ['Floatride Energy Foam', 'Mesh Upper', 'Flex Groove Outsole', 'Lightweight 240g', 'Drop-In Midsole'], description: 'Lightweight running shoes.' },
  { id: 68, name: 'Decathlon Yoga Mat 5mm', brand: 'Decathlon', category: 'Sports', price: 699, originalPrice: 999, rating: 4.5, reviews: 34560, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&auto=format&fit=crop'], stock: 150, badge: null, deal: false, featured: false, features: ['5mm Thick', 'Non-Slip Surface', '183cm x 61cm', 'Carry Strap', '6 Colors'], description: 'Comfortable yoga mat.' },

  // Beauty (69-75)
  { id: 69, name: 'Lakme Absolute Serum', brand: 'Lakme', category: 'Beauty', price: 799, originalPrice: 1299, rating: 4.4, reviews: 6780, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=700&auto=format&fit=crop'], stock: 60, badge: null, deal: true, featured: false, features: ['2% Niacinamide', 'Hyaluronic Acid', 'Paraben Free', '30ml', 'All Skin Types'], description: 'Concentrated brightening serum.' },
  { id: 70, name: 'Forest Essentials Face Pack', brand: 'Forest Essentials', category: 'Beauty', price: 1245, originalPrice: 1495, rating: 4.5, reviews: 3420, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&auto=format&fit=crop'], stock: 45, badge: null, deal: false, featured: false, features: ['Ayurvedic Formula', 'Multani Mitti', 'Rose Water', 'No Parabens', 'Made in India'], description: 'Luxurious ayurvedic face pack.' },
  { id: 71, name: 'Mamaearth Vitamin C Cream', brand: 'Mamaearth', category: 'Beauty', price: 349, originalPrice: 499, rating: 4.3, reviews: 14560, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&auto=format&fit=crop'], stock: 90, badge: null, deal: false, featured: false, features: ['Vitamin C & Turmeric', 'Brightening', 'SPF 20', '50g', 'Toxin-free'], description: 'Daily moisturizer for glowing skin.' },
  { id: 72, name: 'Biotique Bio Coconut Oil', brand: 'Biotique', category: 'Beauty', price: 199, originalPrice: 299, rating: 4.4, reviews: 23450, image: 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=700&auto=format&fit=crop'], stock: 200, badge: null, deal: true, featured: false, features: ['Cold Pressed', '100% Natural', 'Hair + Skin', 'No Chemicals', '200ml'], description: 'Pure coconut oil.' },
  { id: 73, name: 'WOW Skin Science Shampoo', brand: 'WOW', category: 'Beauty', price: 449, originalPrice: 699, rating: 4.4, reviews: 34560, image: 'https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=700&auto=format&fit=crop'], stock: 120, badge: 'bestseller', deal: true, featured: false, features: ['Apple Cider Vinegar', 'Sulphate Free', 'Paraben Free', '300ml', 'All Hair Types'], description: 'Shampoo for healthy hair.' },
  { id: 74, name: "L'Oreal Paris Revitalift Cream", brand: "L'Oreal", category: 'Beauty', price: 699, originalPrice: 999, rating: 4.4, reviews: 15670, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&auto=format&fit=crop'], stock: 75, badge: null, deal: true, featured: false, features: ['Pro-Retinol', 'SPF 15', 'Anti-Wrinkle', '50ml', 'Dermatologist Tested'], description: 'Reduces wrinkles and firms skin.' },
  { id: 75, name: 'Plum Goodness Sunscreen SPF 50', brand: 'Plum', category: 'Beauty', price: 449, originalPrice: 599, rating: 4.5, reviews: 12890, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&auto=format&fit=crop'], stock: 90, badge: null, deal: false, featured: false, features: ['SPF 50 PA++++', 'No White Cast', 'Matte Finish', 'Vegan', '100% Mineral'], description: 'Invisible matte sunscreen.' },

  // Grocery (76-85)
  { id: 76, name: 'Tata Salt Lite 1kg', brand: 'Tata', category: 'Grocery', price: 32, originalPrice: 35, rating: 4.6, reviews: 56780, image: 'https://images.unsplash.com/photo-1591779051696-1c3fa1469a79?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1591779051696-1c3fa1469a79?w=700&auto=format&fit=crop'], stock: 500, badge: null, deal: false, featured: false, features: ['Iodized Salt', 'Low Sodium', '1kg Pack', 'No Additives', 'BIS Certified'], description: "India's most trusted salt." },
  { id: 77, name: 'Aashirvaad Atta 5kg', brand: 'Aashirvaad', category: 'Grocery', price: 299, originalPrice: 349, rating: 4.7, reviews: 89032, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&auto=format&fit=crop'], stock: 300, badge: 'bestseller', deal: true, featured: false, features: ['Whole Wheat', 'High Fibre', '5kg Pack', 'No Preservatives', 'Soft Rotis Guaranteed'], description: "India's #1 atta brand." },
  { id: 78, name: 'Organic India Tulsi Tea', brand: 'Organic India', category: 'Grocery', price: 349, originalPrice: 499, rating: 4.6, reviews: 23450, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&auto=format&fit=crop'], stock: 150, badge: null, deal: true, featured: false, features: ['Certified Organic', '25 Tea Bags', 'Holy Basil', 'Caffeine Free', 'Stress Relief'], description: 'Organic tulsi tea for wellness.' },
  { id: 79, name: 'Amul Ghee 1kg', brand: 'Amul', category: 'Grocery', price: 599, originalPrice: 649, rating: 4.8, reviews: 67890, image: 'https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=700&auto=format&fit=crop'], stock: 200, badge: null, deal: false, featured: false, features: ['100% Pure Cow Ghee', '1kg Tin', 'No Preservatives', 'Rich Aroma', 'AGMARK Certified'], description: "Pure cow ghee from Amul." },
  { id: 80, name: 'Dabur Honey 500g', brand: 'Dabur', category: 'Grocery', price: 249, originalPrice: 299, rating: 4.5, reviews: 45670, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&auto=format&fit=crop'], stock: 250, badge: null, deal: true, featured: false, features: ['100% Pure', '500g Bottle', 'No Sugar Added', 'NMR Tested', 'Multi-floral Honey'], description: "India's #1 honey brand." },
  { id: 81, name: 'Britannia NutriChoice Biscuits', brand: 'Britannia', category: 'Grocery', price: 99, originalPrice: 120, rating: 4.4, reviews: 45670, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=700&auto=format&fit=crop'], stock: 500, badge: null, deal: false, featured: false, features: ['5-Grain Mix', 'No Maida', 'High Fibre', 'Pack of 6', 'Diabetic Friendly'], description: 'Healthy 5-grain biscuits.' },
  { id: 82, name: 'Patanjali Cow Ghee 500ml', brand: 'Patanjali', category: 'Grocery', price: 299, originalPrice: 349, rating: 4.5, reviews: 34560, image: 'https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=700&auto=format&fit=crop'], stock: 200, badge: null, deal: true, featured: false, features: ['Pure Cow Ghee', '500ml Bottle', 'Traditional Bilona Method', 'FSSAI Approved', 'No Additives'], description: 'Pure cow ghee.' },
  { id: 83, name: 'Tata Tea Gold 500g', brand: 'Tata Tea', category: 'Grocery', price: 249, originalPrice: 299, rating: 4.6, reviews: 67890, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&auto=format&fit=crop'], stock: 350, badge: 'bestseller', deal: false, featured: false, features: ['500g Pack', 'Assam Blend', 'Aromatic Dust', 'Premium Leaves', 'Rich Taste'], description: "India's #1 tea brand." },
  { id: 84, name: 'Fortune Sunflower Oil 5L', brand: 'Fortune', category: 'Grocery', price: 699, originalPrice: 849, rating: 4.4, reviews: 23450, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=700&auto=format&fit=crop'], stock: 300, badge: null, deal: true, featured: false, features: ['5L Can', 'Vitamin E Enriched', 'Low Cholesterol', 'High Smoke Point', 'FSSAI Certified'], description: 'Refined sunflower oil.' },
  { id: 85, name: 'Saffola Oats 1kg', brand: 'Saffola', category: 'Grocery', price: 199, originalPrice: 249, rating: 4.5, reviews: 45670, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&auto=format&fit=crop'], stock: 400, badge: null, deal: false, featured: false, features: ['1kg Pack', '100% Whole Grain', 'Beta Glucan Fiber', 'No Preservatives', 'Quick Cook 2min'], description: "India's #1 oats brand." },

  // Health (86-92)
  { id: 86, name: 'MuscleBlaze Whey Protein 1kg', brand: 'MuscleBlaze', category: 'Health', price: 1799, originalPrice: 2799, rating: 4.5, reviews: 45670, image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=700&auto=format&fit=crop'], stock: 80, badge: 'bestseller', deal: true, featured: false, features: ['25g Protein/Serving', '5.5g BCAAs', '1kg Pack', 'Chocolate Flavour', 'FSSAI Certified'], description: "India's #1 Sports nutrition." },
  { id: 87, name: 'Himalaya Ashwagandha Tablets', brand: 'Himalaya', category: 'Health', price: 199, originalPrice: 299, rating: 4.5, reviews: 34560, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop'], stock: 150, badge: null, deal: false, featured: false, features: ['60 Tablets', 'Pure Herb Extract', 'Stress Relief', 'Energy Booster', 'No Side Effects'], description: 'Pure Ashwagandha extract.' },
  { id: 88, name: 'Omron Blood Pressure Monitor', brand: 'Omron', category: 'Health', price: 1999, originalPrice: 2999, rating: 4.6, reviews: 12890, image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&auto=format&fit=crop'], stock: 25, badge: null, deal: true, featured: false, features: ['Upper Arm', 'Irregular Heartbeat', '30 Readings Memory', 'Large Display', 'One-touch Operation'], description: 'Clinically validated BP monitor.' },
  { id: 89, name: 'Dr. Morepen Pulse Oximeter', brand: 'Dr. Morepen', category: 'Health', price: 999, originalPrice: 1499, rating: 4.4, reviews: 23450, image: 'https://images.unsplash.com/photo-1584990347449-39ad2b4d3e4b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1584990347449-39ad2b4d3e4b?w=700&auto=format&fit=crop'], stock: 60, badge: null, deal: true, featured: false, features: ['SpO2 + Pulse Rate', 'OLED Display', '1-Year Warranty', '2 AAA Batteries', 'Carry Pouch'], description: 'Accurate pulse oximeter.' },
  { id: 90, name: 'Glucon-D Glucose Powder 1kg', brand: 'Glucon-D', category: 'Health', price: 199, originalPrice: 249, rating: 4.5, reviews: 34560, image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=700&auto=format&fit=crop'], stock: 300, badge: null, deal: false, featured: false, features: ['1kg Pack', 'Instant Energy', 'Orange Flavour', 'Calcium + Vitamin D', 'No Artificial Color'], description: 'Instant glucose energy drink.' },
  { id: 91, name: 'Dettol Hand Sanitizer 500ml', brand: 'Dettol', category: 'Health', price: 199, originalPrice: 299, rating: 4.6, reviews: 89032, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop'], stock: 500, badge: null, deal: true, featured: false, features: ['500ml Pump', '99.9% Germ Kill', 'No Water Needed', 'Moisturizing Formula', 'Aloe Vera'], description: 'Kills 99.9% germs.' },
  { id: 92, name: 'Dr. Ortho Pain Relief Oil', brand: 'Dr. Ortho', category: 'Health', price: 349, originalPrice: 499, rating: 4.3, reviews: 23450, image: 'https://images.unsplash.com/photo-1584990347449-39ad2b4d3e4b?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1584990347449-39ad2b4d3e4b?w=700&auto=format&fit=crop'], stock: 120, badge: null, deal: true, featured: false, features: ['100ml Bottle', 'Ayurvedic Formula', 'Joint + Muscle Pain', '12 Natural Oils', 'Quick Relief'], description: 'Ayurvedic pain relief oil.' },

  // Automotive (93-96)
  { id: 93, name: '3M Car Wax Polish', brand: '3M', category: 'Automotive', price: 699, originalPrice: 999, rating: 4.5, reviews: 8901, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=700&auto=format&fit=crop'], stock: 80, badge: null, deal: true, featured: false, features: ['200g', 'All-in-One', 'Scratch Removal', 'UV Protection', 'Carnauba Wax'], description: 'Professional car polish.' },
  { id: 94, name: 'Vega Bluetooth Helmet', brand: 'Vega', category: 'Automotive', price: 3499, originalPrice: 4999, rating: 4.4, reviews: 6780, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&auto=format&fit=crop'], stock: 20, badge: null, deal: false, featured: false, features: ['Full Face', 'ISI Mark', 'Bluetooth 5.0', 'Inbuilt Speakers', 'Anti-Scratch Visor'], description: 'ISI certified helmet.' },
  { id: 95, name: 'Amaron Car Battery 55Ah', brand: 'Amaron', category: 'Automotive', price: 4999, originalPrice: 6499, rating: 4.6, reviews: 5670, image: 'https://images.unsplash.com/photo-1609337283666-49eb81b0fb5f?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1609337283666-49eb81b0fb5f?w=700&auto=format&fit=crop'], stock: 15, badge: null, deal: true, featured: false, features: ['55Ah Capacity', 'MF Technology', '42-Month Warranty', 'Quick Cranking', 'Vibration Resistant'], description: "India's longest lasting battery." },
  { id: 96, name: 'Castrol Engine Oil 5L', brand: 'Castrol', category: 'Automotive', price: 2499, originalPrice: 3499, rating: 4.5, reviews: 12345, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=700&auto=format&fit=crop'], stock: 40, badge: null, deal: true, featured: false, features: ['5L Bottle', 'Fully Synthetic', 'Engine Protection', 'Better Mileage', 'Trusted Brand'], description: 'Premium engine oil.' },

  // Toys (97-100)
  { id: 97, name: 'LEGO City Police Station', brand: 'LEGO', category: 'Toys', price: 8999, originalPrice: 11999, rating: 4.8, reviews: 4321, image: 'https://images.unsplash.com/photo-1637516172038-4b239a1c0ec3?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1637516172038-4b239a1c0ec3?w=700&auto=format&fit=crop'], stock: 18, badge: 'new', deal: false, featured: false, features: ['743 Pieces', 'Ages 6+', 'Police Car', 'Helipad', '5 Minifigures'], description: 'Build and play LEGO set.' },
  { id: 98, name: 'Funskool Monopoly India', brand: 'Funskool', category: 'Toys', price: 699, originalPrice: 999, rating: 4.4, reviews: 12890, image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=700&auto=format&fit=crop'], stock: 60, badge: null, deal: true, featured: false, features: ['2-6 Players', 'Ages 8+', 'Indian Edition', 'Premium Board', 'Complete Set'], description: 'India edition Monopoly.' },
  { id: 99, name: 'Hot Wheels 20-Car Pack', brand: 'Hot Wheels', category: 'Toys', price: 1299, originalPrice: 1999, rating: 4.7, reviews: 23450, image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=700&auto=format&fit=crop'], stock: 45, badge: 'bestseller', deal: true, featured: false, features: ['20 Cars', 'Die-cast Metal', 'Ages 3+', 'Assorted Designs', 'Collectible'], description: 'Pack of 20 Hot Wheels cars.' },
  { id: 100, name: "Rubik's Cube 3x3 Original", brand: "Rubik's", category: 'Toys', price: 449, originalPrice: 699, rating: 4.6, reviews: 34560, image: 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=500&auto=format&fit=crop', images: ['https://images.unsplash.com/photo-1551361415-69c87624334f?w=700&auto=format&fit=crop'], stock: 100, badge: null, deal: true, featured: false, features: ['Original Rubik\'s', 'Smooth Turning', 'Durable Plastic', 'All Age Groups', 'Brain Teaser'], description: 'The original Rubik\'s Cube.' },
];

// ============================================
// SECTION 3: STATE MANAGEMENT
// ============================================

const STATE = {
  cart: JSON.parse(localStorage.getItem('nm_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('nm_wishlist') || '[]'),
  orders: JSON.parse(localStorage.getItem('nm_orders') || '[]'),
  user: JSON.parse(localStorage.getItem('nm_user') || 'null'),
  currentCategory: '',
  currentSearch: '',
  currentSort: 'default',
  priceMax: 200000,
  minRating: 0,
  stockFilter: 'all',
  visibleCount: 15,
  currentProductId: null,
  detailQty: 1,
  couponDiscount: 0,
  slideIndex: 0,
  checkoutAddress: null,
  checkoutPayment: 'upi',
};

// ============================================
// SECTION 4: PERSISTENCE FUNCTIONS
// ============================================

function saveCart() {
  localStorage.setItem('nm_cart', JSON.stringify(STATE.cart));
}

function saveWishlist() {
  localStorage.setItem('nm_wishlist', JSON.stringify(STATE.wishlist));
}

function saveOrders() {
  localStorage.setItem('nm_orders', JSON.stringify(STATE.orders));
}

function saveUser() {
  localStorage.setItem('nm_user', JSON.stringify(STATE.user));
}

// ============================================
// SECTION 5: MONGODB ATLAS API HELPERS
// ============================================

async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(STATE.user?.token ? { 'Authorization': `Bearer ${STATE.user.token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };
    const res = await fetch(BACKEND_CONFIG.API_BASE + endpoint, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function saveOrderToMongo(order) {
  const result = await apiCall(BACKEND_CONFIG.ENDPOINTS.ORDERS, 'POST', order);
  if (!result) {
    STATE.orders.push(order);
    saveOrders();
  }
}

async function loadOrdersFromMongo() {
  const result = await apiCall(BACKEND_CONFIG.ENDPOINTS.ORDERS);
  if (result?.orders) return result.orders;
  return STATE.orders;
}

// ============================================
// SECTION 6: TOAST NOTIFICATIONS
// ============================================

let toastTimer;

function showToast(msg, type = 'default') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ============================================
// SECTION 7: THEME TOGGLE
// ============================================

function toggleTheme() {
  const isDark = document.body.classList.toggle('light-mode');
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.textContent = isDark ? '🌙' : '☀️';
  }
  localStorage.setItem('nm_theme', isDark ? 'light' : 'dark');
}

function initTheme() {
  const savedTheme = localStorage.getItem('nm_theme');
  const themeBtn = document.getElementById('themeBtn');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeBtn) themeBtn.textContent = '🌙';
  } else {
    if (themeBtn) themeBtn.textContent = '☀️';
  }
}

// ============================================
// SECTION 8: CUSTOM CURSOR
// ============================================

(function initCursor() {
  const c = document.getElementById('cursor');
  const cf = document.getElementById('cursorFollower');
  if (!c || !cf) return;
  let mx = 0, my = 0, fx = 0, fy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animCursor() {
    if (c) { c.style.left = mx + 'px'; c.style.top = my + 'px'; }
    fx += (mx - fx) * 0.15;
    fy += (my - fy) * 0.15;
    if (cf) { cf.style.left = fx + 'px'; cf.style.top = fy + 'px'; }
    requestAnimationFrame(animCursor);
  }
  animCursor();
  document.addEventListener('mousedown', () => { if (cf) cf.style.transform = 'translate(-50%,-50%) scale(0.75)'; });
  document.addEventListener('mouseup', () => { if (cf) cf.style.transform = 'translate(-50%,-50%) scale(1)'; });
})();

// ============================================
// SECTION 9: LOADING SCREEN
// ============================================

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const ls = document.getElementById('loadingScreen');
    if (ls) ls.classList.add('done');
  }, 2000);
});

// ============================================
// SECTION 10: PAGE NAVIGATION
// ============================================

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(`page-${page}`);
  if (pg) {
    pg.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (page === 'wishlist') renderWishlistPage();
  if (page === 'orders') renderOrdersPage();
  if (page === 'profile') renderProfilePage();
}

// ============================================
// SECTION 11: HERO SLIDER
// ============================================

function goSlide(idx) {
  const total = document.querySelectorAll('.hero-slide').length;
  idx = ((idx % total) + total) % total;
  document.querySelectorAll('.hero-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  STATE.slideIndex = idx;
}

setInterval(() => goSlide(STATE.slideIndex + 1), 5000);

// ============================================
// SECTION 12: STATS COUNTER ANIMATION
// ============================================

function animateStats() {
  document.querySelectorAll('.stat-n').forEach(el => {
    const target = +el.dataset.target;
    let cur = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(timer); }
      el.textContent = Math.floor(cur);
    }, 25);
  });
}

setTimeout(animateStats, 2200);

// ============================================
// SECTION 13: SEARCH FUNCTIONALITY
// ============================================

let searchDebounce;

document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('searchInput');
  if (inp) {
    inp.addEventListener('input', function() {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => showSuggestions(this.value), 250);
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { doSearch(); hideSuggestions(); } });
  }
  document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) hideSuggestions(); });
  const si = document.getElementById('searchInput');
  if (si) si.addEventListener('keypress', e => { if (e.key === 'Enter') doSearch(); });
});

function showSuggestions(q) {
  const box = document.getElementById('searchSuggestions');
  if (!box) return;
  if (!q.trim()) { box.innerHTML = ''; return; }
  const results = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.brand.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 7);
  if (!results.length) { box.innerHTML = ''; return; }
  box.innerHTML = results.map(p => `
    <div class="suggest-item" onclick="goProductDetail(${p.id}); hideSuggestions()">
      <img src="${p.image}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;" />
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:700;color:var(--white)">${p.name}</div>
        <div style="font-size:11px;color:var(--text-muted)">${p.category} · ₹${p.price.toLocaleString()}</div>
      </div>
    </div>
  `).join('');
}

function hideSuggestions() {
  const box = document.getElementById('searchSuggestions');
  if (box) box.innerHTML = '';
}

function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  const catFilter = document.getElementById('searchCategory').value;
  if (!q) return;
  let results = PRODUCTS.filter(p =>
    (p.name.toLowerCase().includes(q.toLowerCase()) ||
     p.brand.toLowerCase().includes(q.toLowerCase()) ||
     p.description.toLowerCase().includes(q.toLowerCase()) ||
     p.category.toLowerCase().includes(q.toLowerCase())) &&
    (!catFilter || p.category === catFilter)
  );
  const title = document.getElementById('searchResultsTitle');
  if (title) title.textContent = `"${q}" — ${results.length} result${results.length !== 1 ? 's' : ''} found`;
  const grid = document.getElementById('searchResultsGrid');
  const empty = document.getElementById('noSearchResults');
  if (!results.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); }
  else { empty.classList.add('hidden'); grid.innerHTML = results.map((p, i) => productCard(p, i)).join(''); }
  showPage('search');
  hideSuggestions();
}

// ============================================
// SECTION 14: CATEGORY FILTER
// ============================================

function filterCategory(cat, btnEl) {
  STATE.currentCategory = cat;
  STATE.visibleCount = 15;
  if (btnEl) {
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }
  const title = document.getElementById('allProductsTitle');
  if (title) title.textContent = cat ? (cat === 'Deal' ? '🔥 Today\'s Deals' : cat) : 'All Products';
  renderMainProducts();
  showPage('home');
  const el = document.getElementById('allProductsTitle');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// SECTION 15: SORT & FILTERS
// ============================================

function applySortFilter() {
  STATE.currentSort = document.getElementById('sortSelect').value;
  STATE.visibleCount = 15;
  renderMainProducts();
}

function applyPriceFilter(val) {
  STATE.priceMax = +val;
  document.getElementById('priceVal').textContent = (+val).toLocaleString();
  STATE.visibleCount = 15;
  renderMainProducts();
}

function setRatingFilter(val, btn) {
  STATE.minRating = val;
  document.querySelectorAll('.rating-btns .rating-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMainProducts();
}

function setStockFilter(val, btn) {
  STATE.stockFilter = val;
  document.querySelectorAll('.filter-group:last-child .rating-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMainProducts();
}

function toggleFilterPanel() {
  const panel = document.getElementById('filterPanel');
  panel.classList.toggle('open');
}

function getFilteredProducts() {
  let list = [...PRODUCTS];
  if (STATE.currentCategory === 'Deal') list = list.filter(p => p.deal);
  else if (STATE.currentCategory) list = list.filter(p => p.category === STATE.currentCategory);
  list = list.filter(p => p.price <= STATE.priceMax);
  list = list.filter(p => p.rating >= STATE.minRating);
  if (STATE.stockFilter === 'instock') list = list.filter(p => p.stock > 0);
  if (STATE.stockFilter === 'deals') list = list.filter(p => p.deal);
  if (STATE.currentSort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (STATE.currentSort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (STATE.currentSort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else if (STATE.currentSort === 'discount') list.sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price));
  else if (STATE.currentSort === 'newest') list.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0));
  return list;
}

function loadMore() {
  STATE.visibleCount += 10;
  renderMainProducts();
}

// ============================================
// SECTION 16: STAR RATING
// ============================================

function stars(r) {
  const full = Math.floor(r);
  const half = r % 1 >= 0.5;
  let s = '★'.repeat(full);
  if (half) s += '½';
  return s.padEnd(5, '☆');
}

function discount(price, orig) {
  return Math.round(((orig - price) / orig) * 100);
}

// ============================================
// SECTION 17: PRODUCT CARD
// ============================================

function productCard(p, idx = 0) {
  const isWished = STATE.wishlist.some(w => w.id === p.id);
  const off = discount(p.price, p.originalPrice);
  const badgeHtml = p.badge ? `<div class="product-badge badge-${p.badge}">${p.badge === 'bestseller' ? '🏆 Bestseller' : p.badge === 'new' ? '✨ New' : p.badge === 'deal' ? '🔥 Deal' : p.badge === 'hot' ? '🌶 Hot' : p.badge === 'limited' ? '⚡ Limited' : p.badge}</div>` : '';
  const lowStock = p.stock > 0 && p.stock <= 5 ? `<div style="font-size:11px;color:var(--gold);margin-bottom:6px;font-weight:700;">⚠ Only ${p.stock} left!</div>` : '';
  return `
  <div class="product-card card-enter" style="animation-delay:${idx * 0.05}s" onclick="goProductDetail(${p.id})">
    <div class="product-img-wrap">
      ${badgeHtml}
      <button class="product-wish ${isWished ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${p.id})" title="${isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}">
        ${isWished ? '❤️' : '🤍'}
      </button>
      <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&auto=format'" />
      <div class="product-quick" onclick="event.stopPropagation(); openQuickView(${p.id})">Quick View ↗</div>
    </div>
    <div class="product-info">
      <div class="product-brand">${p.brand}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-rating">
        <span class="stars">${stars(p.rating)}</span>
        <span class="rating-num">${p.rating} (${p.reviews.toLocaleString()})</span>
      </div>
      <div class="product-price">
        ${lowStock}
        <div class="price-row">
          <span class="price-current">₹${p.price.toLocaleString()}</span>
          ${p.originalPrice > p.price ? `<span class="price-original">₹${p.originalPrice.toLocaleString()}</span><span class="price-off">${off}% off</span>` : ''}
        </div>
        ${p.stock === 0
          ? '<div class="out-of-stock"><button class="add-to-cart-btn" disabled>Out of Stock</button></div>'
          : `<button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>`
        }
      </div>
    </div>
  </div>`;
}

// ============================================
// SECTION 18: RENDER SECTIONS
// ============================================

function renderDeals() {
  const grid = document.getElementById('dealsGrid');
  if (!grid) return;
  const deals = PRODUCTS.filter(p => p.deal).slice(0, 10);
  grid.innerHTML = deals.map((p, i) => productCard(p, i)).join('');
}

function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const feat = PRODUCTS.filter(p => p.featured);
  grid.innerHTML = feat.map((p, i) => productCard(p, i)).join('');
}

function renderMainProducts() {
  const grid = document.getElementById('mainProductsGrid');
  const noP = document.getElementById('noProducts');
  const btn = document.getElementById('loadMoreBtn');
  if (!grid) return;
  const list = getFilteredProducts();
  if (!list.length) { grid.innerHTML = ''; noP.classList.remove('hidden'); btn.style.display = 'none'; return; }
  noP.classList.add('hidden');
  grid.innerHTML = list.slice(0, STATE.visibleCount).map((p, i) => productCard(p, i)).join('');
  btn.style.display = list.length > STATE.visibleCount ? 'inline-block' : 'none';
}

// ============================================
// SECTION 19: PRODUCT DETAIL PAGE
// ============================================

function goProductDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  STATE.currentProductId = id;
  STATE.detailQty = 1;
  const isWished = STATE.wishlist.some(w => w.id === id);
  const off = discount(p.price, p.originalPrice);
  const content = document.getElementById('productDetailContent');
  if (!content) return;
  content.innerHTML = `
    <button onclick="showPage('home')" style="margin:24px 0 0;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;font-weight:700;">
      ← Back to Products
    </button>
    <div class="product-detail">
      <div class="detail-gallery">
        <div class="detail-main-img" id="detailMainImg">
          <img src="${p.images[0]}" alt="${p.name}" id="detailMainImgEl" />
        </div>
        <div class="detail-thumbs">
          ${p.images.map((img, i) => `
            <div class="detail-thumb ${i === 0 ? 'active' : ''}" onclick="switchDetailImg(this, '${img}')">
              <img src="${img}" alt="view ${i + 1}" />
            </div>`).join('')}
        </div>
      </div>
      <div class="detail-info">
        <div class="detail-brand">${p.brand}</div>
        <h1 class="detail-name">${p.name}</h1>
        <div class="detail-rating">
          <span class="stars" style="color:var(--gold);font-size:18px;">${stars(p.rating)}</span>
          <span style="font-weight:700;color:var(--white);font-size:16px;">${p.rating}</span>
          <span style="color:var(--text-muted);font-size:14px;">(${p.reviews.toLocaleString()} reviews)</span>
        </div>
        <div class="detail-price-row">
          <span class="detail-price">₹${p.price.toLocaleString()}</span>
          ${p.originalPrice > p.price ? `<span class="detail-original">₹${p.originalPrice.toLocaleString()}</span><span class="detail-off">${off}% OFF</span>` : ''}
        </div>
        <div class="detail-stock">
          ${p.stock === 0 ? '<span class="low">❌ Out of Stock</span>' : p.stock <= 5 ? `<span class="low">⚠️ Only ${p.stock} left in stock — order soon!</span>` : '<span class="in">✅ In Stock</span>'}
        </div>
        <p class="detail-desc">${p.description}</p>
        <div class="detail-features">
          <h4>Key Features</h4>
          <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>
        ${p.stock > 0 ? `
        <div class="detail-qty-row">
          <span class="detail-qty-label">Quantity:</span>
          <div class="detail-qty">
            <button class="dqty-btn" onclick="changeDetailQty(-1)">−</button>
            <span class="dqty-num" id="detailQtyDisplay">1</span>
            <button class="dqty-btn" onclick="changeDetailQty(1)">+</button>
          </div>
        </div>
        <div class="detail-actions">
          <button class="detail-add-cart" onclick="addToCartDetail(${p.id})">🛒 Add to Cart</button>
          <button class="detail-wish-btn" id="detailWishBtn" onclick="toggleWishlist(${p.id}); this.textContent = STATE.wishlist.some(w=>w.id===${p.id}) ? '❤️' : '🤍';" title="Wishlist">${isWished ? '❤️' : '🤍'}</button>
        </div>` : '<div style="color:var(--red);font-weight:700;margin-top:12px;">This product is currently out of stock.</div>'}
      </div>
    </div>`;
  showPage('detail');
}

function switchDetailImg(thumbEl, src) {
  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
  const img = document.getElementById('detailMainImgEl');
  if (img) img.src = src;
}

function changeDetailQty(delta) {
  const p = PRODUCTS.find(x => x.id === STATE.currentProductId);
  STATE.detailQty = Math.max(1, Math.min(p ? p.stock : 10, STATE.detailQty + delta));
  const el = document.getElementById('detailQtyDisplay');
  if (el) el.textContent = STATE.detailQty;
}

function addToCartDetail(id) {
  for (let i = 0; i < STATE.detailQty; i++) addToCart(id, false);
  updateCartBadge();
  showToast(`${STATE.detailQty} item(s) added to cart! 🛒`, 'success');
}

// ============================================
// SECTION 20: QUICK VIEW
// ============================================

function openQuickView(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const off = discount(p.price, p.originalPrice);
  const isWished = STATE.wishlist.some(w => w.id === id);
  const box = document.getElementById('quickViewContent');
  if (!box) return;
  box.innerHTML = `
    <div class="modal-close" onclick="closeModal('quickViewModal')">✕</div>
    <div class="qv-img"><img src="${p.images[0]}" alt="${p.name}" /></div>
    <div class="qv-info">
      <div class="qv-brand">${p.brand} · ${p.category}</div>
      <h3 class="qv-name">${p.name}</h3>
      <p class="qv-desc">${p.description}</p>
      <ul class="qv-features">${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
      <div class="qv-price-row">
        <span class="qv-price">₹${p.price.toLocaleString()}</span>
        ${p.originalPrice > p.price ? `<span class="qv-original">₹${p.originalPrice.toLocaleString()}</span><span class="qv-discount">${off}% OFF</span>` : ''}
      </div>
      <div class="qv-stock">
        ${p.stock === 0 ? '<span class="low">❌ Out of stock</span>' : p.stock <= 5 ? `<span class="low">Only ${p.stock} left!</span>` : '<span class="in">✅ In Stock</span>'}
      </div>
      <div class="qv-actions">
        ${p.stock > 0 ? `<button class="btn-primary full" onclick="addToCart(${id}); closeModal('quickViewModal')">🛒 Add to Cart</button>` : '<button class="btn-primary full" disabled>Out of Stock</button>'}
        <button class="btn-outline full" onclick="closeModal('quickViewModal'); goProductDetail(${id})">View Full Details →</button>
      </div>
    </div>`;
  showModal('quickViewModal');
}

// ============================================
// SECTION 21: CART FUNCTIONALITY
// ============================================

function addToCart(id, showMsg = true) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p || p.stock === 0) return;
  const item = STATE.cart.find(c => c.id === id);
  if (item) {
    if (item.qty < p.stock) item.qty++;
    else { showToast('Maximum stock reached', 'error'); return; }
  } else {
    STATE.cart.push({ ...p, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  if (showMsg) showToast(`${p.name} added to cart 🛒`, 'success');
}

function removeFromCart(id) {
  STATE.cart = STATE.cart.filter(c => c.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
}

function updateCartQty(id, delta) {
  const item = STATE.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function updateCartBadge() {
  const total = STATE.cart.reduce((s, c) => s + c.qty, 0);
  const el = document.getElementById('cartBadge');
  if (el) el.textContent = total;
  const cc = document.getElementById('cartCount');
  if (cc) cc.textContent = total > 0 ? `(${total})` : '';
}

function openCart() {
  renderCart();
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if (!itemsEl) return;
  if (!STATE.cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty-msg"><div class="empty-icon">🛒</div><p>Your cart is empty</p><br><button class="btn-primary" onclick="closeCart()">Start Shopping</button></div>`;
    if (footerEl) footerEl.innerHTML = '';
    return;
  }
  itemsEl.innerHTML = STATE.cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400'"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-qty-row">
          <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
          <button class="cart-remove" onclick="removeFromCart(${item.id})">✕ Remove</button>
        </div>
      </div>
    </div>`).join('');

  const sub = STATE.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = sub >= 499 ? 0 : 49;
  const disc = STATE.couponDiscount || 0;
  const total = sub + shipping - disc;
  if (footerEl) footerEl.innerHTML = `
    <div class="cart-total-row"><span>Subtotal</span><span class="val">₹${sub.toLocaleString()}</span></div>
    <div class="cart-total-row"><span>Shipping</span><span class="val">${shipping === 0 ? '<span style="color:var(--green)">FREE</span>' : '₹' + shipping}</span></div>
    ${disc > 0 ? `<div class="cart-total-row"><span>Discount</span><span class="val" style="color:var(--green)">−₹${disc.toLocaleString()}</span></div>` : ''}
    <div class="cart-total-row grand"><span>Total</span><span class="val">₹${total.toLocaleString()}</span></div>
    <button class="checkout-btn" onclick="startCheckout()">Proceed to Checkout →</button>`;
}

function startCheckout() {
  if (!STATE.user) { showToast('Please sign in to checkout', 'info'); closeCart(); showModal('loginModal'); return; }
  if (!STATE.cart.length) { showToast('Your cart is empty', 'error'); return; }
  closeCart();
  document.querySelectorAll('[id^=checkoutStep]').forEach(el => el.classList.add('hidden'));
  document.getElementById('checkoutStep1').classList.remove('hidden');
  document.querySelectorAll('.step').forEach((s, i) => { s.classList.toggle('active', i === 0); s.classList.remove('done'); });
  document.getElementById('couponMsg').textContent = '';
  document.getElementById('couponInput').value = '';
  showModal('checkoutModal');
}

// ============================================
// SECTION 22: WISHLIST FUNCTIONALITY
// ============================================

function toggleWishlist(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const idx = STATE.wishlist.findIndex(w => w.id === id);
  if (idx >= 0) { STATE.wishlist.splice(idx, 1); showToast(`Removed from wishlist`, 'default'); }
  else { STATE.wishlist.push(p); showToast(`${p.name} added to wishlist ❤️`, 'success'); }
  saveWishlist();
  updateWishBadge();
  renderMainProducts();
  renderDeals();
  renderFeatured();
}

function updateWishBadge() {
  const el = document.getElementById('wishBadge');
  if (el) el.textContent = STATE.wishlist.length;
}

function renderWishlistPage() {
  const grid = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  if (!grid) return;
  if (!STATE.wishlist.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  grid.innerHTML = STATE.wishlist.map((p, i) => productCard(p, i)).join('');
}

// ============================================
// SECTION 23: AUTHENTICATION
// ============================================

function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  if (!email || !pass) { showToast('Please fill all fields', 'error'); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { showToast('Invalid email address', 'error'); return; }
  STATE.user = { name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), email, token: 'mock_token_' + Date.now() };
  saveUser();
  updateAuthUI();
  closeModal('loginModal');
  showToast(`Welcome back, ${STATE.user.name}! 👋`, 'success');
}

function register() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass = document.getElementById('regPassword').value.trim();
  if (!name || !email || !phone || !pass) { showToast('Please fill all fields', 'error'); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { showToast('Invalid email', 'error'); return; }
  if (phone.length !== 10) { showToast('Enter valid 10-digit phone', 'error'); return; }
  STATE.user = { name, email, phone, token: 'mock_token_' + Date.now() };
  saveUser();
  updateAuthUI();
  closeModal('registerModal');
  showToast(`Welcome to NexMart, ${name}! 🎉`, 'success');
}

function logout() {
  STATE.user = null;
  saveUser();
  updateAuthUI();
  showToast('Signed out successfully', 'default');
  showPage('home');
}

function updateAuthUI() {
  const label = document.getElementById('userLabel');
  const guest = document.getElementById('guestMenu');
  const logged = document.getElementById('loggedMenu');
  const dropName = document.getElementById('dropUsername');
  if (STATE.user) {
    if (label) label.textContent = STATE.user.name.split(' ')[0];
    if (guest) guest.classList.add('hidden');
    if (logged) logged.classList.remove('hidden');
    if (dropName) dropName.textContent = STATE.user.name;
  } else {
    if (label) label.textContent = 'Account';
    if (guest) guest.classList.remove('hidden');
    if (logged) logged.classList.add('hidden');
  }
}

function toggleUserMenu() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.toggle('hidden');
}

// ============================================
// SECTION 24: PROFILE PAGE
// ============================================

function renderProfilePage() {
  const content = document.getElementById('profileContent');
  if (!content || !STATE.user) {
    if (content) content.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div><h3>Not Signed In</h3><p>Sign in to view your profile</p><button class="btn-primary" onclick="showModal('loginModal')">Sign In</button></div>`;
    return;
  }
  const initials = STATE.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  content.innerHTML = `
    <h2 class="page-title">👤 My Profile</h2>
    <div class="profile-card">
      <div class="profile-avatar">${initials}</div>
      <div class="profile-name">${STATE.user.name}</div>
      <div class="profile-email">${STATE.user.email}${STATE.user.phone ? ' · ' + STATE.user.phone : ''}</div>
      <div class="profile-stats">
        <div class="stat-box"><span class="stat-num">${STATE.orders.length}</span><div class="stat-label">Orders</div></div>
        <div class="stat-box"><span class="stat-num">${STATE.wishlist.length}</span><div class="stat-label">Wishlist</div></div>
        <div class="stat-box"><span class="stat-num">₹${STATE.orders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}</span><div class="stat-label">Total Spent</div></div>
      </div>
      <button class="btn-outline" onclick="logout()" style="margin-top:8px">Sign Out</button>
    </div>`;
}

// ============================================
// SECTION 25: ORDERS PAGE
// ============================================

async function renderOrdersPage() {
  const container = document.getElementById('ordersContainer');
  const empty = document.getElementById('ordersEmpty');
  if (!container) return;
  if (!STATE.user) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    empty.querySelector('h3').textContent = 'Sign in to view orders';
    return;
  }
  const orders = await loadOrdersFromMongo();
  if (!orders.length) { container.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  container.innerHTML = orders.slice().reverse().map(order => `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <div class="order-id">#${order.id}</div>
          <div class="order-date">${order.date}</div>
        </div>
        <div class="order-status status-${order.status.toLowerCase().replace(' ', '')}">${order.status}</div>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item-row">
            <img class="order-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1567016432779-094069958ea5?w=200'"/>
            <div class="order-item-name">${item.name} × ${item.qty}</div>
            <div class="order-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
          </div>`).join('')}
      </div>
      <div class="order-card-footer">
        <span class="order-total">Total: ₹${order.total.toLocaleString()}</span>
        <div style="display:flex;gap:8px">
          <button class="order-action-btn" onclick="showToast('Tracking info sent to your email 📧','success')">📍 Track</button>
          <button class="order-action-btn" onclick="showToast('Invoice downloading... 📄','info')">📄 Invoice</button>
        </div>
      </div>
    </div>`).join('');
}

// ============================================
// SECTION 26: CHECKOUT PROCESS
// ============================================

function checkoutNext(step) {
  if (step === 1) {
    const fn = document.getElementById('delivFName').value.trim();
    const ph = document.getElementById('delivPhone').value.trim();
    const a1 = document.getElementById('delivAddr1').value.trim();
    const ci = document.getElementById('delivCity').value.trim();
    const pi = document.getElementById('delivPin').value.trim();
    if (!fn || !ph || !a1 || !ci || !pi) { showToast('Please fill all required fields', 'error'); return; }
    if (ph.length !== 10 || isNaN(ph)) { showToast('Enter valid 10-digit phone', 'error'); return; }
    if (pi.length !== 6 || isNaN(pi)) { showToast('Enter valid 6-digit PIN code', 'error'); return; }
    STATE.checkoutAddress = {
      name: fn + ' ' + (document.getElementById('delivLName').value.trim()),
      phone: ph,
      addr: a1 + (document.getElementById('delivAddr2').value ? ', ' + document.getElementById('delivAddr2').value : ''),
      city: ci,
      state: document.getElementById('delivState').value,
      pin: pi,
    };
    document.getElementById('checkoutStep1').classList.add('hidden');
    document.getElementById('checkoutStep2').classList.remove('hidden');
    document.getElementById('step-ind-1').classList.remove('active');
    document.getElementById('step-ind-1').classList.add('done');
    document.getElementById('step-ind-2').classList.add('active');
  } else if (step === 2) {
    STATE.checkoutPayment = document.querySelector('input[name=payment]:checked')?.value || 'upi';
    document.getElementById('checkoutStep2').classList.add('hidden');
    document.getElementById('checkoutStep3').classList.remove('hidden');
    document.getElementById('step-ind-2').classList.remove('active');
    document.getElementById('step-ind-2').classList.add('done');
    document.getElementById('step-ind-3').classList.add('active');
    renderOrderReview();
  }
}

function checkoutBack(step) {
  if (step === 2) {
    document.getElementById('checkoutStep2').classList.add('hidden');
    document.getElementById('checkoutStep1').classList.remove('hidden');
    document.getElementById('step-ind-2').classList.remove('active', 'done');
    document.getElementById('step-ind-1').classList.add('active');
    document.getElementById('step-ind-1').classList.remove('done');
  } else if (step === 3) {
    document.getElementById('checkoutStep3').classList.add('hidden');
    document.getElementById('checkoutStep2').classList.remove('hidden');
    document.getElementById('step-ind-3').classList.remove('active');
    document.getElementById('step-ind-2').classList.add('active');
    document.getElementById('step-ind-2').classList.remove('done');
  }
}

function renderOrderReview() {
  const div = document.getElementById('orderReview');
  if (!div) return;
  const sub = STATE.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = sub >= 499 ? 0 : 49;
  const disc = STATE.couponDiscount || 0;
  const total = sub + shipping - disc;
  const addr = STATE.checkoutAddress;
  const payLabels = { upi: '📱 UPI', card: '💳 Card', netbanking: '🏦 Net Banking', wallet: '👛 Wallet', emi: '📅 EMI', cod: '💵 Cash on Delivery' };
  div.innerHTML = `
    ${STATE.cart.map(item => `
      <div class="review-item">
        <span>${item.name} × ${item.qty}</span>
        <span>₹${(item.price * item.qty).toLocaleString()}</span>
      </div>`).join('')}
    <div class="review-item"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : '₹' + shipping}</span></div>
    ${disc > 0 ? `<div class="review-item"><span>Coupon Discount</span><span style="color:var(--green)">−₹${disc.toLocaleString()}</span></div>` : ''}
    <div class="review-total"><span>Grand Total</span><span>₹${total.toLocaleString()}</span></div>
    <div class="review-address">
      <strong>📍 Delivery to:</strong><br>${addr?.name}<br>${addr?.addr}, ${addr?.city}, ${addr?.state} - ${addr?.pin}<br>📞 ${addr?.phone}
    </div>
    <div class="review-address">
      <strong>💳 Payment:</strong> ${payLabels[STATE.checkoutPayment] || STATE.checkoutPayment}
    </div>`;
}

function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const msg = document.getElementById('couponMsg');
  const COUPONS = { 'NEXMART15': 15, 'FIRST10': 10, 'SAVE20': 20, 'FLAT100': 0, 'WELCOME': 5 };
  if (COUPONS[code] !== undefined) {
    const sub = STATE.cart.reduce((s, c) => s + c.price * c.qty, 0);
    STATE.couponDiscount = code === 'FLAT100' ? 100 : Math.round(sub * COUPONS[code] / 100);
    msg.textContent = `✅ Coupon applied! You saved ₹${STATE.couponDiscount}`;
    msg.className = 'coupon-msg ok';
  } else {
    STATE.couponDiscount = 0;
    msg.textContent = '❌ Invalid coupon code';
    msg.className = 'coupon-msg err';
  }
}

async function placeOrder() {
  const sub = STATE.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = sub >= 499 ? 0 : 49;
  const total = sub + shipping - (STATE.couponDiscount || 0);
  const orderId = 'NX' + Date.now().toString(36).toUpperCase();
  const order = {
    id: orderId,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    items: STATE.cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, image: c.image })),
    total,
    status: 'Placed',
    address: STATE.checkoutAddress,
    payment: STATE.checkoutPayment,
    user: STATE.user?.email,
  };
  await saveOrderToMongo(order);
  STATE.cart = [];
  STATE.couponDiscount = 0;
  saveCart();
  updateCartBadge();
  closeModal('checkoutModal');
  const successId = document.getElementById('successOrderId');
  if (successId) successId.textContent = `Order ID: ${orderId}`;
  showModal('successModal');
}

// ============================================
// SECTION 27: DEAL TIMER
// ============================================

function updateDealTimer() {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 0);
  const diff = end - now;
  if (diff <= 0) return;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const el = document.getElementById('dealTimer');
  if (el) el.textContent = `⏰ Ends in: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

setInterval(updateDealTimer, 1000);

// ============================================
// SECTION 28: MODAL FUNCTIONS
// ============================================

function showModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

function closeModalOutside(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}

// ============================================
// SECTION 29: HEADER SCROLL EFFECT
// ============================================

window.addEventListener('scroll', () => {
  const h = document.getElementById('mainHeader');
  if (h) h.classList.toggle('scrolled', window.scrollY > 40);
});

// ============================================
// SECTION 30: CLOSE DROPDOWN ON OUTSIDE CLICK
// ============================================

document.addEventListener('click', e => {
  const dd = document.getElementById('userDropdown');
  if (dd && !e.target.closest('#userMenuBtn')) dd.classList.add('hidden');
});

// ============================================
// SECTION 31: KEYBOARD ESCAPE
// ============================================

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['loginModal', 'registerModal', 'checkoutModal', 'quickViewModal', 'successModal'].forEach(closeModal);
    closeCart();
  }
});

// ============================================
// SECTION 32: INITIALIZATION
// ============================================

function init() {
  initTheme();
  renderDeals();
  renderFeatured();
  renderMainProducts();
  updateCartBadge();
  updateWishBadge();
  updateAuthUI();
  updateDealTimer();
  const fy = document.getElementById('footerYear');
  if (fy) fy.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);