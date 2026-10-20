const mongoose = require('mongoose');

// Who did what in the admin panel. Entries older than 180 days are removed automatically.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  role: String,
  action: String,   // e.g. order.status, product.stock
  target: String,   // order id, product name, user email...
  detail: String,
}, { timestamps: true });

schema.index({ createdAt: -1 });
schema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 3600 });

module.exports = mongoose.model('Activity', schema);