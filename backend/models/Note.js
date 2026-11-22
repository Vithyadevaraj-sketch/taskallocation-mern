const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  time: { type: String, default: '' },
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model('Note', noteSchema);