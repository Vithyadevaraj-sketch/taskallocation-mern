const nodemailer = require('nodemailer');

let transporterPromise;
let usingTestAccount = false;

// Real SMTP if SMTP_HOST is set in .env, otherwise a free fake inbox (Ethereal)
function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
      }
      const acc = await nodemailer.createTestAccount();
      usingTestAccount = true;
      console.log('Test mail account ready (Ethereal):', acc.user);
      return nodemailer.createTransport({
        host: acc.smtp.host,
        port: acc.smtp.port,
        secure: acc.smtp.secure,
        auth: { user: acc.user, pass: acc.pass },
      });
    })();
  }
  return transporterPromise;
}

// nice looking HTML email
function mailHtml({ title, lines = [], footer = 'Task Allocation System' }) {
  const items = lines.map((l) => `<p style="margin:6px 0;color:#1b2a2f">${l}</p>`).join('');
  return `
  <div style="font-family:Arial,sans-serif;background:#edefea;padding:24px">
    <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #d5dad4">
      <div style="background:#2f6f5e;color:#fff;padding:16px 20px;font-size:18px;font-weight:bold">${title}</div>
      <div style="padding:18px 20px">${items}</div>
      <div style="padding:12px 20px;font-size:12px;color:#5d6b70;border-top:1px solid #d5dad4">${footer}</div>
    </div>
  </div>`;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// sends mail, retries up to 3 times, logs the result. Never throws.
async function sendMail(to, subject, html) {
  if (!to) return false;
  const sender = process.env.SMTP_USER || 'no-reply@taskallocation.local';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail({
        from: '"Task Allocation" <' + sender + '>',
        to,
        subject,
        html,
      });
      console.log('[mail] sent to', to, '-', subject);
      if (usingTestAccount) console.log('[mail] preview:', nodemailer.getTestMessageUrl(info));
      return true;
    } catch (err) {
      console.log('[mail] attempt ' + attempt + ' failed:', err.message);
      if (attempt < 3) await wait(2000 * attempt);
    }
  }
  console.log('[mail] giving up on', to);
  return false;
}

module.exports = { sendMail, mailHtml };