import { z } from "zod";
import { DISTRICTS_BY_STATE } from "@/lib/constants";
export const SELECT_CLASS = "flex h-9 w-full rounded-lg border border-border/80 bg-transparent px-2.5 py-1 text-sm tracking-[-0.01em] text-foreground transition-[color,box-shadow,border-color] duration-150 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-40";

export const TEXTAREA_CLASS = "flex w-full rounded-lg border border-border/80 bg-transparent px-2.5 py-1 text-sm tracking-[-0.01em] text-foreground transition-[color,box-shadow,border-color] duration-150 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-40";

export function formatPlateNumber(value: string): string {
  const stripped = value.replace(/\s/g, "").toUpperCase();
  const parts = [stripped.slice(0, 2), stripped.slice(2, 4), stripped.slice(4, 6), stripped.slice(6, 10)];
  return parts.filter(Boolean).join(" ");
}

export function handlePlateInput(e: React.FormEvent<HTMLInputElement>) {
  const target = e.target as HTMLInputElement;
  let value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (value.length > 10) value = value.slice(0, 10);
  target.value = formatPlateNumber(value);
}

export const vehicleSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  type: z.string().min(1, "Type is required"),
  plateNumber: z
    .string()
    .regex(/^[A-Z]{2}\s?\d{2}\s?[A-Z]{2}\s?\d{4}$/, "Format: MH 01 AB 1234"),
  pricePerDay: z
    .number({ message: "Price must be a number" })
    .min(100, "Minimum ₹100/day")
    .max(100000, "Maximum ₹1,00,000/day"),
  location: z.string().min(1, "Location is required"),
  description: z.string().max(500, "Description too long").optional(),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type OtpFormData = z.infer<typeof otpSchema>;

export const profileSchema = z.object({
  mobileNumber: z
    .string()
    .regex(/^\+?\d{10,13}$/, "Enter a valid phone number (10-13 digits)")
    .or(z.literal("")),
  state: z.string().optional(),
  district: z.string().optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .or(z.literal("")),
}).refine(
  (data) => !data.district || data.state,
  { message: "State is required when district is selected", path: ["state"] },
).refine(
  (data) => {
    if (!data.state || !data.district) return true;
    return DISTRICTS_BY_STATE[data.state]?.includes(data.district) ?? false;
  },
  { message: "District does not belong to selected state", path: ["district"] },
);

export type ProfileFormData = z.infer<typeof profileSchema>;

export const bookingSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  message: z.string().max(500, "Message too long").optional(),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: "Start date must be before end date", path: ["endDate"] },
).refine(
  (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.startDate) >= today;
  },
  { message: "Start date must be today or in the future", path: ["startDate"] },
).refine(
  (data) => {
    const days = (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  },
  { message: "Booking cannot exceed 30 days", path: ["endDate"] },
);

export type BookingFormData = z.infer<typeof bookingSchema>;
