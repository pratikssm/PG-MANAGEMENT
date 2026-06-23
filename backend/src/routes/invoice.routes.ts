import { Router } from 'express';
import { getInvoices, getInvoiceById, createInvoice, downloadInvoicePdf, markAsPaid, exportInvoicesCsv } from '../controllers/invoice.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, getInvoices);
router.get('/export/csv', protect, authorize('admin'), exportInvoicesCsv);
router.get('/:id', protect, getInvoiceById);
router.get('/:id/pdf', protect, downloadInvoicePdf);
router.post('/', protect, authorize('admin'), createInvoice);
router.patch('/:id/pay', protect, markAsPaid);

export default router;
