import { Router } from 'express';
import { signup, login, logout, getMe, requestOtp, verifyOtp, requestPasswordReset, verifyPasswordResetOtp, resetPassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { authLimiter, otpLimiter, otpVerifyLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, otpRequestSchema, otpVerifySchema, forgotPasswordSchema, verifyPasswordResetOtpSchema, resetPasswordSchema } from '../validators/schemas';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/otp/request', otpLimiter, validate(otpRequestSchema), requestOtp);
router.post('/otp/verify', otpVerifyLimiter, validate(otpVerifySchema), verifyOtp);
router.post('/password/forgot', otpLimiter, validate(forgotPasswordSchema), requestPasswordReset);
router.post('/password/verify', otpVerifyLimiter, validate(verifyPasswordResetOtpSchema), verifyPasswordResetOtp);
router.post('/password/reset', authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
