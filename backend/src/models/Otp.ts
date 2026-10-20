import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  codeHash: string;
  salt: string;
  expiresAt: Date;
  attempts: number;
  verifiedAt?: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date },
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtp>('Otp', otpSchema);
