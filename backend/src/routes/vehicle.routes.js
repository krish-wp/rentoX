import { Router } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  myVehicles,
  toggleAvailability,
} from '../controllers/vehicle.controller.js';
import authMiddleware from '../middleware/jwt.js';

const router = Router();

router.get('/', authMiddleware, getAllVehicles);
router.get('/mine', authMiddleware, myVehicles);
router.get('/:id', authMiddleware, getVehicleById);
router.post('/', authMiddleware, createVehicle);
router.put('/:id', authMiddleware, updateVehicle);
router.patch('/:id/availability', authMiddleware, toggleAvailability);
router.delete('/:id', authMiddleware, deleteVehicle);

export default router;
