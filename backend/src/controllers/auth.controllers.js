import { validateRegister, validateLogin } from '../lib/validate.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import client from '../config/google.oauth.js';

const register = asyncHandler(async (req, res) => {
  //validation of the fields
  const validation = await validateRegister(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.message, 400);
  }
  const { username, email, password } = validation.data;

  //check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError('user already exist', 409);
  }

  //hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      userName: username,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      userName: true,
      email: true,
    },
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: newUser,
  });
});

const login = asyncHandler(async (req, res) => {
  const validation = await validateLogin(req.body);

  if (!validation.success) {
    throw new AppError('please enter valid details', 400);
  }

  const { email, password } = validation.data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  console.log('Existing User:', existingUser); // Debugging line
  if (!existingUser) {
    throw new AppError('user not found please register', 401);
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password,
  );

  if (!isPasswordCorrect) {
    throw new AppError('Please enter correct password', 401);
  }

  const accessToken = jwt.sign(
    { userId: existingUser.id },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );

  const refreshToken = jwt.sign(
    { userId: existingUser.id },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );

  res.cookie('token', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 7 * 24 * 3600 * 1000,
  });

  console.log('Token set in cookie:', refreshToken); // Debugging line

  res.status(200).json({
    message: 'user logged in successfully',
    accessToken,
  });
});

const profile = asyncHandler(async (req, res) => {
  const userId = req.user;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
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

  return res.status(200).json({ user });
});

const logOut = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
  });

  return res.status(200).json({
    message: 'Logged out successfully',
  });
});

// const googleLogin = asyncHandler(async (req, res) => {
//   const { tokenId } = req.body;

//   // Verify the token with Google
//   const ticket = await client.verifyIdToken({
//     idToken: tokenId,
//     audience: process.env.GOOGLE_CLIENT_ID,
//   });

//   const payload = ticket.getPayload();

//   // Check if the user already exists
//   const existingUser = await prisma.user.findUnique({
//     where: {
//       email: payload.email,
//     },
//   });

//   if (!existingUser) {
//     return res.status(404).json({
//       success: false,
//       message: 'Account not found. Please sign up first.',
//     });
//   }

//   // Generate a JWT token
//   const refreshToken = jwt.sign(
//     { userId: existingUser.id },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: '1d',
//     },
//   );

//   res.cookie('token', refreshToken, {
//     httponly: true,
//     secure: false,
//     sameSite: 'strict',
//     maxAge: 7 * 24 * 3600 * 1000,
//   });

//   res.status(200).json({
//     message: 'Google login successful',
//   });
// });

const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.token;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const userId = decoded.userId;

  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshTokenNew = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', refreshTokenNew, {
    httponly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 7 * 24 * 3600 * 1000,
  });

  res.status(200).json({
    message: 'Token refreshed successfully',
    accessToken,
  });
});

export { register, login, profile, logOut, refreshToken };
