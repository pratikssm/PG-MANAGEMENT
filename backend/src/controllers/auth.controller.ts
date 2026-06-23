import { Response } from 'express';
import User from '../models/User';
import Otp from '../models/Otp';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { signToken } from '../utils/jwt';
import { generateOtp, sendOtpEmail } from '../utils/email';
import { env } from '../config/env';

export const signup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered. Please log in.', 409);

  const user = await User.create({ name, email, password, phone, role: 'resident' });
  const token = signToken({ id: user._id.toString(), role: user.role, email: user.email });

  setCookie(res, token);
  res.status(201).json(ApiResponse.ok('Account created successfully', { token, user: sanitize(user) }));
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({ id: user._id.toString(), role: user.role, email: user.email });
  setCookie(res, token);
  res.json(ApiResponse.ok('Login successful', { token, user: sanitize(user) }));
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.clearCookie('token');
  res.json(ApiResponse.ok('Logged out successfully'));
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);
  res.json(ApiResponse.ok('User fetched', { user: sanitize(user) }));
});

export const requestOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.deleteMany({ email });
  await Otp.create({ email, code, expiresAt });

  await sendOtpEmail(email, code);
  res.json(ApiResponse.ok('OTP sent to your email'));
});

export const verifyOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email, isUsed: false });
  if (!record) throw new AppError('No OTP found. Please request a new one.', 400);
  if (record.expiresAt < new Date()) throw new AppError('OTP expired. Please request a new one.', 400);
  if (record.code !== otp) throw new AppError('Invalid OTP', 400);

  record.isUsed = true;
  await record.save();

  await User.updateOne({ email }, { isEmailVerified: true });
  res.json(ApiResponse.ok('Email verified successfully'));
});

export const googleCallback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { googleId, email, name, avatar } = req.body;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      phone: '',
      isEmailVerified: true,
      role: 'resident',
    });
  }

  const token = signToken({ id: user._id.toString(), role: user.role, email: user.email });
  setCookie(res, token);
  res.json(ApiResponse.ok('Google login successful', { token, user: sanitize(user) }));
});

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
