import express from 'express';
import app from './app.js';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/constants.js';

if (
  !config.databaseUrl ||
  !config.jwtSecret ||
  !config.jwtRefreshSecret
) {
  console.error('Missing required environment variables (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET).');
  process.exit(1);
}

if (config.isProduction && (
  !config.googleClientId ||
  !config.googleClientSecret ||
  !config.googleRefreshToken ||
  !config.googleUser
)) {
  console.error('Missing Google OAuth environment variables (required in production).');
  process.exit(1);
}

if (config.isProduction && (
  !config.smtpPass ||
  !config.fromEmail
)) {
  console.error('Missing Brevo API environment variables (SMTP_PASS, FROM_EMAIL) required in production.');
  process.exit(1);
}

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

app.listen(config.port, () => {
  console.log(`server is running on port ${config.port}`);
});
