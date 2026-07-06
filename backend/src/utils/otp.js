const otpGenerator = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

const generateOTPhtml = (otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h1 style="color: #333;">Your OTP Code</h1>
      <p style="font-size: 18px; color: #555;">Please use the following OTP to verify your account:</p> 

        <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 20px 0;">${otp}</div>

        <p style="font-size: 16px; color: #777;">This OTP is valid for 10 minutes.</p>

        <p style="font-size: 14px; color: #999;">If you did not request this OTP, please ignore this email.</p>
    </div>
    `;
  return { html };
};

export { otpGenerator, generateOTPhtml };
