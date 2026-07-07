import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
dotenv.config();

const authMiddleware = asyncHandler((req, res, next) => {
  const token = req.headers?.authorization?.split(' ')?.[1];

  if (!token) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
});

export default authMiddleware;
