import { Router } from 'express';
import { getLaundryRequests, createLaundryRequest, updateLaundryStatus } from '../controllers/laundry.controller';
import { protect, authorize, requireApprovedResident } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { laundrySchema, laundryStatusSchema } from '../validators/schemas';

const router = Router();

router.get('/', protect, requireApprovedResident, getLaundryRequests);
router.post('/', protect, requireApprovedResident, validate(laundrySchema), createLaundryRequest);
router.patch('/:id', protect, authorize('admin'), validate(laundryStatusSchema), updateLaundryStatus);

export default router;
