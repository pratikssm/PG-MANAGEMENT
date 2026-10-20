import { Router } from 'express';
import { createRegistration, getRegistrations, getMyRegistration, approveRegistration, rejectRegistration, deleteRegistration } from '../controllers/registration.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { residentRegistrationSchema } from '../validators/schemas';

const router = Router();

router.post('/', protect, authorize('resident'), validate(residentRegistrationSchema), createRegistration);
router.get('/', protect, authorize('admin'), getRegistrations);
router.get('/me', protect, getMyRegistration);
router.patch('/:id/approve', protect, authorize('admin'), approveRegistration);
router.patch('/:id/reject', protect, authorize('admin'), rejectRegistration);
router.delete('/:id', protect, authorize('admin'), deleteRegistration);

export default router;
