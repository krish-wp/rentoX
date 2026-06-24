import express from 'express';
import prisma from './lib/prisma.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cors());

app.use(cookieParser());

app.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findMany();

    res.json({
      message: 'Rentox is running',
      user,
    });
  } catch (error) {
    console.log(error);
  }
});

import authRouter from './routes/auth.routes.js';

app.use('/api/v1/auth', authRouter);

export default app;
