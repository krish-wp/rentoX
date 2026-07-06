import asyncHandler from '../utils/asyncHandler.js';
import prisma from '../lib/prisma.js';
import { validateVehicle } from '../lib/validate.js';

const getAllVehicles = asyncHandler(async (req, res) => {
  const { page, limit, type, location, minPrice, maxPrice } = req.query;

  // Pagination
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);
  const skip = (pageNumber - 1) * limitNumber;

  // Filters
  const where = {
    isAvailable: true,

    // Exclude logged-in user's vehicles
    ownerId: {
      not: req.user, // Change to req.user if you store only the id
    },

    ...(type && { type }),

    ...(location && {
      location: {
        contains: location,
        mode: 'insensitive',
      },
    }),

    ...(minPrice || maxPrice
      ? {
          pricePerDay: {
            ...(minPrice && { gte: Number(minPrice) }),
            ...(maxPrice && { lte: Number(maxPrice) }),
          },
        }
      : {}),
  };

  // Fetch vehicles and total count
  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: 'desc',
      },
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
    }),

    prisma.vehicle.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Vehicles fetched successfully',
    vehicles,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

const getVehicleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingVehicle = await prisma.vehicle.findUnique({
    where: { id: id },
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

  if (!existingVehicle) {
    return res.status(404).json({
      error: 'Vehicle not found',
      message: `Vehicle with ID ${id} does not exist`,
    });
  }

  res.status(200).json({
    vehicle: existingVehicle,
  });
});

const createVehicle = asyncHandler(async (req, res) => {
  const {
    plateNumber,
    brand,
    model,
    type,
    pricePerDay,
    location,
    description,
    imageUrl,
  } = req.body;

  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required to create a vehicle',
    });
  }

  // Validate vehicle data using validate.js
  const validation = validateVehicle({
    ownerId: req.user,
    plateNumber,
    brand,
    model,
    type,
    pricePerDay: parseInt(pricePerDay),
    location,
  });

  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid vehicle data',
      details: validation.error.errors.map((err) => err.message),
    });
  }

  // Create new vehicle with authenticated user's ID
  const vehicle = await prisma.vehicle.create({
    data: {
      ownerId: req.user,
      plateNumber,
      brand,
      model,
      type,
      pricePerDay: parseInt(pricePerDay),
      location,
      description: description || '',
      imageUrl: imageUrl || '',
      isAvailable: true,
    },
  });

  res.status(201).json(vehicle);
});

const updateVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validation = await validateVehicle({
    ...req.body,
  });

  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid vehicle data',
      details: validation.error.errors.map((err) => err.message),
    });
  }
  const {
    plateNumber,
    brand,
    model,
    type,
    pricePerDay,
    location,
    description,
    imageUrl,
  } = req.body;

  // Find the vehicle first to check ownership
  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingVehicle) {
    return res.status(404).json({
      error: 'Vehicle not found',
    });
  }

  // Check if the user is the owner of the vehicle
  if (existingVehicle.ownerId !== req.user) {
    return res.status(403).json({
      error: 'You are not authorized to update this vehicle',
    });
  }

  const vehicle = await prisma.vehicle.update({
    where: {
      id: id,
    },
    data: {
      plateNumber,
      brand,
      model,
      type,
      pricePerDay: parseInt(pricePerDay),
      location,
      description: description || '',
      imageUrl: imageUrl || '',
    },
  });

  res.status(200).json(vehicle);
});

//write a function to delete a vehicle by id and check if the user is the owner of the vehicle before deleting it
const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the vehicle by id
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: id,
    },
  });

  // If vehicle not found
  if (!vehicle) {
    return res.status(404).json({
      error: 'Vehicle not found',
    });
  }

  // Check if the user is the owner of the vehicle
  if (vehicle.ownerId !== req.user) {
    return res.status(403).json({
      error: 'You are not authorized to delete this vehicle',
    });
  }

  // Delete the vehicle
  const deletedVehicle = await prisma.vehicle.delete({
    where: {
      id: id,
    },
  });

  res.status(200).json({
    message: 'Vehicle deleted successfully',
    vehicle: deletedVehicle,
  });
});

export {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
