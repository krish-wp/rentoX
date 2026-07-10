import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

const requireCompleteProfile = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user },
    select: { isProfileCompleted: true },
  });

  if (!user || !user.isProfileCompleted) {
    throw new AppError('Please complete your profile first', 403);
  }

  next();
});

export default requireCompleteProfile;
