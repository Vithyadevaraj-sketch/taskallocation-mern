const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth, needMgr, needAdmin } = require('../middleware/auth');

const router = express.Router();

const skl = (v) => [...new Set(String(v || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))];
const validEmail = (e) => e === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// add user (admin)
router.post('/', auth, needAdmin, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const login = String(req.body.login || '').trim().toLowerCase();
  const pw = String(req.body.pw || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!name || !login || !pw) return res.status(400).json({ error: 'Name, username and password are required.' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (await User.findOne({ login })) return res.status(400).json({ error: 'That username is taken.' });
  const role = ['Admin', 'Manager', 'Employee'].includes(req.body.role) ? req.body.role : 'Employee';
  await User.create({ name, login, email, pwHash: await bcrypt.hash(pw, 10), role, skills: skl(req.body.skills) });
  res.json({ ok: true });
});

// toggle leave
router.post('/:id/leave', auth, needMgr, async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role: 'Employee' });
  if (u) {
    u.onLeave = !u.onLeave;
    await u.save();
  }
  res.json({ ok: true });
});

// set email of a user (manager / admin)
router.patch('/:id/email', auth, needMgr, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  await User.findByIdAndUpdate(req.params.id, { email });
  res.json({ ok: true });
});

// change skills of an employee (manager / admin)
router.patch('/:id/skills', auth, needMgr, async (req, res) => {
  await User.findOneAndUpdate({ _id: req.params.id, role: 'Employee' }, { skills: skl(req.body.skills) });
  res.json({ ok: true });
});

module.exports = router;