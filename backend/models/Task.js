const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true },
  desc: { type: String, default: '' },
  pri: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  due: { type: String, default: '' },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  skills: { type: [String], default: [] },
  allocReason: { type: String, default: '' },
  comments: [{ by: String, at: String, text: String }],
});

module.exports = mongoose.model('Task', taskSchema);