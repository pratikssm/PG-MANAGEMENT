import { Router } from 'express';
import { getDashboardStats, getOccupancyReport, getRevenueReport } from '../controllers/report.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/occupancy', protect, authorize('admin'), getOccupancyReport);
router.get('/revenue', protect, authorize('admin'), getRevenueReport);

export default router;
