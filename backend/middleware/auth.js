const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Not logged in' });
  }
}

function needMgr(req, res, next) {
  if (req.user.role === 'Employee') return res.status(403).json({ error: 'Manager or Admin only' });
  next();
}

function needAdmin(req, res, next) {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

module.exports = { auth, needMgr, needAdmin };