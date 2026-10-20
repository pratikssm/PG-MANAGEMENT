import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentOrder extends Document {
  orderId: string;
  userId: mongoose.Types.ObjectId;
  residentId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  roomName: string;
  residentName: string;
  paymentMethod?: string;
  amount: number;
  breakdown: {
    roomRent: number;
    messCharges: number;
    laundryCharges: number;
    gst: number;
    total: number;
  };
  status: 'created' | 'processing' | 'paid' | 'refund_pending' | 'refunded' | 'refund_failed';
  paymentId?: string;
  refundId?: string;
  refundStatus?: 'pending' | 'processed' | 'failed';
  invoiceId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentOrderSchema = new Schema<IPaymentOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    roomName: { type: String, required: true },
    residentName: { type: String, required: true },
    paymentMethod: { type: String },
    amount: { type: Number, required: true },
    breakdown: {
      roomRent: { type: Number, required: true },
      messCharges: { type: Number, required: true },
      laundryCharges: { type: Number, required: true },
      gst: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    status: { type: String, enum: ['created', 'processing', 'paid', 'refund_pending', 'refunded', 'refund_failed'], default: 'created' },
    paymentId: { type: String },
    refundId: { type: String },
    refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentOrder>('PaymentOrder', paymentOrderSchema);
