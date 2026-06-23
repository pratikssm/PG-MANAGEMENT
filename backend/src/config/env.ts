import dotenv from 'dotenv';
dotenv.config();

function required(key: string, fallback?: string): string {
  const val = process.env[key] || fallback;
  if (!val) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return val;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProd: process.env.NODE_ENV === 'production',

  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/staynest'),

  jwtSecret: required('JWT_SECRET', 'dev_secret_change_me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieExpiresIn: Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },

  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: process.env.WHATSAPP_TOKEN || 'staynest_verify',
    ownerNumber: process.env.OWNER_WHATSAPP || '919876543210',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.FROM_EMAIL || 'noreply@staynest.in',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phone: process.env.TWILIO_PHONE || '',
  },

  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
};
