const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  desc: { type: String, default: '' },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'On hold', 'Completed'], default: 'Active' },
});

module.exports = mongoose.model('Project', projectSchema);