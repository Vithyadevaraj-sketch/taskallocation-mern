const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
  const login = String(req.body.login || '').trim().toLowerCase();
  const pw = String(req.body.pw || '').trim();
  const user = await User.findOne({ login });
  if (!user || !(await bcrypt.compare(pw, user.pwHash))) {
    return res.status(401).json({ error: 'Username or password is wrong. Check the demo logins below.' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;