import { Response } from 'express';
import Registration from '../models/Registration';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, asyncHandler } from '../utils/ApiResponse';
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
      await sendWhatsAppMessage(phone, message);
    }
    return res.json(ApiResponse.ok(`WhatsApp broadcast sent to ${residents.length} residents`));
  }

  if (channel === 'email') {
    const emails = residents.map((r) => r.email).filter(Boolean);
    await sendBroadcastEmail(emails, subject || 'StayNest Announcement', message);
    return res.json(ApiResponse.ok(`Email broadcast sent to ${emails.length} residents`));
  }

  if (channel === 'sms') {
    for (const r of residents) {
      const phone = r.mobile.replace(/\D/g, '');
      await sendSMS(phone, message);
    }
    return res.json(ApiResponse.ok(`SMS broadcast sent to ${residents.length} residents`));
  }

  res.status(400).json(ApiResponse.fail('Invalid channel'));
});
