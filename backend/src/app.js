import express from 'express';
import prisma from './lib/prisma.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import openapi from '../../docs/openapi.json' with { type: 'json' };
import morgan from 'morgan';
import helmet from 'helmet';
import config from './config/constants.js';
import {
  authLimiter,
  globalLimiter,
  vehicleLimiter,
  requestLimiter,
} from './middleware/ratelimit.js';

const app = express();

if (config.isProduction) {
  app.set('trust proxy', 1);
}

app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: config.isProduction ? config.frontendUrl : true,
  credentials: true,
}));
app.use(cookieParser());
if (config.isDevelopment) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
}
app.use(helmet());
app.use(globalLimiter);

import authRouter from './routes/auth.routes.js';
import vehicleRouter from './routes/vehicle.routes.js';
import requestRouter from './routes/request.routes.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/vehicles', vehicleLimiter, vehicleRouter);
app.use('/api/v1/rental-requests', requestLimiter, requestRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true || err.expose === true;
  const message =
    isOperational || config.isDevelopment
      ? err.message || 'Internal Server Error'
      : 'Internal Server Error';
  res.status(statusCode).json({
    message,
  });
});

export default app;
