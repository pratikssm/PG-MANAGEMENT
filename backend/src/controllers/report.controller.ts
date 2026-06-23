import { Response } from 'express';
import Room from '../models/Room';
import Invoice from '../models/Invoice';
import Registration from '../models/Registration';
import Complaint from '../models/Complaint';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, asyncHandler } from '../utils/ApiResponse';

export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [rooms, invoices, registrations, complaints] = await Promise.all([
    Room.find({ isActive: true }),
    Invoice.find(),
    Registration.find(),
    Complaint.find(),
  ]);

  const totalRevenue = invoices.reduce((s, i) => s + (i.status === 'paid' ? i.total : 0), 0);
  const pendingDues = invoices.reduce((s, i) => s + (i.status !== 'paid' ? i.total : 0), 0);
  const totalBeds = rooms.reduce((s, r) => s + r.totalBeds, 0);
  const occupiedBeds = rooms.reduce((s, r) => s + r.occupiedBeds, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  res.json(ApiResponse.ok('Dashboard stats', {
    totalRevenue,
    pendingDues,
    totalBeds,
    occupiedBeds,
    availableBeds: totalBeds - occupiedBeds,
    occupancyRate,
    totalRegistrations: registrations.length,
    pendingRegistrations: registrations.filter((r) => r.status === 'pending').length,
    approvedResidents: registrations.filter((r) => r.status === 'approved').length,
    totalComplaints: complaints.length,
    openComplaints: complaints.filter((c) => c.status !== 'resolved').length,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
  }));
});

export const getOccupancyReport = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const rooms = await Room.find({ isActive: true }).lean();
  const report = rooms.map((r) => ({
    name: r.name,
    pg: r.pg,
    ac: r.ac,
    seater: r.seater,
    totalBeds: r.totalBeds,
    occupiedBeds: r.occupiedBeds,
    availableBeds: r.totalBeds - r.occupiedBeds,
    occupancyRate: r.totalBeds > 0 ? Math.round((r.occupiedBeds / r.totalBeds) * 100) : 0,
    rent: r.rent,
  }));
  res.json(ApiResponse.ok('Occupancy report', { report }));
});

export const getRevenueReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { months = 6 } = req.query;
  const since = new Date();
  since.setMonth(since.getMonth() - Number(months));

  const invoices = await Invoice.find({ createdAt: { $gte: since }, status: 'paid' }).lean();

  const monthly: Record<string, number> = {};
  for (const inv of invoices) {
    const key = inv.date.slice(0, 7);
    monthly[key] = (monthly[key] || 0) + inv.total;
  }

  const report = Object.entries(monthly)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  res.json(ApiResponse.ok('Revenue report', { report }));
});
