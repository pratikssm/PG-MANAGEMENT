import mongoose, { Document, Schema } from 'mongoose';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface IInvoice extends Document {
  invoiceNo: string;
  residentId: mongoose.Types.ObjectId;
  residentName: string;
  roomName: string;
  roomRent: number;
  messCharges: number;
  laundryCharges: number;
  gst: number;
  total: number;
  status: InvoiceStatus;
  paymentId?: string;
  paymentMethod?: string;
  date: string;
  period: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNo: { type: String, required: true, unique: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    residentName: { type: String, required: true },
    roomName: { type: String, required: true },
    roomRent: { type: Number, required: true },
    messCharges: { type: Number, default: 0 },
    laundryCharges: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    paymentId: { type: String },
    paymentMethod: { type: String },
    date: { type: String, required: true },
    period: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);
