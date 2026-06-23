import { Router } from 'express';
import { sendBroadcast } from '../controllers/broadcast.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { broadcastSchema } from '../validators/schemas';

const router = Router();

router.post('/', protect, authorize('admin'), validate(broadcastSchema), sendBroadcast);

export default router;
