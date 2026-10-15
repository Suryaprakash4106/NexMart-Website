const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  pid: { type: Number, index: true },                       // product id
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  comment: String,
  verified: { type: Boolean, default: false },              // bought this product on NexMart
  sample: { type: Boolean, default: false },                // demo review imported with the catalog
}, { timestamps: true });

// one review per customer per product (sample reviews have no user, so they are skipped)
schema.index({ pid: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } });

module.exports = mongoose.model('Review', schema);
