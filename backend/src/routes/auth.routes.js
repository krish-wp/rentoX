import { Router } from 'express';
import {
  register,
  login,
  profile,
  logOut,
} from '../controllers/auth.controllers.js';
import authMiddleware from '../middleware/jwt.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, profile);
router.post('/logout', authMiddleware, logOut);

export default router;
