import mongoose from 'mongoose';
import { env } from './env';
import Otp from '../models/Otp';

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    const legacyOtps = await Otp.deleteMany({ code: { $exists: true } });
    if (legacyOtps.deletedCount > 0) {
      console.warn(`Removed ${legacyOtps.deletedCount} legacy plaintext OTP record(s).`);
    }
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown MongoDB connection error';
    console.error(`❌ MongoDB connection error: ${message}`);
    if (message.includes('ENOTFOUND _mongodb._tcp.') && env.mongoUri.startsWith('mongodb+srv://')) {
      console.error('Check MONGO_URI: the Atlas cluster hostname is invalid or cannot be resolved. Copy the connection string from Atlas > Connect > Drivers and replace only its username, password, and database name.');
    }
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err}`);
});
