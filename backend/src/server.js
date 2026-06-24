import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!DATABASE_URL || !JWT_SECRET) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
