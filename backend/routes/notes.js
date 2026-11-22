const express = require('express');
const Note = require('../models/Note');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/read', auth, async (req, res) => {
  await Note.updateMany({ to: req.user._id }, { read: true });
  res.json({ ok: true });
});

router.delete('/', auth, async (req, res) => {
  await Note.deleteMany({ to: req.user._id });
  res.json({ ok: true });
});

module.exports = router;