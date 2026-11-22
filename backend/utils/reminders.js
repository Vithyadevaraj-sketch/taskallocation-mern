const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const notify = require('./notify');

// today's date in India as YYYY-MM-DD
const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const addDays = (dateStr, n) => {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// due today / tomorrow -> employee. overdue -> managers and admins.
async function runReminders() {
  const today = todayIST();
  const tomorrow = addDays(today, 1);

  const dueSoon = await Task.find({
    status: { $ne: 'Done' },
    assignee: { $ne: null },
    due: { $in: [today, tomorrow] },
  });
  for (const t of dueSoon) {
    const when = t.due === today ? 'today' : 'tomorrow';
    await notify(t.assignee, `Reminder: "${t.title}" is due ${when}`);
  }

  const overdue = await Task.find({
    status: { $ne: 'Done' },
    due: { $lt: today, $ne: '' },
  });
  if (overdue.length) {
    const names = overdue.slice(0, 5).map((t) => '"' + t.title + '"').join(', ');
    const more = overdue.length > 5 ? ' and ' + (overdue.length - 5) + ' more' : '';
    const managers = await User.find({ role: { $ne: 'Employee' } });
    for (const m of managers) {
      await notify(m._id, `${overdue.length} overdue task(s): ${names}${more}`);
    }
  }

  console.log('[reminders] due soon:', dueSoon.length, ', overdue:', overdue.length);
  return { dueSoon: dueSoon.length, overdue: overdue.length };
}

// every day at 9:00 AM India time
function startReminders() {
  cron.schedule('0 9 * * *', () => runReminders().catch((e) => console.log('[reminders] error:', e.message)), {
    timezone: 'Asia/Kolkata',
  });
  console.log('[reminders] daily 9:00 AM job scheduled');
}

module.exports = { startReminders, runReminders };