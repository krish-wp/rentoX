import { Router } from 'express';
import {
  sendRequest,
  getAllRequestsForVehicle,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
  deleteRequest,
} from '../controllers/request.controller.js';
import authMiddleware from '../middleware/jwt.js';

const router = Router();

// Send a rental request
router.post('/sendrequest', authMiddleware, sendRequest);

// Get all requests for a specific vehicle (owner only)
router.get('/vehicle/:vehicleId', authMiddleware, getAllRequestsForVehicle);

// Get all requests received by the logged-in user (as owner)
router.get('/received', authMiddleware, getReceivedRequests);

// Get all requests sent by the logged-in user
router.get('/sent', authMiddleware, getSentRequests);

// Update request status by owner (accept/reject)
router.put('/:requestId/status', authMiddleware, updateRequestStatus);

//delete request by sender
router.delete('/:requestId', authMiddleware, deleteRequest);

export default router;
