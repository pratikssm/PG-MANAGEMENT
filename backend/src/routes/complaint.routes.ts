import { Router } from 'express';
import { getComplaints, createComplaint, assignComplaint, resolveComplaint, deleteComplaint } from '../controllers/complaint.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { complaintSchema } from '../validators/schemas';

const router = Router();

router.get('/', protect, getComplaints);
router.post('/', protect, validate(complaintSchema), createComplaint);
router.patch('/:id/assign', protect, authorize('admin'), assignComplaint);
router.patch('/:id/resolve', protect, authorize('admin'), resolveComplaint);
router.delete('/:id', protect, authorize('admin'), deleteComplaint);

export default router;
