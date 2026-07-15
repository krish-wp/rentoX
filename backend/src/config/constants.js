const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const config = {
  isProduction,
  isDevelopment,

  port: parseInt(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  cookieMaxAgeDays: parseInt(process.env.COOKIE_MAX_AGE_DAYS) || 7,

  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  googleUser: process.env.GOOGLE_USER,
};

export default config;
