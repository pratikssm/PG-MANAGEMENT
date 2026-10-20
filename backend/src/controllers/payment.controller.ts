import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Room from '../models/Room';
import Invoice from '../models/Invoice';
import Registration from '../models/Registration';
import PaymentOrder from '../models/PaymentOrder';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { env } from '../config/env';
import { MESS_CHARGES, LAUNDRY_CHARGES, GST_RATE } from '../config/constants';

let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!env.razorpay.keyId || !env.razorpay.keySecret) {
      throw new AppError('Razorpay is not configured. Add the test or live API keys to backend/.env.', 503);
    }
    razorpayInstance = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    });
  }
  return razorpayInstance;
}

function genInvoiceNo(): string {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SN-${ts}${rand}`;
}

async function getResidentForUser(userId: string) {
  return Registration.findOne({ userId });
}

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId, mess, laundry } = req.body;
  const [room, resident] = await Promise.all([
    Room.findOne({ _id: roomId, isActive: true }),
    getResidentForUser(req.user!.id),
  ]);

  if (!room) throw new AppError('Room not found', 404);
  if (room.occupiedBeds >= room.totalBeds) throw new AppError('Room is fully occupied', 409);
  if (!resident) throw new AppError('Complete your resident registration before booking.', 400);

  const messCharges = mess ? MESS_CHARGES : 0;
  const laundryCharges = laundry ? LAUNDRY_CHARGES : 0;
  const gst = Math.round((room.rent + messCharges + laundryCharges) * GST_RATE);
  const total = room.rent + messCharges + laundryCharges + gst;

  const razorpayOrder = await getRazorpay().orders.create({
    amount: total * 100,
    currency: 'INR',
    receipt: `sn_${Date.now()}`,
    notes: { roomId: room.id, residentId: resident.id },
  });

  await PaymentOrder.create({
    orderId: razorpayOrder.id,
    userId: req.user!.id,
    residentId: resident._id,
    roomId: room._id,
    roomName: room.name,
    residentName: resident.fullName,
    amount: total * 100,
    breakdown: {
      roomRent: room.rent,
      messCharges,
      laundryCharges,
      gst,
      total,
    },
  });

  res.status(201).json(ApiResponse.ok('Order created', {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: env.razorpay.keyId,
  }));
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const paymentOrder = await PaymentOrder.findOne({ orderId: razorpay_order_id });
  if (!paymentOrder) throw new AppError('Payment order not found. Start the booking again.', 404);
  if (paymentOrder.userId.toString() !== req.user!.id) {
    throw new AppError('This payment order belongs to another account.', 403);
  }

  if (paymentOrder.status === 'paid' && paymentOrder.invoiceId) {
    const existingInvoice = await Invoice.findById(paymentOrder.invoiceId);
    if (existingInvoice) {
      return res.json(ApiResponse.ok('Payment already verified', { invoice: existingInvoice }));
    }
  }
  if (
    paymentOrder.status === 'refund_pending' ||
    paymentOrder.status === 'refunded' ||
    paymentOrder.status === 'refund_failed'
  ) {
    throw new AppError('A refund has already been initiated for this payment. Contact StayNest support if it is not reflected.', 409);
  }

  if (!env.razorpay.keySecret) {
    throw new AppError('Razorpay is not configured. Add the test or live API keys to backend/.env.', 503);
  }
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest();
  const submittedSignature = Buffer.from(razorpay_signature, 'hex');
  if (
    submittedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(expectedSignature, submittedSignature)
  ) {
    throw new AppError('Payment verification failed', 400);
  }

  const payment = await getRazorpay().payments.fetch(razorpay_payment_id);
  if (
    payment.order_id !== razorpay_order_id ||
    payment.amount !== paymentOrder.amount ||
    payment.currency !== 'INR' ||
    payment.status !== 'captured'
  ) {
    throw new AppError('Payment has not been captured for this order.', 400);
  }

  const existingInvoice = await Invoice.findOne({ paymentId: razorpay_payment_id });
  if (existingInvoice) {
    await PaymentOrder.updateOne(
      { _id: paymentOrder._id },
      { status: 'paid', paymentId: razorpay_payment_id, invoiceId: existingInvoice._id },
    );
    return res.json(ApiResponse.ok('Payment already verified', { invoice: existingInvoice }));
  }

  const lockedOrder = await PaymentOrder.findOneAndUpdate(
    { _id: paymentOrder._id, status: 'created' },
    { status: 'processing', paymentId: razorpay_payment_id },
    { new: true },
  );
  if (!lockedOrder) {
    const latest = await PaymentOrder.findById(paymentOrder._id);
    if (latest?.status === 'paid' && latest.invoiceId) {
      const invoice = await Invoice.findById(latest.invoiceId);
      if (invoice) return res.json(ApiResponse.ok('Payment already verified', { invoice }));
    }
    throw new AppError('This payment is already being verified. Refresh your dashboard shortly.', 409);
  }

  const occupiedRoom = await Room.findOneAndUpdate(
    { _id: lockedOrder.roomId, isActive: true, $expr: { $lt: ['$occupiedBeds', '$totalBeds'] } },
    { $inc: { occupiedBeds: 1 } },
    { new: true },
  );
  if (!occupiedRoom) {
    let refundId: string;
    let refundStatus: 'pending' | 'processed' | 'failed';
    try {
      const refund = await getRazorpay().payments.refund(razorpay_payment_id, {
        amount: paymentOrder.amount,
        receipt: `refund_${paymentOrder.orderId}`,
      });
      refundId = refund.id;
      refundStatus = refund.status;
    } catch (error) {
      await PaymentOrder.updateOne(
        { _id: lockedOrder._id, status: 'processing' },
        { status: 'created', $unset: { paymentId: 1 } },
      );
      throw new AppError(
        `No beds were available and the refund could not be initiated. Contact StayNest support with payment ID ${razorpay_payment_id}.`,
        502,
      );
    }
    await PaymentOrder.updateOne(
      { _id: lockedOrder._id, status: 'processing' },
      {
        status: refundStatus === 'processed' ? 'refunded' : refundStatus === 'pending' ? 'refund_pending' : 'refund_failed',
        refundId,
        refundStatus,
      },
    );
    throw new AppError(
      refundStatus === 'failed'
        ? `No beds were available and the refund was declined. Contact StayNest support with payment ID ${razorpay_payment_id}.`
        : `No beds were available. Your refund is ${refundStatus}.`,
      409,
    );
  }

  try {
    const invoice = await Invoice.create({
      invoiceNo: genInvoiceNo(),
      residentId: lockedOrder.residentId,
      residentName: lockedOrder.residentName,
      roomName: lockedOrder.roomName,
      ...lockedOrder.breakdown,
      status: 'paid',
      paymentId: razorpay_payment_id,
      paymentMethod: payment.method,
      date: new Date().toISOString().slice(0, 10),
      period: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    });
    await PaymentOrder.updateOne(
      { _id: lockedOrder._id, status: 'processing' },
      { status: 'paid', invoiceId: invoice._id },
    );
    res.json(ApiResponse.ok('Payment verified & invoice generated', { invoice, paymentId: razorpay_payment_id }));
  } catch (error) {
    await Room.updateOne({ _id: occupiedRoom._id, occupiedBeds: { $gt: 0 } }, { $inc: { occupiedBeds: -1 } });
    await PaymentOrder.updateOne(
      { _id: lockedOrder._id, status: 'processing' },
      { status: 'created', $unset: { paymentId: 1 } },
    );
    throw error;
  }
});

export const getPaymentKey = asyncHandler(async (_req: AuthRequest, res: Response) => {
  if (!env.razorpay.keyId) throw new AppError('Razorpay is not configured.', 503);
  res.json(ApiResponse.ok('Razorpay key', { keyId: env.razorpay.keyId }));
});
