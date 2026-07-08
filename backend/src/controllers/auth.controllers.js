import {
  validateRegister,
  validateLogin,
  validateOtp,
} from '../lib/validate.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { otpGenerator, generateOTPhtml } from '../utils/otp.js';
import sendEmail from '../services/email.service.js';
import config from '../config/constants.js';

const register = asyncHandler(async (req, res) => {
  const validation = await validateRegister(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.message, 400);
  }
  const { username, email, password } = validation.data;

  let existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.verified) {
      throw new AppError('user already exist', 409);
    }
  }

  const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

  const otp = otpGenerator();

  const otpEmail = generateOTPhtml(otp);

  await sendEmail(email, 'Welcome to RentoX', otpEmail.html);

  const hashedOtp = await bcrypt.hash(otp, config.bcryptSaltRounds);

  if (!existingUser) {
    existingUser = await prisma.user.create({
      data: {
        userName: username,
        email,
        password: hashedPassword,
        verified: false,
      },
      select: {
        id: true,
        userName: true,
        email: true,
      },
    });
  }

  existingUser = await prisma.user.update({
    where: { email },
    data: {
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000),
    },
    select: {
      id: true,
      userName: true,
      email: true,
    },
  });

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

  if (!existingUser.verified) {
    throw new AppError('Please verify your account first', 401);
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password,
  );

  if (!isPasswordCorrect) {
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

  res.cookie('token', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
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
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
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

  const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
  const userId = decoded.userId;

  const accessToken = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiry,
  });

  const refreshTokenNew = jwt.sign({ userId }, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenExpiry,
  });

  res.cookie('token', refreshTokenNew, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: config.cookieMaxAgeDays * 24 * 3600 * 1000,
  });

  res.status(200).json({
    message: 'Token refreshed successfully',
    accessToken,
  });
});

const editProfile = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { mobileNumber, state, district, pincode } = req.body;

  if (!mobileNumber || !state || !district || !pincode) {
    throw new AppError('All fields are required', 400);
  }

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
