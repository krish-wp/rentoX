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
  !config.smtpPass ||
  !config.fromEmail
)) {
  console.error('Missing Brevo API environment variables (SMTP_PASS, FROM_EMAIL) required in production.');
  process.exit(1);
}

// CORS origin + password-reset links depend on this, so fail fast instead of
// silently falling back to localhost in production.
if (config.isProduction) {
  let frontendUrl;
  try {
    frontendUrl = new URL(config.frontendUrl);
  } catch {
    console.error('FRONTEND_URL must be an absolute URL (e.g. https://rentox.example.com).');
    process.exit(1);
  }
  if (!['http:', 'https:'].includes(frontendUrl.protocol)) {
    console.error('FRONTEND_URL must use http or https.');
    process.exit(1);
  }
}

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

app.listen(config.port, () => {
  console.log(`server is running on port ${config.port}`);
});
