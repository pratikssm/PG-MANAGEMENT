import mongoose, { Document, Schema } from 'mongoose';

export type LaundryStatus = 'requested' | 'in-progress' | 'delivered';

export interface ILaundryRequest extends Document {
  residentId: mongoose.Types.ObjectId;
  residentName: string;
  items: number;
  status: LaundryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const laundrySchema = new Schema<ILaundryRequest>(
  {
    residentId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    residentName: { type: String, required: true },
    items: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['requested', 'in-progress', 'delivered'], default: 'requested' },
  },
  { timestamps: true }
);

export default mongoose.model<ILaundryRequest>('LaundryRequest', laundrySchema);
