import { Router } from 'express';
import authRoutes from './auth.routes';
import roomRoutes from './room.routes';
import registrationRoutes from './registration.routes';
import invoiceRoutes from './invoice.routes';
import complaintRoutes from './complaint.routes';
import laundryRoutes from './laundry.routes';
import menuRoutes from './menu.routes';
import paymentRoutes from './payment.routes';
import uploadRoutes from './upload.routes';
import contactRoutes from './contact.routes';
import broadcastRoutes from './broadcast.routes';
import reportRoutes from './report.routes';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'StayNest API is running', timestamp: new Date().toISOString() }));

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/registrations', registrationRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/complaints', complaintRoutes);
router.use('/laundry', laundryRoutes);
router.use('/menu', menuRoutes);
router.use('/payments', paymentRoutes);
router.use('/uploads', uploadRoutes);
router.use('/contacts', contactRoutes);
router.use('/broadcast', broadcastRoutes);
router.use('/reports', reportRoutes);

export default router;
