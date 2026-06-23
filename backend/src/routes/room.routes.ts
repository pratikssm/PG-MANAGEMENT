import { Router } from 'express';
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, updatePricing, updateOccupancy } from '../controllers/room.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { roomSchema } from '../validators/schemas';

const router = Router();

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', protect, authorize('admin'), validate(roomSchema), createRoom);
router.put('/:id', protect, authorize('admin'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);
router.patch('/:id/pricing', protect, authorize('admin'), updatePricing);
router.patch('/:id/occupancy', protect, authorize('admin'), updateOccupancy);

export default router;
