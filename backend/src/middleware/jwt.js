import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import config from '../config/constants.js';

const authMiddleware = asyncHandler((req, res, next) => {
  const token = req.headers?.authorization?.split(' ')?.[1];

  if (!token) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.userId;
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
});

export default authMiddleware;
