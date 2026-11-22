const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { auth, needMgr } = require('../middleware/auth');

const router = express.Router();
const STATUS = ['Active', 'On hold', 'Completed'];

// create project
router.post('/', auth, needMgr, async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Enter a project name.' });
  const status = STATUS.includes(req.body.status) ? req.body.status : 'Active';
  await Project.create({
    name,
    desc: req.body.desc || '',
    start: req.body.start || '',
    end: req.body.end || '',
    status,
  });
  res.json({ ok: true });
});

// edit project
router.put('/:id', auth, needMgr, async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Enter a project name.' });
  const status = STATUS.includes(req.body.status) ? req.body.status : 'Active';
  await Project.findByIdAndUpdate(req.params.id, {
    name,
    desc: req.body.desc || '',
    start: req.body.start || '',
    end: req.body.end || '',
    status,
  });
  res.json({ ok: true });
});

// change status only
router.patch('/:id/status', auth, needMgr, async (req, res) => {
  if (!STATUS.includes(req.body.status)) return res.status(400).json({ error: 'Bad status' });
  await Project.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ ok: true });
});

// delete project and its tasks
router.delete('/:id', auth, needMgr, async (req, res) => {
  await Task.deleteMany({ project: req.params.id });
  await Project.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;