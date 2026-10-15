import { z } from 'zod';

const VEHICLE_TYPES = [
  'Car',
  'Bike',
  'SUV',
  'Van',
  'Truck',
  'Auto',
  'EV',
  'Scooter',
];

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
  type: z.enum(VEHICLE_TYPES),
  pricePerDay: z.number().int().min(1),
  location: z.string().min(1).max(100),
  // Empty is allowed (vehicle without a photo), but a provided value must be
  // an http(s) URL — blocks javascript:/data: style payloads.
  imageUrl: z
    .string()
    .url('Must be a valid URL')
    .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Must be an http(s) URL')
    .or(z.literal('')),
  description: z.string().max(500).optional(),
});

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date');

const rentalRequestSchema = z
  .object({
    vehicleId: z.string().uuid('Invalid vehicle id'),
    startDate: isoDate,
    endDate: isoDate,
    message: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'Start date must be before end date',
    path: ['endDate'],
  });

const editProfileSchema = z.object({
  mobileNumber: z
    .string()
    .regex(/^\+?\d{10,13}$/, 'Enter a valid phone number (10-13 digits)'),
  state: z.string().min(1).max(50),
  district: z.string().min(1).max(50),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const formatIssues = (error) =>
  error.issues.map((issue) => issue.message).join('; ');

export const validateRegister = (data) => {
  const result = registerSchema.safeParse(data);
  return result.success ? result : { ...result, error: { ...result.error, message: formatIssues(result.error) } };
};

export const validateLogin = (data) => {
  const result = loginSchema.safeParse(data);
  return result.success ? result : { ...result, error: { ...result.error, message: formatIssues(result.error) } };
};

export const validateVehicle = (data) => {
  const result = vehicleSchema.safeParse(data);
  return result.success ? result : { ...result, error: { ...result.error, message: formatIssues(result.error) } };
};

export const validateRentalRequest = (data) => {
  const result = rentalRequestSchema.safeParse(data);
  return result.success ? result : { ...result, error: { ...result.error, message: formatIssues(result.error) } };
};

export const validateEditProfile = (data) => {
  const result = editProfileSchema.safeParse(data);
  return result.success ? result : { ...result, error: { ...result.error, message: formatIssues(result.error) } };
};

export const validateOtp = (data) => {
  const result = otpSchema.safeParse(data);
  return result.success ? result : { ...result, error: { ...result.error, message: formatIssues(result.error) } };
};
