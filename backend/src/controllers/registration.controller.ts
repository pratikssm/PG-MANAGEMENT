import { Response } from 'express';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { sendRegistrationToOwner } from '../utils/whatsapp';
import { sendEmail } from '../utils/email';
import { sendSMS } from '../utils/sms';

export const createRegistration = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reg = await Registration.create({ ...req.body, userId: req.user?.id });

  sendRegistrationToOwner(reg.toObject()).catch((e) => console.error('WhatsApp send error:', e));

  const emailHtml = `<h2>Registration Received!</h2><p>Hi ${reg.fullName},</p><p>Your registration has been received. Our team will contact you within 24 hours.</p><p>Registration ID: ${reg._id}</p>`;
  sendEmail(reg.email, 'StayNest - Registration Received', emailHtml).catch(() => {});
  sendSMS(reg.mobile, 'StayNest: Registration received! Our team will contact you within 24 hours.').catch(() => {});

  res.status(201).json(ApiResponse.ok('Registration submitted successfully', { registration: reg }));
});

export const getRegistrations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  const filter: any = {};
  if (status) filter.status = status;
  const registrations = await Registration.find(filter).sort({ createdAt: -1 });
  res.json(ApiResponse.ok('Registrations fetched', { count: registrations.length, registrations }));
});

export const getMyRegistration = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reg = await Registration.findOne({ userId: req.user!.id });
  if (!reg) throw new AppError('Registration not found', 404);
  res.json(ApiResponse.ok('Registration fetched', { registration: reg }));
});

export const approveRegistration = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reg = await Registration.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!reg) throw new AppError('Registration not found', 404);

  const emailHtml = `<h2>Registration Approved! 🎉</h2><p>Hi ${reg.fullName},</p><p>Your registration at StayNest has been approved. Welcome to the family!</p>`;
  sendEmail(reg.email, 'StayNest - Registration Approved!', emailHtml).catch(() => {});
  sendSMS(reg.mobile, 'StayNest: Your registration has been APPROVED! Welcome to StayNest.').catch(() => {});

  res.json(ApiResponse.ok('Registration approved', { registration: reg }));
});

export const rejectRegistration = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reg = await Registration.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!reg) throw new AppError('Registration not found', 404);
  res.json(ApiResponse.ok('Registration rejected', { registration: reg }));
});

export const deleteRegistration = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reg = await Registration.findByIdAndDelete(req.params.id);
  if (!reg) throw new AppError('Registration not found', 404);
  res.json(ApiResponse.ok('Registration deleted'));
});
