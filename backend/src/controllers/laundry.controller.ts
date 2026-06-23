import { Response } from 'express';
import LaundryRequest from '../models/LaundryRequest';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';

export const getLaundryRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter: any = {};
  if (req.user!.role === 'resident') {
    const reg = await Registration.findOne({ userId: req.user!.id });
    filter.residentId = reg?._id;
  }
  const requests = await LaundryRequest.find(filter).sort({ createdAt: -1 });
  res.json(ApiResponse.ok('Laundry requests fetched', { count: requests.length, requests }));
});

export const createLaundryRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reg = await Registration.findOne({ userId: req.user!.id });
  if (!reg) throw new AppError('Please complete registration first', 400);

  const request = await LaundryRequest.create({
    ...req.body,
    residentId: reg._id,
    residentName: reg.fullName,
  });
  res.status(201).json(ApiResponse.ok('Laundry request created', { request }));
});

export const updateLaundryStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const request = await LaundryRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!request) throw new AppError('Laundry request not found', 404);
  res.json(ApiResponse.ok('Laundry status updated', { request }));
});
