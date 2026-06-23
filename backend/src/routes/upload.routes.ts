import { Router } from 'express';
import { uploadFile, uploadMultiple } from '../controllers/upload.controller';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', protect, authorize('admin'), upload.single('file'), uploadFile);
router.post('/multiple', protect, authorize('admin'), upload.array('files', 10), uploadMultiple);

export default router;
