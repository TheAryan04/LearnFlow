import nodemailer from 'nodemailer';
import { db } from './core.js';

let transport;

function getTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export async function sendNotificationEmail(userId, notification) {
  const mailer = getTransport();
  if (!mailer || !userId) return false;
  const user = await db.collection('users').findOne({ id: userId }, { projection: { email: 1, name: 1 } });
  if (!user?.email) return false;
  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: notification.title || 'LearnFlow notification',
    text: `Hello ${user.name || 'Learner'},\n\n${notification.message || 'You have a new LearnFlow notification.'}\n\nSign in to LearnFlow to view details.`,
  });
  return true;
}
