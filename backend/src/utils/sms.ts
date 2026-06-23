import { env } from '../config/env';

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!env.twilio.accountSid || !env.twilio.authToken) {
    console.warn('[SMS] Twilio not configured. Would send to:', to, message);
    return false;
  }

  try {
    const auth = Buffer.from(`${env.twilio.accountSid}:${env.twilio.authToken}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: env.twilio.phone,
        To: to,
        Body: message,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[SMS] Error:', err);
      return false;
    }
    console.log(`[SMS] Sent to ${to}`);
    return true;
  } catch (error: any) {
    console.error('[SMS] Error:', error.message);
    return false;
  }
}
