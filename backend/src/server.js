import express from 'express';
import app from './app.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/constants.js';

dotenv.config();

if (
  !config.databaseUrl ||
  !config.jwtSecret ||
  !config.jwtRefreshSecret ||
  !config.googleClientId ||
  !config.googleClientSecret ||
  !config.googleRefreshToken ||
  !config.googleUser
) {
  console.error('Missing required environment variables.');
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
