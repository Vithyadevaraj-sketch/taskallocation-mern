require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Note = require('./models/Note');
const { auth } = require('./middleware/auth');
const seed = require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(require('path').join(__dirname, '../frontend/dist')));
app.get('/api', (req, res) => res.json({ message: 'Task Allocation API is running' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notes', require('./routes/notes'));

// everything the screen needs in one call
app.get('/api/state', auth, async (req, res) => {
  const me = req.user;
  const mgr = me.role !== 'Employee';

  const openCounts = await Task.aggregate([
    { $match: { status: { $ne: 'Done' }, assignee: { $ne: null } } },
    { $group: { _id: '$assignee', n: { $sum: 1 } } },
  ]);
  const open = {};
  openCounts.forEach((o) => (open[String(o._id)] = o.n));

  const users = (await User.find().sort({ _id: 1 })).map((u) => ({
    id: String(u._id), name: u.name, role: u.role, skills: u.skills, leave: u.onLeave, open: open[String(u._id)] || 0,
  }));
  const projects = (await Project.find().sort({ _id: 1 })).map((p) => ({
    id: String(p._id), name: p.name, desc: p.desc, start: p.start, end: p.end, status: p.status,
  }));
  const taskRows = mgr ? await Task.find().sort({ _id: 1 }) : await Task.find({ assignee: me._id }).sort({ _id: 1 });
  const tasks = taskRows.map((t) => ({
    id: String(t._id), pid: String(t.project), title: t.title, desc: t.desc, pri: t.pri, due: t.due, status: t.status,
    assignee: t.assignee ? String(t.assignee) : null, skills: t.skills, reason: t.allocReason || '',
    comments: t.comments.map((c) => ({ by: c.by, at: c.at, text: c.text })),
  }));
  const notes = (await Note.find({ to: me._id }).sort({ _id: -1 })).map((n) => ({
    id: String(n._id), to: String(n.to), text: n.text, time: n.time, read: n.read,
  }));

  res.json({ me: { id: String(me._id), name: me.name, role: me.role }, users, projects, tasks, notes });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seed();
    app.listen(process.env.PORT, () => console.log('Server running on http://localhost:' + process.env.PORT));
  })
  .catch((err) => console.log('MongoDB error:', err.message));
