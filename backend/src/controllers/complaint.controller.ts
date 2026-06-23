import { Response } from 'express';
import Complaint from '../models/Complaint';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';

export const getComplaints = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter: any = {};
  if (req.user!.role === 'resident') {
    const reg = await Registration.findOne({ userId: req.user!.id });
    filter.residentId = reg?._id;
  }
  const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
  res.json(ApiResponse.ok('Complaints fetched', { count: complaints.length, complaints }));
});

export const createComplaint = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reg = await Registration.findOne({ userId: req.user!.id });
  if (!reg) throw new AppError('Please complete registration first', 400);

  const complaint = await Complaint.create({
    ...req.body,
    residentId: reg._id,
    residentName: reg.fullName,
  });
  res.status(201).json(ApiResponse.ok('Complaint filed', { complaint }));
});

export const assignComplaint = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { assignedTo } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status: 'assigned', assignedTo },
    { new: true }
  );
  if (!complaint) throw new AppError('Complaint not found', 404);
  res.json(ApiResponse.ok('Complaint assigned', { complaint }));
});

export const resolveComplaint = asyncHandler(async (req: AuthRequest, res: Response) => {
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status: 'resolved' },
    { new: true }
  );
  if (!complaint) throw new AppError('Complaint not found', 404);
  res.json(ApiResponse.ok('Complaint resolved', { complaint }));
});

export const deleteComplaint = asyncHandler(async (req: AuthRequest, res: Response) => {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);
  if (!complaint) throw new AppError('Complaint not found', 404);
  res.json(ApiResponse.ok('Complaint deleted'));
});
