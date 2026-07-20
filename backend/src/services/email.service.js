import config from '../config/constants.js';

const sendEmail = async (mail, subject, html) => {
  if (!config.smtpPass) {
    throw new Error('Brevo API key is missing.');
  }

  const payload = {
    sender: {
      email: config.fromEmail,
    },
    to: [
      {
        email: mail,
      },
    ],
    subject,
    htmlContent: html,
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.smtpPass,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  console.log('Email sent:', data);

  return data;
};

export default sendEmail;
