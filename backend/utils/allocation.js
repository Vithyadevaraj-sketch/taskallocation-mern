const User = require('../models/User');
const Task = require('../models/Task');

// returns { id, reason } for the best employee, or null if nobody is available
module.exports = async function autoPick(skills) {
  const employees = await User.find({ role: 'Employee', onLeave: false });
  let best = null;
  let bestScore = -Infinity;
  for (const u of employees) {
    const open = await Task.countDocuments({ assignee: u._id, status: { $ne: 'Done' } });
    const matched = skills.filter((s) => u.skills.includes(s));
    const score = matched.length * 3 - open;
    if (score > bestScore) {
      bestScore = score;
      const skillText = matched.length
        ? matched.length + ' of ' + skills.length + ' skills match (' + matched.join(', ') + ')'
        : 'no skill match, least busy';
      best = {
        id: u._id,
        reason: u.name + ': ' + skillText + ', ' + open + ' open task' + (open === 1 ? '' : 's') + ', score ' + score,
      };
    }
  }
  return best;
};