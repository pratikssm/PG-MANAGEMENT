import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentKey } from '../controllers/payment.controller';
import { protect, requireApprovedResident } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bookingSchema, paymentVerifySchema } from '../validators/schemas';

const router = Router();

router.get('/key', protect, requireApprovedResident, getPaymentKey);
router.post('/order', protect, requireApprovedResident, validate(bookingSchema), createOrder);
router.post('/verify', protect, validate(paymentVerifySchema), verifyPayment);

export default router;
