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

const router = Router();

router.get('/me', authMiddleware, profile);

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authMiddleware, logOut);
router.post('/refresh', handleRefreshToken);

router.post('/verify-otp', authLimiter, verifyOtp);

router.put('/me', authMiddleware, editProfile);

// router.post('/google', googleLogin);

export default router;
