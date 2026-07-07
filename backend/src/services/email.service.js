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
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying email transporter:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: config.googleUser,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
