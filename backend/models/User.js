const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'support', 'manager', 'admin'], default: 'user' },
  cart: [{ productId: Number, qty: Number }],
  wishlist: [Number],
  addresses: [{ label: String, name: String, phone: String, addr: String, city: String, state: String, pin: String }],
}, { timestamps: true }));

module.exports = User;