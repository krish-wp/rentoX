import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Send a rental request
export const sendRequest = asyncHandler(async (req, res, next) => {
  const { vehicleId, startDate, endDate, message } = req.body;

  // Validate required fields
  if (!vehicleId) {
    return next(new AppError('Vehicle ID is required', 400));
  }

  //add validation for startDate and endDate
  if (!startDate || !endDate) {
    return next(new AppError('Start date and end date are required', 400));
  }

  //pls validate that startDate is before endDate
  if (new Date(startDate) >= new Date(endDate)) {
    return next(new AppError('Start date must be before end date', 400));
  }

  const senderId = req.user;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (vehicle.ownerId === senderId) {
    return next(new AppError('You cannot request your own vehicle', 400));
  }

  const request = await prisma.rentalRequest.create({
    data: {
      senderId,
      vehicleId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      message,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Rental request sent successfully',
    data: request,
  });
});

// Get all requests for a specific vehicle (owner view)
export const getAllRequestsForVehicle = asyncHandler(async (req, res, next) => {
  const { vehicleId } = req.params;
  const userId = req.user;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (vehicle.ownerId !== userId) {
    return next(new AppError('You are not the owner of this vehicle', 403));
  }

  const requests = await prisma.rentalRequest.findMany({
    where: { vehicleId },
    include: {
      sender: {
        select: {
          id: true,
          userName: true,
          email: true,
          mobileNumber: true,
        },
      },
      vehicle: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// Get all requests received by the logged-in user (as owner)
export const getReceivedRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user;

  const requests = await prisma.rentalRequest.findMany({
    where: {
      vehicle: {
        ownerId: userId,
      },
    },
    include: {
      sender: {
        select: {
          id: true,
          userName: true,
          email: true,
          mobileNumber: true,
        },
      },
      vehicle: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// Get all requests sent by the logged-in user
export const getSentRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user;

  const requests = await prisma.rentalRequest.findMany({
    where: {
      senderId: userId,
    },
    include: {
      vehicle: {
        include: {
          owner: {
            select: {
              id: true,
              userName: true,
              email: true,
              mobileNumber: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// Update request status by owner (accept/reject)
export const updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { status } = req.body;
  const userId = req.user;

  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    return next(new AppError('Invalid status. Use ACCEPTED or REJECTED', 400));
  }

  const request = await prisma.rentalRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      vehicle: true,
    },
  });

  if (!request) {
    return next(new AppError('Request not found', 404));
  }

  if (request.vehicle.ownerId !== userId) {
    return next(new AppError('You are not the owner of this vehicle', 403));
  }

  const updatedRequest = await prisma.rentalRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status,
    },
  });

  res.status(200).json({
    success: true,
    message: `Request ${status.toLowerCase()} successfully`,
    data: updatedRequest,
  });
});

// Delete a rental request
export const deleteRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { sender: true },
  });
  if (!request) {
    return next(
      new AppError(`Request with ID ${requestId} does not exist`, 404),
    );
  }
  if (request.senderId !== req.user) {
    return next(
      new AppError(`You are not authorized to delete this request`, 403),
    );
  }
  await prisma.rentalRequest.delete({ where: { id: requestId } });
  res.status(200).json({
    success: true,
    message: `Request with ID ${requestId} deleted successfully`,
  });
});
