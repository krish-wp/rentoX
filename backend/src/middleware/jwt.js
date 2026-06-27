import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import asyncHandler from '../utils/asyncHandler.js';
dotenv.config();

const authMiddleware = asyncHandler((req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded.userId;

  next();
});

export default authMiddleware;
