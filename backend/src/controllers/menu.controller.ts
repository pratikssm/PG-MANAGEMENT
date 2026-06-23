import { Response } from 'express';
import MenuItem from '../models/MenuItem';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';

export const getMenu = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const menu = await MenuItem.find({ isActive: true }).sort({ _id: 1 });
  res.json(ApiResponse.ok('Menu fetched', { menu }));
});

export const getTodaysMenu = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  const item = await MenuItem.findOne({ day: today, isActive: true });
  if (!item) throw new AppError('Today\'s menu not found', 404);
  res.json(ApiResponse.ok('Today\'s menu fetched', { menu: item }));
});

export const updateMenuItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) throw new AppError('Menu item not found', 404);
  res.json(ApiResponse.ok('Menu updated', { item }));
});

export const createMenuItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await MenuItem.create(req.body);
  res.status(201).json(ApiResponse.ok('Menu item created', { item }));
});
