import express from 'express';
import prisma from './lib/prisma.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import openapi from '../../docs/openapi.json' with { type: 'json' };
import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

import authRouter from './routes/auth.routes.js';
import vehicleRouter from './routes/vehicle.routes.js';
import requestRouter from './routes/request.routes.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/vehicles', vehicleRouter);
app.use('/api/v1/rental-requests', requestRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app;
