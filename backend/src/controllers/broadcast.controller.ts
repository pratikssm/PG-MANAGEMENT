import { Response } from 'express';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { sendBroadcastEmail } from '../utils/email';
import { sendSMS } from '../utils/sms';
import { env } from '../config/env';

export const sendBroadcast = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { channel, subject, message } = req.body;

  const residents = await Registration.find({ status: 'approved' }).lean();

  if (channel === 'whatsapp') {
    for (const r of residents) {
      const phone = r.mobile.replace(/\D/g, '');
      if (!await sendWhatsAppMessage(phone, message)) {
        throw new AppError(`WhatsApp broadcast stopped after a delivery failure. Successfully sent to ${residents.indexOf(r)} residents.`, 502);
      }
    }
    return res.json(ApiResponse.ok(`WhatsApp broadcast sent to ${residents.length} residents`));
  }

  if (channel === 'email') {
    const emails = residents.map((r) => r.email).filter(Boolean);
    if (!await sendBroadcastEmail(emails, subject || 'StayNest Announcement', message)) {
      throw new AppError('Email broadcast could not be delivered to all residents. Check SMTP configuration and server logs.', 502);
    }
    return res.json(ApiResponse.ok(`Email broadcast sent to ${emails.length} residents`));
  }

  if (channel === 'sms') {
    for (const r of residents) {
      const phone = r.mobile.replace(/\D/g, '');
      if (!await sendSMS(phone, message)) {
        throw new AppError(`SMS broadcast stopped after a delivery failure. Successfully sent to ${residents.indexOf(r)} residents.`, 502);
      }
    }
    return res.json(ApiResponse.ok(`SMS broadcast sent to ${residents.length} residents`));
  }

  res.status(400).json(ApiResponse.fail('Invalid channel'));
});
