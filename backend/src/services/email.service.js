import nodemailer from 'nodemailer';
import config from '../config/constants.js';

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendEmail = async (to, subject, html) => {
  if (!config.smtpUser || !config.smtpPass) {
    throw new Error('SMTP credentials are missing.');
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
    console.error('SMTP Error:', err);
    throw err;
  }
};

export default sendEmail;
