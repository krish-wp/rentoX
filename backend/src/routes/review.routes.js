import { Router } from 'express';
import {
  createReview,
  getUserReviews,
  getVehicleReviews,
} from '../controllers/review.controller.js';
import authMiddleware from '../middleware/jwt.js';

const router = Router();

router.post('/rental-requests/:rentalRequestId/review', authMiddleware, createReview);
router.get('/users/:userId/reviews', getUserReviews);
router.get('/vehicles/:vehicleId/reviews', getVehicleReviews);

export default router;
