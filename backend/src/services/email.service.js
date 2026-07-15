import nodemailer from 'nodemailer';
import config from '../config/constants.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: config.googleUser,
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
    refreshToken: config.googleRefreshToken,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying email transporter:', error.message);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

const sendEmail = async (to, subject, html) => {
  if (config.isProduction && !config.googleUser) {
    console.log(`[EMAIL SKIPPED] To: ${to}, Subject: ${subject}`);
    return;
  }

  const mailOptions = {
    from: config.googleUser,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
