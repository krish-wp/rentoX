import {
  validateRegister,
  validateLogin,
  validateOtp,
  validateEditProfile,
} from '../lib/validate.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { otpGenerator } from '../utils/otp.js';
import { otpEmail, alreadyRegisteredEmail } from '../utils/emailTemplates.js';
import trySendEmail from '../utils/sendMail.js';
import config from '../config/constants.js';
import crypto from 'crypto';

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const register = asyncHandler(async (req, res) => {
  const validation = await validateRegister(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.message, 400);
  }
  const { username, email, password } = validation.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // Same response whether or not the email is taken, so the endpoint
  // cannot be used to enumerate registered accounts.
  if (existingUser && existingUser.verified) {
    await trySendEmail(
      email,
      'You already have a RentoX account',
      alreadyRegisteredEmail(existingUser.userName),
      'already-registered',
    );
    return res.status(201).json({
      message: 'otp sent to your email please verify your account',
    });
  }

  const otp = otpGenerator();
  const hashedOtp = await bcrypt.hash(otp, config.bcryptSaltRounds);

  if (!existingUser) {
    await prisma.user.create({
      data: {
        userName: username,
        email,
        password: await bcrypt.hash(password, config.bcryptSaltRounds),
        verified: false,
      },
    });
  }

  await prisma.user.update({
    where: { email },
    data: {
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000),
    },
  });

  await trySendEmail(email, 'Welcome to RentoX', otpEmail(otp), 'OTP');

  res.status(201).json({
    message: 'otp sent to your email please verify your account',
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const validation = await validateOtp(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.message, 400);
  }

  const { email, otp } = validation.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isOtpValid = await bcrypt.compare(otp, user.otp);

  if (!isOtpValid || new Date() > user.otpExpiry) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  await prisma.user.update({
    where: { email },
    data: {
      verified: true,
      otp: null,
      otpExpiry: null,
    },
  });

  res.status(200).json({
    message: 'Account verified successfully now you can login to your account',
  });
});

const login = asyncHandler(async (req, res) => {
  const validation = await validateLogin(req.body);

  if (!validation.success) {
    throw new AppError('please enter valid details', 400);
  }

  const { email, password } = validation.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    throw new AppError('user not found please register', 401);
  }

  if (
    existingUser.lockedUntil &&
    existingUser.lockedUntil.getTime() > Date.now()
  ) {
    throw new AppError(
      'Too many failed login attempts. Please try again later.',
      429,
    );
  }

  if (!existingUser.verified) {
    throw new AppError('Please verify your account first', 401);
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password,
  );

  if (!isPasswordCorrect) {
    const failedLoginAttempts = existingUser.failedLoginAttempts + 1;
    const lockNow = failedLoginAttempts >= MAX_FAILED_LOGINS;
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        failedLoginAttempts,
        ...(lockNow && { lockedUntil: new Date(Date.now() + LOCKOUT_MS) }),
      },
    });
    throw new AppError('Please enter correct password', 401);
  }

  const accessToken = jwt.sign({ userId: existingUser.id }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiry,
  });

  const refreshToken = jwt.sign(
    { userId: existingUser.id },
    config.jwtRefreshSecret,
    { expiresIn: config.refreshTokenExpiry },
  );

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      refreshTokenHash: hashToken(refreshToken),
    },
  });

  res.cookie('token', refreshToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: config.cookieMaxAgeDays * 24 * 3600 * 1000,
  });

  res.status(200).json({
    message: 'user logged in successfully',
    accessToken,
  });
});

const profile = asyncHandler(async (req, res) => {
  const userId = req.user;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      userName: true,
      email: true,
      mobileNumber: true,
      state: true,
      district: true,
      pincode: true,
      isProfileCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ user });
});

const logOut = asyncHandler(async (req, res) => {
  await prisma.user.updateMany({
    where: { id: req.user, refreshTokenHash: { not: null } },
    data: { refreshTokenHash: null },
  });

  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
  });

  return res.status(200).json({
    message: 'Logged out successfully',
  });
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.token;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtRefreshSecret, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
  const userId = decoded.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Reject any token that is not the one currently on record: this makes a
  // stolen refresh token useless as soon as the real one is used or revoked.
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: null },
      });
    }
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const accessToken = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiry,
  });

  const refreshTokenNew = jwt.sign({ userId }, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenExpiry,
  });

  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: hashToken(refreshTokenNew) },
  });

  res.cookie('token', refreshTokenNew, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: config.cookieMaxAgeDays * 24 * 3600 * 1000,
  });

  res.status(200).json({
    message: 'Token refreshed successfully',
    accessToken,
  });
});

const editProfile = asyncHandler(async (req, res) => {
  const userId = req.user;

  const validation = validateEditProfile(req.body);
  if (!validation.success) {
    throw new AppError(validation.error.message, 400);
  }

  const { mobileNumber, state, district, pincode } = validation.data;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      mobileNumber,
      state,
      district,
      pincode,
      isProfileCompleted: true,
    },
    select: {
      id: true,
      userName: true,
      email: true,
      mobileNumber: true,
      state: true,
      district: true,
      pincode: true,
      isProfileCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res
    .status(200)
    .json({ message: 'Profile updated successfully', user: updatedUser });
});

export {
  register,
  login,
  profile,
  logOut,
  handleRefreshToken,
  verifyOtp,
  editProfile,
};
