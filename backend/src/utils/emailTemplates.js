import config from '../config/constants.js';

const layout = (title, lines) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;padding:24px">
    <h2 style="margin:0 0 12px;color:#111827">${title}</h2>
    ${lines.map((l) => `<p style="margin:0 0 8px;color:#374151">${l}</p>`).join('')}
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px">— RentoX</p>
  </div>`;

const otpEmail = (otp) => `
  <div style="font-family: Arial, sans-serif; text-align: center;">
    <h1 style="color: #333;">Your OTP Code</h1>
    <p style="font-size: 18px; color: #555;">Please use the following OTP to verify your account:</p>
    <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 20px 0;">${otp}</div>
    <p style="font-size: 16px; color: #777;">This OTP is valid for 10 minutes.</p>
    <p style="font-size: 14px; color: #999;">If you did not request this OTP, please ignore this email.</p>
  </div>`;

const alreadyRegisteredEmail = (userName) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #333;">You already have an account</h2>
    <p style="color: #555; font-size: 15px;">
      Hi ${userName}, someone tried to register with this email on RentoX.
      You already have an account — just log in instead.
    </p>
    <a href="${config.frontendUrl}/auth/login"
       style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #007BFF; color: #fff; text-decoration: none; border-radius: 6px;">
      Log In
    </a>
    <p style="color: #999; font-size: 12px; margin-top: 24px;">
      If you didn't try to register, you can safely ignore this email.
    </p>
  </div>`;

const newRequestEmail = (ownerName, vehicleLabel, startDate, endDate) =>
  layout('New Rental Request', [
    `Hi ${ownerName},`,
    `You have a new rental request for <strong>${vehicleLabel}</strong> from ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}.`,
    `Log in to view and respond to the request.`,
  ]);

const statusChangeEmail = (userName, status, vehicleLabel, startDate, endDate) =>
  layout(`Request ${status.toLowerCase()}`, [
    `Hi ${userName},`,
    `Your request for <strong>${vehicleLabel}</strong> (${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}) was <strong>${status.toLowerCase()}</strong>.`,
    status === 'ACCEPTED'
      ? 'The owner will coordinate pickup details with you.'
      : 'You can browse other available vehicles and send a new request.',
  ]);

const cancelEmail = (ownerName, senderName, vehicleLabel, startDate, endDate) =>
  layout('Request cancelled', [
    `Hi ${ownerName},`,
    `${senderName} cancelled their request for <strong>${vehicleLabel}</strong> (${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}).`,
  ]);

export {
  otpEmail,
  alreadyRegisteredEmail,
  newRequestEmail,
  statusChangeEmail,
  cancelEmail,
};
