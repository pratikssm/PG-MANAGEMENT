import { Router } from 'express';
import { getInvoices, getInvoiceById, createInvoice, downloadInvoicePdf, markAsPaid, exportInvoicesCsv } from '../controllers/invoice.controller';
import { protect, authorize, requireApprovedResident } from '../middleware/auth';

const router = Router();

router.get('/', protect, requireApprovedResident, getInvoices);
router.get('/export/csv', protect, authorize('admin'), exportInvoicesCsv);
router.get('/:id', protect, requireApprovedResident, getInvoiceById);
router.get('/:id/pdf', protect, requireApprovedResident, downloadInvoicePdf);
router.post('/', protect, authorize('admin'), createInvoice);
router.patch('/:id/pay', protect, authorize('admin'), markAsPaid);

export default router;
