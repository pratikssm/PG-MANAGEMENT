import { Response } from 'express';
import Invoice from '../models/Invoice';
import Room from '../models/Room';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { generateInvoicePdf } from '../utils/pdf';
import { MESS_CHARGES } from '../config/constants';

function genInvoiceNo(): string {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SN-${ts}${rand}`;
}

export const getInvoices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const filter: any = {};
  if (req.user!.role === 'resident') {
    filter.residentId = req.user!.id;
  }
  const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
  res.json(ApiResponse.ok('Invoices fetched', { count: invoices.length, invoices }));
});

export const getInvoiceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new AppError('Invoice not found', 404);
  if (req.user!.role === 'resident' && invoice.residentId.toString() !== req.user!.id) {
    throw new AppError('Not authorized to view this invoice', 403);
  }
  res.json(ApiResponse.ok('Invoice fetched', { invoice }));
});

export const createInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { residentId, roomRent, messCharges, laundryCharges, period } = req.body;

  const reg = await Registration.findById(residentId);
  if (!reg) throw new AppError('Resident not found', 404);

  const gst = Math.round((roomRent + messCharges + laundryCharges) * 0.18);
  const total = roomRent + messCharges + laundryCharges + gst;

  const invoice = await Invoice.create({
    invoiceNo: genInvoiceNo(),
    residentId: reg._id,
    residentName: reg.fullName,
    roomName: reg.roomPreference,
    roomRent,
    messCharges,
    laundryCharges,
    gst,
    total,
    status: 'pending',
    date: new Date().toISOString().slice(0, 10),
    period: period || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
  });

  res.status(201).json(ApiResponse.ok('Invoice created', { invoice }));
});

export const downloadInvoicePdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new AppError('Invoice not found', 404);

  const pdfBuffer = await generateInvoicePdf({
    invoiceNo: invoice.invoiceNo,
    residentName: invoice.residentName,
    roomName: invoice.roomName,
    period: invoice.period,
    date: invoice.date,
    roomRent: invoice.roomRent,
    messCharges: invoice.messCharges,
    laundryCharges: invoice.laundryCharges,
    gst: invoice.gst,
    total: invoice.total,
    status: invoice.status,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNo}.pdf`);
  res.send(pdfBuffer);
});

export const markAsPaid = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { paymentId, paymentMethod } = req.body;
  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { status: 'paid', paymentId, paymentMethod },
    { new: true }
  );
  if (!invoice) throw new AppError('Invoice not found', 404);
  res.json(ApiResponse.ok('Invoice marked as paid', { invoice }));
});

export const exportInvoicesCsv = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const invoices = await Invoice.find().sort({ createdAt: -1 }).lean();
  const headers = ['Invoice No', 'Resident', 'Room', 'Rent', 'Mess', 'Laundry', 'GST', 'Total', 'Status', 'Date'];
  const rows = invoices.map((i) => [i.invoiceNo, i.residentName, i.roomName, i.roomRent, i.messCharges, i.laundryCharges, i.gst, i.total, i.status, i.date]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
  res.send(csv);
});
