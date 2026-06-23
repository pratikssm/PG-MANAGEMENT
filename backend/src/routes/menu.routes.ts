import { Router } from 'express';
import { getMenu, getTodaysMenu, updateMenuItem, createMenuItem } from '../controllers/menu.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getMenu);
router.get('/today', getTodaysMenu);
router.post('/', protect, authorize('admin'), createMenuItem);
router.put('/:id', protect, authorize('admin'), updateMenuItem);

export default router;
