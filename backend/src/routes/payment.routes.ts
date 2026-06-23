import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentKey } from '../controllers/payment.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bookingSchema } from '../validators/schemas';

const router = Router();

router.get('/key', protect, getPaymentKey);
router.post('/order', protect, validate(bookingSchema), createOrder);
router.post('/verify', protect, verifyPayment);

export default router;
