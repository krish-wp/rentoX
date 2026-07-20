import nodemailer from 'nodemailer';
import config from '../config/constants.js';

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: true,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

const sendEmail = async (to, subject, html) => {
  if (config.isProduction && (!config.smtpUser || !config.smtpPass)) {
    console.log(`[EMAIL SKIPPED] SMTP credentials missing`);
    return;
  }

  const mailOptions = {
    from: config.fromEmail,
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error(err);
  }
};

export default sendEmail;
