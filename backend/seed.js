const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const day = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

module.exports = async function seed() {
  if (await User.countDocuments()) return; // only when database is empty

  const mk = async (name, login, pw, role, skills, onLeave = false) =>
    User.create({ name, login, pwHash: await bcrypt.hash(pw, 10), role, skills, onLeave });

  await mk('Admin', 'admin', 'admin123', 'Admin', []);
  await mk('Meena', 'manager', 'manager123', 'Manager', []);
  const karthik = await mk('Karthik', 'karthik', '1234', 'Employee', ['react', 'node']);
  const priya = await mk('Priya', 'priya', '1234', 'Employee', ['java', 'sql']);
  const arun = await mk('Arun', 'arun', '1234', 'Employee', ['python', 'ml']);
  await mk('Divya', 'divya', '1234', 'Employee', ['ui', 'react'], true);

  const erp = await Project.create({ name: 'College ERP', desc: 'Student and fee management portal', start: day(-10), end: day(30) });
  const att = await Project.create({ name: 'Attendance App', desc: 'Face-based attendance with reports', start: day(-3), end: day(45) });

  await Task.create([
    { project: erp._id, title: 'Design login page', desc: 'Responsive login and signup', pri: 'High', due: day(2), status: 'In Progress', assignee: karthik._id, skills: ['ui', 'react'] },
    { project: erp._id, title: 'Fee table schema', desc: 'Tables and indexes for fee module', pri: 'Medium', due: day(-1), status: 'To Do', assignee: priya._id, skills: ['sql'] },
    { project: att._id, title: 'Face match model', desc: 'Train and evaluate model', pri: 'High', due: day(10), status: 'To Do', assignee: arun._id, skills: ['python', 'ml'] },
    { project: erp._id, title: 'REST API for students', desc: 'CRUD endpoints', pri: 'Low', due: day(-4), status: 'Done', assignee: karthik._id, skills: ['node'] },
  ]);

  console.log('Demo data added');
};