import { Response } from 'express';
import Registration from '../models/Registration';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { sendRegistrationToOwner } from '../utils/whatsapp';
import { sendEmail } from '../utils/email';
import { sendSMS } from '../utils/sms';

export const createRegistration = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user || user.role !== 'resident') throw new AppError('Only resident accounts can submit a registration.', 403);
  const existing = await Registration.findOne({ userId: user._id });
  if (existing) throw new AppError('A registration already exists for this account.', 409);

  let reg;
  try {
    reg = await Registration.create({ ...req.body, email: user.email, userId: user._id });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      throw new AppError('A registration already exists for this account.', 409);
    }
    throw error;
  }
  user.registrationId = reg._id;
  await user.save();

  void sendRegistrationToOwner(reg.toObject()).catch((error) => console.error('WhatsApp registration notification failed:', error));

  const safeName = reg.fullName.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
  const emailHtml = `<h2>Registration Received!</h2><p>Hi ${safeName},</p><p>Your registration has been received. Our team will contact you within 24 hours.</p><p>Registration ID: ${reg._id}</p>`;
  void sendEmail(reg.email, 'StayNest - Registration Received', emailHtml).catch((error) => console.error('Registration email failed:', error));
  void sendSMS(reg.mobile, 'StayNest: Registration received! Our team will contact you within 24 hours.').catch((error) => console.error('Registration SMS failed:', error));

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
  if (reg.userId) await User.updateOne({ _id: reg.userId, registrationId: reg._id }, { $unset: { registrationId: 1 } });
  res.json(ApiResponse.ok('Registration deleted'));
});
