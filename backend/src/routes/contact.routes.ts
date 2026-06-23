import { Router } from 'express';
import { createContact, getContacts, resolveContact } from '../controllers/contact.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { contactSchema } from '../validators/schemas';

const router = Router();

router.post('/', validate(contactSchema), createContact);
router.get('/', protect, authorize('admin'), getContacts);
router.patch('/:id/resolve', protect, authorize('admin'), resolveContact);

export default router;
