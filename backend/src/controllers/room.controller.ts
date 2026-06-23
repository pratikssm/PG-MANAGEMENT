import { Response } from 'express';
import Room from '../models/Room';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';

export const getRooms = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { pg, ac, seater, sort, maxPrice } = req.query;

  const filter: any = { isActive: true };
  if (pg) filter.pg = pg;
  if (ac) filter.ac = ac;
  if (seater) filter.seater = Number(seater);
  if (maxPrice) filter.rent = { $lte: Number(maxPrice) };

  let query = Room.find(filter);
  if (sort === 'low') query = query.sort({ rent: 1 });
  if (sort === 'high') query = query.sort({ rent: -1 });

  const rooms = await query.exec();
  res.json(ApiResponse.ok('Rooms fetched', { count: rooms.length, rooms }));
});

export const getRoomById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new AppError('Room not found', 404);
  res.json(ApiResponse.ok('Room fetched', { room }));
});

export const createRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const room = await Room.create(req.body);
  res.status(201).json(ApiResponse.ok('Room created', { room }));
});

export const updateRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!room) throw new AppError('Room not found', 404);
  res.json(ApiResponse.ok('Room updated', { room }));
});

export const deleteRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!room) throw new AppError('Room not found', 404);
  res.json(ApiResponse.ok('Room deleted'));
});

export const updatePricing = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rent, deposit } = req.body;
  const room = await Room.findByIdAndUpdate(req.params.id, { rent, deposit }, { new: true });
  if (!room) throw new AppError('Room not found', 404);
  res.json(ApiResponse.ok('Pricing updated', { room }));
});

export const updateOccupancy = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { occupiedBeds } = req.body;
  const room = await Room.findById(req.params.id);
  if (!room) throw new AppError('Room not found', 404);
  if (occupiedBeds > room.totalBeds) throw new AppError('Occupied beds cannot exceed total beds', 400);
  room.occupiedBeds = occupiedBeds;
  await room.save();
  res.json(ApiResponse.ok('Occupancy updated', { room }));
});
