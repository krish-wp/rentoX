import { validateRegister, validateLogin } from '../lib/validate.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

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

  const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httponly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 7 * 24 * 3600 * 1000,
  });

  res.status(200).json({
    message: 'user logged in successfully',
  });
});

const profile = asyncHandler(async (req, res) => {
  const userId = req.user;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  const { password, ...safeUser } = user;

  return res.status(200).json({ user: safeUser });
});

const logOut = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    message: 'Logged out successfully',
  });
});
export { register, login, profile, logOut };
