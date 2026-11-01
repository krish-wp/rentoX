import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { validateReview } from '../lib/validate.js';

export const createReview = asyncHandler(async (req, res, next) => {
  const validation = validateReview(req.body);
  if (!validation.success) {
    return next(new AppError(validation.error.message, 400));
  }

  const { rentalRequestId } = req.params;
  const { rating, comment } = validation.data;
  const reviewerId = req.user;

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: {
      vehicle: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!rentalRequest) {
    return next(new AppError('Rental request not found', 404));
  }

  if (rentalRequest.status !== 'ACCEPTED') {
    return next(new AppError('Can only review accepted rental requests', 400));
  }

  if (
    rentalRequest.senderId !== reviewerId &&
    rentalRequest.vehicle.ownerId !== reviewerId
  ) {
    return next(new AppError('You are not a participant in this rental request', 403));
  }

  const existingReview = await prisma.review.findUnique({
    where: { rentalRequestId },
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this rental request', 400));
  }

  const revieweeId =
    rentalRequest.senderId === reviewerId
      ? rentalRequest.vehicle.ownerId
      : rentalRequest.senderId;

  const review = await prisma.review.create({
    data: {
      rentalRequestId,
      reviewerId,
      revieweeId,
      rating,
      comment,
    },
  });

  res.status(201).json(review);
});

export const getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    include: {
      reviewer: {
        select: {
          id: true,
          userName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const averageRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  res.status(200).json({
    averageRating,
    reviewCount: reviews.length,
    reviews,
  });
});

export const getVehicleReviews = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  const reviews = await prisma.review.findMany({
    where: {
      rentalRequest: {
        vehicleId,
        status: 'ACCEPTED',
      },
    },
    include: {
      reviewer: {
        select: {
          id: true,
          userName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json(reviews);
});
