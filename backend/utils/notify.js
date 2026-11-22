const Note = require('../models/Note');
const User = require('../models/User');
const { sendMail, mailHtml } = require('./mailer');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// saves the bell notification AND emails the user (if an email is set)
module.exports = async function notify(to, text) {
  if (!to) return;
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  await Note.create({ to, text, time });

  // email runs in background, never slows or breaks the request
  User.findById(to)
    .then((u) => {
      if (!u || !u.email) return;
      const html = mailHtml({
        title: 'Task Allocation',
        lines: ['Hi ' + esc(u.name) + ',', '<b>' + esc(text) + '</b>', '<span style="color:#5d6b70">' + esc(time) + '</span>'],
      });
      return sendMail(u.email, 'Task Allocation: ' + text, html);
    })
    .catch((e) => console.log('[mail] error:', e.message));
};