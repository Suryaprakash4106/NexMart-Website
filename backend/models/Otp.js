const mongoose = require('mongoose');

// Pending signups: account is created only after the OTP is verified.
const Otp = mongoose.model('Otp', new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  codeHash: { type: String, required: true },
  name: { type: String, required: true },
  phone: String,
  passwordHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // auto-delete after expiry
}, { timestamps: true }));

module.exports = Otp;