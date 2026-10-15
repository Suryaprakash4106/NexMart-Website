const mongoose = require('mongoose');

const Order = mongoose.model('Order', new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  items: [{ productId: Number, name: String, price: Number, qty: Number, image: String }],
  subtotal: Number, shipping: Number, discount: Number, total: Number,
  coupon: String,
  address: { name: String, phone: String, addr: String, city: String, state: String, pin: String },
  payment: String,
  status: { type: String, enum: ['Pending Payment', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
  paid: { type: Boolean, default: false }, rzpOrderId: String, rzpPaymentId: String,
}, { timestamps: true }));

module.exports = Order;
