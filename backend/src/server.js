import express from 'express';
import app from './app.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const GOOGLE_USER = process.env.GOOGLE_USER;

if (
  !DATABASE_URL ||
  !JWT_SECRET ||
  !GOOGLE_CLIENT_ID ||
  !GOOGLE_CLIENT_SECRET ||
  !GOOGLE_REFRESH_TOKEN ||
  !GOOGLE_USER
) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
