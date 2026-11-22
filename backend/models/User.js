const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  login: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  pwHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Employee'], default: 'Employee' },
  skills: { type: [String], default: [] },
  onLeave: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);