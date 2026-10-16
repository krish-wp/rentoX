import sendEmail from '../services/email.service.js';

const trySendEmail = async (to, subject, html, label) => {
  try {
    await sendEmail(to, subject, html);
  } catch (err) {
    console.error(`Failed to send ${label} email:`, err.message);
  }
};

export default trySendEmail;
