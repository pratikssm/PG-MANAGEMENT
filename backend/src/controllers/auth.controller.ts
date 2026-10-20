import { Response } from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import User from '../models/User';
import Otp from '../models/Otp';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { signToken } from '../utils/jwt';
import { generateOtp, sendOtpEmail } from '../utils/email';
import { env } from '../config/env';

export const signup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, password } = req.body;
  const email = String(req.body.email).trim().toLowerCase();

  const existing = await User.exists({ email });
  if (existing) throw new AppError('An account already exists for this email. Please log in.', 409);

  const challenge = await Otp.findOneAndUpdate(
    { email, verifiedAt: { $ne: null }, consumedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { consumedAt: new Date() } },
    { new: true },
  );
  if (!challenge) throw new AppError('Verify your email before creating an account.', 403);

  try {
    const user = await User.create({ name, email, password, role: 'resident', isEmailVerified: true });
    res.status(201).json(ApiResponse.ok('Account created successfully. Please log in.', { user: sanitize(user) }));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      throw new AppError('An account already exists for this email. Please log in.', 409);
    }
    throw error;
  }
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { password, role: expectedRole } = req.body;
  const email = String(req.body.email).trim().toLowerCase();

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)) || !user.isEmailVerified || (expectedRole && user.role !== expectedRole)) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    sessionVersion: user.sessionVersion,
  });
  setCookie(res, token);
  res.json(ApiResponse.ok('Login successful', { token, user: sanitize(user) }));
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  await User.updateOne({ _id: req.user!.id }, { $inc: { sessionVersion: 1 } });
  res.clearCookie('token');
  res.json(ApiResponse.ok('Logged out successfully'));
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);
  res.json(ApiResponse.ok('User fetched', { user: sanitize(user) }));
});

export const requestOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const email = String(req.body.email).trim().toLowerCase();
  const existing = await User.findOne({ email }).select('isEmailVerified');
  if (existing?.isEmailVerified) {
    throw new AppError('An account already exists for this email. Please log in.', 409);
  }
  const recentlyRequested = await Otp.exists({
    email,
    createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
  });
  if (recentlyRequested) throw new AppError('Please wait before requesting another verification code.', 429);

  const code = generateOtp();
  const salt = randomBytes(16).toString('hex');
  const codeHash = hashOtp(email, salt, code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.deleteMany({ email });
  await Otp.create({ email, codeHash, salt, expiresAt });

  const sent = await sendOtpEmail(email, code);
  if (!sent) {
    await Otp.deleteMany({ email });
    throw new AppError('Email delivery is not configured or failed. Please contact the site administrator.', 503);
  }
  res.json(ApiResponse.ok('If this email is eligible, a verification code has been sent.'));
});

export const verifyOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const email = String(req.body.email).trim().toLowerCase();
  const { otp } = req.body;

  const record = await Otp.findOne({ email, consumedAt: null })
    .select('+codeHash +salt')
    .sort({ createdAt: -1 });
  if (!record) throw new AppError('No active verification code found. Please request a new one.', 400);
  if (record.expiresAt <= new Date()) {
    await Otp.deleteOne({ _id: record._id });
    throw new AppError('Verification code expired. Please request a new one.', 400);
  }
  if (record.verifiedAt) throw new AppError('This verification code has already been used.', 400);

  const attempt = await Otp.findOneAndUpdate(
    { _id: record._id, attempts: { $lt: 5 }, verifiedAt: null, consumedAt: null },
    { $inc: { attempts: 1 } },
    { new: true },
  ).select('+codeHash +salt');
  if (!attempt) throw new AppError('Too many verification attempts. Request a new code.', 429);

  const suppliedHash = Buffer.from(hashOtp(email, attempt.salt, otp), 'hex');
  const expectedHash = Buffer.from(attempt.codeHash, 'hex');
  if (suppliedHash.length !== expectedHash.length || !timingSafeEqual(suppliedHash, expectedHash)) {
    if (attempt.attempts >= 5) await Otp.deleteOne({ _id: attempt._id });
    throw new AppError(attempt.attempts >= 5 ? ' verification attempts. Request a new code.' : 'Invalid verification code.', attempt.attempts >= 5 ? 429 : 400);
  }

  const verified = await Otp.findOneAndUpdate(
    { _id: attempt._id, verifiedAt: null, consumedAt: null },
    { $set: { verifiedAt: new Date(), expiresAt: new Date(Date.now() + 15 * 60 * 1000) } },
    { new: true },
  );
  if (!verified) throw new AppError('Verification code has already been used.', 400);

  await User.updateOne({ email, isEmailVerified: false }, { $set: { isEmailVerified: true } });
  res.json(ApiResponse.ok('Email verified. You can now create your account.'));
});

function hashOtp(email: string, salt: string, code: string): string {
  return createHmac('sha256', env.jwtSecret).update(`${email}:${salt}:${code}`).digest('hex');
}

function setCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge: env.jwtCookieExpiresIn * 24 * 60 * 60 * 1000,
  });
}

function sanitize(user: any) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar, isEmailVerified: user.isEmailVerified };
}
