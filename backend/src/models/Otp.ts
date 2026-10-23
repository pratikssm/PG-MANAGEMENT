import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  purpose: 'signup' | 'password_reset';
  codeHash: string;
  salt: string;
  resetTokenHash?: string;
  expiresAt: Date;
  attempts: number;
  verifiedAt?: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: { type: String, enum: ['signup', 'password_reset'], default: 'signup', required: true },
    codeHash: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false },
    resetTokenHash: { type: String, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date },
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtp>('Otp', otpSchema);
