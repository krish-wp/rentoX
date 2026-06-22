import express from 'express';
import prisma from './lib/prisma.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  const user = prisma.user.findMany();

  res.json({
    message: 'Rentox is running',
    user,
  });
});

export default app;
