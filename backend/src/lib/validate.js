import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3).max(10),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const vehicleSchema = z.object({
  plateNumber: z.string().min(1).max(20),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  type: z.string().min(1).max(50),
  pricePerDay: z.number().min(1),
  location: z.string().min(1).max(100),
  imageUrl: z.string().url().optional(),
  description: z.string().max(500).optional(),
});

export const validateRegister = (data) => {
  return registerSchema.safeParse(data);
};

export const validateLogin = (data) => {
  return loginSchema.safeParse(data);
};

export const validateVehicle = (data) => {
  return vehicleSchema.safeParse(data);
};
