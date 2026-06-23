import mongoose, { Document, Schema } from 'mongoose';

export type PGType = 'boys' | 'girls';
export type ACCType = 'ac' | 'nonac';
export type RoomType = 'single' | 'double' | 'triple' | 'quad';

export interface IRoom extends Document {
  pg: PGType;
  type: RoomType;
  seater: number;
  ac: ACCType;
  name: string;
  rent: number;
  deposit: number;
  totalBeds: number;
  occupiedBeds: number;
  images: string[];
  video: string;
  description: string;
  facilities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    pg: { type: String, enum: ['boys', 'girls'], required: true },
    type: { type: String, enum: ['single', 'double', 'triple', 'quad'], required: true },
    seater: { type: Number, required: true },
    ac: { type: String, enum: ['ac', 'nonac'], required: true },
    name: { type: String, required: true },
    rent: { type: Number, required: true },
    deposit: { type: Number, required: true },
    totalBeds: { type: Number, required: true, default: 6 },
    occupiedBeds: { type: Number, default: 0 },
    images: [{ type: String }],
    video: { type: String, default: '' },
    description: { type: String, required: true },
    facilities: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roomSchema.virtual('availableBeds').get(function () {
  return Math.max(0, this.totalBeds - this.occupiedBeds);
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

export default mongoose.model<IRoom>('Room', roomSchema);
