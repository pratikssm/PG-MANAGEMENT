import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Room from '../models/Room';
import Invoice from '../models/Invoice';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { env } from '../config/env';
import { MESS_CHARGES, LAUNDRY_CHARGES, GST_RATE } from '../config/constants';

let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!env.razorpay.keyId || !env.razorpay.keySecret) {
      throw new AppError('Razorpay not configured', 500);
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

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId, name, email, phone, mess, laundry, paymentMethod } = req.body;

  const room = await Room.findById(roomId);
  if (!room) throw new AppError('Room not found', 404);
  if (room.occupiedBeds >= room.totalBeds) throw new AppError('Room is fully occupied', 400);

  const messAmt = mess ? MESS_CHARGES : 0;
  const laundryAmt = laundry ? LAUNDRY_CHARGES : 0;
  const gst = Math.round((room.rent + messAmt + laundryAmt) * GST_RATE);
  const total = room.rent + messAmt + laundryAmt + gst;

  let reg = await Registration.findOne({ email });
  if (!reg) {
    reg = await Registration.create({
      fullName: name, email, mobile: phone, parentName: '', parentMobile: '',
      gender: 'male', dob: '', aadhaar: '', occupation: '', organization: '',
      address: '', city: '', state: '', pincode: '', emergencyContact: '',
      roomPreference: room.name, acPreference: room.ac, mess, laundry,
      joiningDate: new Date().toISOString().slice(0, 10), status: 'approved',
    });
  }

  const order = await getRazorpay().orders.create({
    amount: total * 100,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: { roomId, residentId: reg._id.toString(), roomName: room.name },
  });

  res.status(201).json(ApiResponse.ok('Order created', {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.razorpay.keyId,
    breakdown: { roomRent: room.rent, messCharges: messAmt, laundryCharges: laundryAmt, gst, total },
    residentId: reg._id,
    roomName: room.name,
  }));
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, residentId, roomName, breakdown, paymentMethod } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new AppError('Payment verification failed', 400);
  }

  const invoice = await Invoice.create({
    invoiceNo: genInvoiceNo(),
    residentId,
    residentName: 'Resident',
    roomName,
    roomRent: breakdown.roomRent,
    messCharges: breakdown.messCharges,
    laundryCharges: breakdown.laundryCharges,
    gst: breakdown.gst,
    total: breakdown.total,
    status: 'paid',
    paymentId: razorpay_payment_id,
    paymentMethod: paymentMethod || 'razorpay',
    date: new Date().toISOString().slice(0, 10),
    period: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
  });

  await Room.updateOne({ name: roomName }, { $inc: { occupiedBeds: 1 } });

  res.json(ApiResponse.ok('Payment verified & invoice generated', { invoice, paymentId: razorpay_payment_id }));
});

export const getPaymentKey = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(ApiResponse.ok('Razorpay key', { keyId: env.razorpay.keyId }));
});
