import { Router } from 'express';
import {
  register,
  login,
  profile,
  logOut,
  // googleLogin,
  handleRefreshToken,
  editProfile,
  verifyOtp,
} from '../controllers/auth.controllers.js';
import authMiddleware from '../middleware/jwt.js';
import { authLimiter } from '../middleware/ratelimit.js';
import prisma from '../lib/prisma.js';
import config from '../config/constants.js';

const router = Router();

router.get('/me', authMiddleware, profile);

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authMiddleware, logOut);
router.post('/refresh', handleRefreshToken);

router.post('/verify-otp', authLimiter, verifyOtp);

router.put('/me', authMiddleware, editProfile);

if (config.isDevelopment) {
  router.post('/dev/auto-verify', async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await prisma.user.update({
      where: { email },
      data: { verified: true, otp: null, otpExpiry: null },
    });
    res.json({ message: `User ${email} auto-verified` });
  });
}

// router.post('/google', googleLogin);

export default router;
