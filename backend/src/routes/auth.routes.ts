import { Router } from 'express';
import { signup, login, logout, getMe, requestOtp, verifyOtp, googleCallback } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { authLimiter, otpLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, otpRequestSchema, otpVerifySchema } from '../validators/schemas';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/otp/request', otpLimiter, validate(otpRequestSchema), requestOtp);
router.post('/otp/verify', validate(otpVerifySchema), verifyOtp);
router.post('/google', googleCallback);

export default router;
