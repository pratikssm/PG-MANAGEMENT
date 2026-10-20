import { Router } from 'express';
import { getComplaints, createComplaint, assignComplaint, resolveComplaint, deleteComplaint } from '../controllers/complaint.controller';
import { protect, authorize, requireApprovedResident } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { complaintSchema, complaintAssignmentSchema } from '../validators/schemas';

const router = Router();

router.get('/', protect, requireApprovedResident, getComplaints);
router.post('/', protect, requireApprovedResident, validate(complaintSchema), createComplaint);
router.patch('/:id/assign', protect, authorize('admin'), validate(complaintAssignmentSchema), assignComplaint);
router.patch('/:id/resolve', protect, authorize('admin'), resolveComplaint);
router.delete('/:id', protect, authorize('admin'), deleteComplaint);

export default router;
