import rateLimit from 'express-rate-limit';

const limitCreator = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
  });
};

const globalLimiter = limitCreator(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again after 15 minutes',
);
const authLimiter = limitCreator(
  15 * 60 * 1000,
  50,
  'Too many attempts from this IP, please try again after 15 minutes',
);
const vehicleLimiter = limitCreator(
  15 * 60 * 1000,
  50,
  'Too many requests from this IP, please try again after 15 minutes',
);
const requestLimiter = limitCreator(
  15 * 60 * 1000,
  20,
  'Too many requests from this IP, please try again after 15 minutes',
);

export { globalLimiter, authLimiter, vehicleLimiter, requestLimiter };
