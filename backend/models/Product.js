const mongoose = require('mongoose');

const Product = mongoose.model('Product', new mongoose.Schema({
  pid: { type: Number, unique: true, index: true },
  name: String, brand: String, category: { type: String, index: true },
  price: Number, originalPrice: Number, rating: Number, reviews: Number,
  image: String, images: [String], stock: Number, badge: String,
  deal: Boolean, featured: Boolean, features: [String], description: String,
  subcategory: { type: String, index: true },
  specs: [{ k: String, v: String }],
  tags: [String],
}, { timestamps: true }));

module.exports = Product;
