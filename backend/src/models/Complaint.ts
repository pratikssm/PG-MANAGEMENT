import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintCategory = 'food' | 'room' | 'electricity' | 'water' | 'laundry' | 'other';
export type ComplaintStatus = 'open' | 'assigned' | 'resolved';

export interface IComplaint extends Document {
  residentId: mongoose.Types.ObjectId;
  residentName: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    residentId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    residentName: { type: String, required: true },
    category: { type: String, enum: ['food', 'room', 'electricity', 'water', 'laundry', 'other'], required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'assigned', 'resolved'], default: 'open' },
    assignedTo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IComplaint>('Complaint', complaintSchema);
