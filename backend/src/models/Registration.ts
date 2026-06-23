import mongoose, { Document, Schema } from 'mongoose';

export type RegStatus = 'pending' | 'approved' | 'rejected';

export interface IRegistration extends Document {
  userId?: mongoose.Types.ObjectId;
  fullName: string;
  parentName: string;
  parentMobile: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  gender: 'male' | 'female';
  dob: string;
  aadhaar: string;
  occupation: string;
  organization: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContact: string;
  roomPreference: string;
  acPreference: 'ac' | 'nonac';
  mess: boolean;
  laundry: boolean;
  joiningDate: string;
  status: RegStatus;
  profilePhoto?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true },
    parentName: { type: String, required: true },
    parentMobile: { type: String, required: true },
    mobile: { type: String, required: true },
    alternateMobile: { type: String, default: '' },
    email: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    dob: { type: String, required: true },
    aadhaar: { type: String, required: true },
    occupation: { type: String, required: true },
    organization: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    roomPreference: { type: String, required: true },
    acPreference: { type: String, enum: ['ac', 'nonac'], default: 'ac' },
    mess: { type: Boolean, default: true },
    laundry: { type: Boolean, default: true },
    joiningDate: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    profilePhoto: { type: String },
    aadhaarFront: { type: String },
    aadhaarBack: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IRegistration>('Registration', registrationSchema);
