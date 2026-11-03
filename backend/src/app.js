import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import openapi from '../../docs/openapi.json' with { type: 'json' };
import morgan from 'morgan';
import helmet from 'helmet';
import config from './config/constants.js';
import {
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
const isLocalhostOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const allowedOrigins = [
  config.frontendUrl,
  ...config.frontendUrls,
  'https://rento-x.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (config.isDevelopment && isLocalhostOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
import reviewRouter from './routes/review.routes.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/vehicles', vehicleLimiter, vehicleRouter);
app.use('/api/v1/rental-requests', requestLimiter, requestRouter);
app.use('/api/v1', reviewRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  const isCorsError = err.message === 'Not allowed by CORS';
  const statusCode = isCorsError ? 403 : err.statusCode || 500;
  const isOperational =
    isCorsError || err.isOperational === true || err.expose === true;
  const message =
    isOperational || config.isDevelopment
      ? err.message || 'Internal Server Error'
      : 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  } else if (config.isDevelopment) {
    console.warn(`[${req.method} ${req.originalUrl}] ${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    message,
  });
});

export default app;
