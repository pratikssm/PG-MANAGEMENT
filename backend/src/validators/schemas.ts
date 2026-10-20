import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  parentName: z.string().min(2, 'Parent name is required'),
  parentMobile: z.string().min(10, 'Valid parent mobile required'),
  mobile: z.string().min(10, 'Valid mobile required'),
  alternateMobile: z.string().optional().default(''),
  email: z.string().email('Valid email required'),
  gender: z.enum(['male', 'female']),
  dob: z.string().min(1, 'Date of birth required'),
  aadhaar: z.string().min(12, 'Valid Aadhaar required'),
  occupation: z.string().min(1, 'Occupation required'),
  organization: z.string().min(1, 'Organization required'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  emergencyContact: z.string().min(10, 'Emergency contact required'),
  roomPreference: z.string().min(1, 'Room preference required'),
  acPreference: z.enum(['ac', 'nonac']).default('ac'),
  mess: z.boolean().default(true),
  laundry: z.boolean().default(true),
  joiningDate: z.string().min(1, 'Joining date required'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email required').transform((value) => value.toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['resident', 'admin']).optional(),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').transform((value) => value.toLowerCase()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/\d/, 'Password must include a number'),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const otpRequestSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').transform((value) => value.toLowerCase()),
});

export const otpVerifySchema = z.object({
  email: z.string().trim().email('Valid email required').transform((value) => value.toLowerCase()),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const residentRegistrationSchema = z.object({
  ...registerSchema.omit({ email: true }).shape,
});

export const roomSchema = z.object({
  pg: z.enum(['boys', 'girls']),
  type: z.enum(['single', 'double', 'triple', 'quad']),
  seater: z.number().min(1).max(4),
  ac: z.enum(['ac', 'nonac']),
  name: z.string().min(1),
  rent: z.number().min(0),
  deposit: z.number().min(0),
  totalBeds: z.number().min(1),
  occupiedBeds: z.number().min(0).default(0),
  images: z.array(z.string()).default([]),
  video: z.string().default(''),
  description: z.string().min(1),
  facilities: z.array(z.string()).default([]),
});

export const roomPricingSchema = z.object({
  rent: z.number().min(0),
  deposit: z.number().min(0),
});

export const roomOccupancySchema = z.object({
  occupiedBeds: z.number().int().min(0),
});

export const complaintSchema = z.object({
  category: z.enum(['food', 'room', 'electricity', 'water', 'laundry', 'other']),
  subject: z.string().min(2, 'Subject required'),
  description: z.string().min(5, 'Description required'),
});

export const complaintAssignmentSchema = z.object({
  assignedTo: z.string().min(1, 'Assignee required').max(100),
});

export const laundrySchema = z.object({
  items: z.number().min(1, 'At least 1 item required'),
});

export const laundryStatusSchema = z.object({
  status: z.enum(['requested', 'in-progress', 'delivered']),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  subject: z.string().min(2),
  message: z.string().min(5),
});

export const broadcastSchema = z.object({
  channel: z.enum(['whatsapp', 'email', 'sms']),
  subject: z.string().optional(),
  message: z.string().min(2, 'Message required'),
});

export const bookingSchema = z.object({
  roomId: z.string().min(1, 'Room ID required'),
  mess: z.boolean().default(true),
  laundry: z.boolean().default(true),
});

export const paymentVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i, 'Invalid payment signature'),
});
