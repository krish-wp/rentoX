import crypto from 'crypto';

const otpGenerator = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export { otpGenerator };
