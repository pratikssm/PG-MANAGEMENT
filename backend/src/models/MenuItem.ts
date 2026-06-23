import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    day: { type: String, required: true, unique: true },
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
