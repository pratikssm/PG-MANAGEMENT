import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'resident';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  googleId?: string;
  isEmailVerified: boolean;
  registrationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'resident'], default: 'resident' },
    avatar: { type: String },
    googleId: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
