import { validateRegister, validateLogin } from '../lib/validate.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
  //validation of the fields
  const validation = await validateRegister(req.body);

  if (!validation.success) {
    return res.status(400).json({ message: validation.error.message });
  }
  const { username, email, password } = validation.data;

  //check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ message: 'User already exists please login' });
  }

  //hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      userName: username,
      email,
      password: hashedPassword,
    },
  });

  res.json({
    message: 'User registered successfully',
    user: newUser.select({
      id: true,
      userName: true,
      email: true,
    }),
  });
};

const login = async (req, res) => {
  const validation = await validateLogin(req.body);

  const { email, password } = validation.data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!existingUser) {
    return res.status(400).json({ message: 'User not found please register' });
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password,
  );

  if (!isPasswordCorrect) {
    return res.status(400).json({
      message: 'Wrong password please try again',
    });
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
};

const profile = async (req, res) => {
  const userId = req.body.userId;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  const { password, ...safeUser } = user;

  return res.status(200).json({ safeUser });
};

const logOut = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    message: 'Logged out successfully',
  });
};
export { register, login, profile, logOut };
