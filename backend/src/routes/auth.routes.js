import { Router } from 'express';
import {
  register,
  login,
  profile,
  logOut,
  // googleLogin,
  handleRefreshToken,
  verifyOtp,
} from '../controllers/auth.controllers.js';
import authMiddleware from '../middleware/jwt.js';

const router = Router();

router.get('/me', authMiddleware, profile);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logOut);
router.post('/refresh', handleRefreshToken);

router.post('/verify-otp', verifyOtp);

// router.post('/google', googleLogin);

export default router;
