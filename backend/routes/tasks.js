const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { auth, needMgr } = require('../middleware/auth');
const autoPick = require('../utils/allocation');
const notify = require('../utils/notify');

const router = express.Router();
const STATUS = ['To Do', 'In Progress', 'Done'];
const PRI = ['High', 'Medium', 'Low'];

const skl = (v) => {
  const arr = Array.isArray(v) ? v : String(v || '').split(',');
  return [...new Set(arr.map((s) => String(s).trim().toLowerCase()).filter(Boolean))];
};

// returns { id, reason }. id: user id, null (unassigned) or undefined (invalid employee)
async function pickAssignee(value, skills) {
  if (value === 'auto') {
    const best = await autoPick(skills);
    return best ? { id: best.id, reason: best.reason } : { id: null, reason: '' };
  }
  if (!value) return { id: null, reason: '' };
  if (!mongoose.isValidObjectId(value)) return { id: undefined, reason: '' };
  const u = await User.findOne({ _id: value, role: 'Employee' });
  return u ? { id: u._id, reason: '' } : { id: undefined, reason: '' };
}

// create task
router.post('/', auth, needMgr, async (req, res) => {
  const title = String(req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Enter a task title.' });
  if (!mongoose.isValidObjectId(req.body.project) || !(await Project.findById(req.body.project)))
    return res.status(400).json({ error: 'Project not found' });
  const skills = skl(req.body.skills);
  const { id: assignee, reason } = await pickAssignee(req.body.assignee, skills);
  if (assignee === undefined) return res.status(400).json({ error: 'Employee not found' });
  await Task.create({
    project: req.body.project,
    title,
    desc: req.body.desc || '',
    pri: PRI.includes(req.body.pri) ? req.body.pri : 'Medium',
    due: req.body.due || '',
    assignee,
    skills,
    allocReason: reason,
  });
  await notify(assignee, `New task assigned: "${title}"`);
  res.json({ ok: true });
});

// edit task
router.put('/:id', auth, needMgr, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const title = String(req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Enter a task title.' });
  if (!mongoose.isValidObjectId(req.body.project) || !(await Project.findById(req.body.project)))
    return res.status(400).json({ error: 'Project not found' });
  const skills = skl(req.body.skills);
  const { id: assignee, reason } = await pickAssignee(req.body.assignee, skills);
  if (assignee === undefined) return res.status(400).json({ error: 'Employee not found' });
  const assigneeChanged = String(assignee) !== String(task.assignee);
  task.project = req.body.project;
  task.title = title;
  task.desc = req.body.desc || '';
  task.pri = PRI.includes(req.body.pri) ? req.body.pri : 'Medium';
  task.due = req.body.due || '';
  task.assignee = assignee;
  task.skills = skills;
  if (assigneeChanged) task.allocReason = reason;
  await task.save();
  if (assignee && assigneeChanged) await notify(assignee, `New task assigned: "${title}"`);
  res.json({ ok: true });
});

// reassign (employee id or "auto")
router.post('/:id/assign', auth, needMgr, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const { id: assignee, reason } = await pickAssignee(req.body.assignee, task.skills);
  if (!assignee) return res.status(400).json({ error: 'No employee is available for auto-pick.' });
  task.assignee = assignee;
  task.allocReason = reason;
  await task.save();
  await notify(assignee, `New task assigned: "${task.title}"`);
  res.json({ ok: true });
});

// change status (employee: only own task)
router.patch('/:id/status', auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (!STATUS.includes(req.body.status)) return res.status(400).json({ error: 'Bad status' });
  if (req.user.role === 'Employee' && String(task.assignee) !== String(req.user._id))
    return res.status(403).json({ error: 'This is not your task' });
  task.status = req.body.status;
  await task.save();
  const managers = await User.find({ role: { $ne: 'Employee' } });
  for (const m of managers) {
    await notify(m._id, `${req.user.name} moved "${task.title}" to ${task.status}`);
  }
  res.json({ ok: true });
});

// add comment
router.post('/:id/comments', auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (req.user.role === 'Employee' && String(task.assignee) !== String(req.user._id))
    return res.status(403).json({ error: 'This is not your task' });
  const text = String(req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Comment is empty' });
  const at = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  task.comments.push({ by: req.user.name, at, text });
  await task.save();
  if (task.assignee && String(task.assignee) !== String(req.user._id))
    await notify(task.assignee, `${req.user.name} commented on "${task.title}"`);
  res.json({ ok: true });
});

// delete task
router.delete('/:id', auth, needMgr, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;