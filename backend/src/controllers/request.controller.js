import prisma from '../lib/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import sendEmail from '../services/email.service.js';
import { validateRentalRequest } from '../lib/validate.js';

const rentalStatusEmail = (title, lines) => `
  <div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;padding:24px">
    <h2 style="margin:0 0 12px;color:#111827">${title}</h2>
    ${lines.map((l) => `<p style="margin:0 0 8px;color:#374151">${l}</p>`).join('')}
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px">— RentoX</p>
  </div>`;

const notifyStatusChange = async (request, status) => {
  try {
    const vehicleLabel = `${request.vehicle.brand} ${request.vehicle.model}`;
    await sendEmail(
      request.sender.email,
      `Your rental request was ${status.toLowerCase()}`,
      rentalStatusEmail(`Request ${status.toLowerCase()}`, [
        `Hi ${request.sender.userName},`,
        `Your request for <strong>${vehicleLabel}</strong> (${request.vehicle.location}) from ${new Date(request.startDate).toDateString()} to ${new Date(request.endDate).toDateString()} was <strong>${status.toLowerCase()}</strong>.`,
        status === 'ACCEPTED'
          ? 'The owner will coordinate pickup details with you.'
          : 'You can browse other available vehicles and send a new request.',
      ]),
    );
  } catch (err) {
    console.error('Failed to send status email:', err.message);
  }
};

// Send a rental request
export const sendRequest = asyncHandler(async (req, res, next) => {
  const validation = validateRentalRequest(req.body);
  if (!validation.success) {
    return next(new AppError(validation.error.message, 400));
  }

  const { vehicleId, startDate, endDate, message } = validation.data;

  const userStart = new Date(startDate);
  const userEnd = new Date(endDate);

  const senderId = req.user;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
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
  });

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (vehicle.ownerId === senderId) {
    return next(new AppError('You cannot request your own vehicle', 400));
  }

  const conflict = await prisma.rentalRequest.findFirst({
    where: {
      vehicleId,
      status: 'ACCEPTED',
      startDate: {
        lte: userEnd,
      },
      endDate: {
        gte: userStart,
      },
    },
  });

  console.log('conflicting', conflict);

  if (conflict != null) {
    const start = conflict.startDate.toISOString().split('T')[0];
    const end = conflict.endDate.toISOString().split('T')[0];

    throw new AppError(
      `The vehicle is already booked from ${start} to ${end}.`,
      400,
    );
  }

  const request = await prisma.rentalRequest.create({
    data: {
      senderId,
      vehicleId,
      startDate: userStart,
      endDate: userEnd,
      message,
    },
  });

  try {
    await sendEmail(
      vehicle.owner.email,
      'New Rental Request',
      `You have received a new rental request for your vehicle ${vehicle.brand} ${vehicle.model}. Please log in to your account to view and respond to the request.`,
    );
  } catch (emailError) {
    console.error('Failed to send rental request email:', emailError.message);
  }

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
      sender: { select: { id: true, userName: true, email: true } },
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

  await notifyStatusChange({ ...updatedRequest, sender: request.sender, vehicle: request.vehicle }, status);

  res.status(200).json({
    success: true,
    message: `Request ${status.toLowerCase()} successfully`,
    data: updatedRequest,
  });
});

// Get a single request — only the sender or the vehicle's owner may view it
export const getRequestById = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const userId = req.user;

  const request = await prisma.rentalRequest.findFirst({
    where: {
      id: requestId,
      OR: [{ senderId: userId }, { vehicle: { ownerId: userId } }],
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
  });

  if (!request) {
    return next(new AppError('Request not found', 404));
  }

  res.status(200).json({
    success: true,
    data: request,
  });
});

// Cancel a request — sender only, and only while it is still active
export const cancelRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const userId = req.user;

  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: {
      sender: { select: { id: true, userName: true, email: true } },
      vehicle: { include: { owner: { select: { id: true, userName: true, email: true } } } },
    },
  });

  if (!request) {
    return next(new AppError('Request not found', 404));
  }

  if (request.senderId !== userId) {
    return next(new AppError('Only the sender can cancel this request', 403));
  }

  if (!['PENDING', 'ACCEPTED'].includes(request.status)) {
    return next(new AppError(`A ${request.status.toLowerCase()} request cannot be cancelled`, 400));
  }

  const updatedRequest = await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELLED' },
  });

  try {
    const vehicleLabel = `${request.vehicle.brand} ${request.vehicle.model}`;
    await sendEmail(
      request.vehicle.owner.email,
      'A rental request was cancelled',
      rentalStatusEmail('Request cancelled', [
        `Hi ${request.vehicle.owner.userName},`,
        `${request.sender.userName} cancelled their request for <strong>${vehicleLabel}</strong> (${new Date(request.startDate).toDateString()} to ${new Date(request.endDate).toDateString()}).`,
      ]),
    );
  } catch (err) {
    console.error('Failed to send cancel email:', err.message);
  }

  res.status(200).json({
    success: true,
    message: 'Request cancelled successfully',
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
