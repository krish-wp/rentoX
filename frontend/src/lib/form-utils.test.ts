import { describe, it, expect } from "vitest";
import { bookingSchema, loginSchema, registerSchema, otpSchema } from "@/lib/form-utils";

describe("bookingSchema", () => {
  it("accepts valid booking data", () => {
    const result = bookingSchema.safeParse({
      startDate: "2026-11-05",
      endDate: "2026-11-07",
      message: "Please deliver to my office",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when start date is after end date", () => {
    const result = bookingSchema.safeParse({
      startDate: "2026-11-07",
      endDate: "2026-11-05",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when start date is in the past", () => {
    const result = bookingSchema.safeParse({
      startDate: "2020-01-01",
      endDate: "2026-11-07",
    });
    expect(result.success).toBe(false);
  });

  it("rejects booking longer than 30 days", () => {
    const result = bookingSchema.safeParse({
      startDate: "2026-11-01",
      endDate: "2026-12-05",
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 30 days", () => {
    const result = bookingSchema.safeParse({
      startDate: "2026-11-01",
      endDate: "2026-12-01",
    });
    expect(result.success).toBe(true);
  });

  it("requires start date", () => {
    const result = bookingSchema.safeParse({
      endDate: "2026-11-07",
    });
    expect(result.success).toBe(false);
  });

  it("requires end date", () => {
    const result = bookingSchema.safeParse({
      startDate: "2026-11-05",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "Password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      username: "john_doe",
      email: "user@example.com",
      password: "Password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const result = registerSchema.safeParse({
      username: "ab",
      email: "user@example.com",
      password: "Password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username with special chars", () => {
    const result = registerSchema.safeParse({
      username: "john@doe",
      email: "user@example.com",
      password: "Password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak password (no uppercase)", () => {
    const result = registerSchema.safeParse({
      username: "john_doe",
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("otpSchema", () => {
  it("accepts valid 6-digit OTP", () => {
    const result = otpSchema.safeParse({ otp: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects OTP not exactly 6 digits", () => {
    const result = otpSchema.safeParse({ otp: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects OTP with non-digits", () => {
    const result = otpSchema.safeParse({ otp: "12345a" });
    expect(result.success).toBe(false);
  });
});
