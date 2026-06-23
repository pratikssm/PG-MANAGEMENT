import { Router } from 'express';
import { getLaundryRequests, createLaundryRequest, updateLaundryStatus } from '../controllers/laundry.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { laundrySchema } from '../validators/schemas';

const router = Router();

router.get('/', protect, getLaundryRequests);
router.post('/', protect, validate(laundrySchema), createLaundryRequest);
router.patch('/:id', protect, authorize('admin'), updateLaundryStatus);

export default router;
