import axios from 'axios';
import { env } from '../config/env';

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!env.whatsapp.phoneNumberId || !env.whatsapp.accessToken) {
    console.warn('[WhatsApp] Not configured. Message was not sent.');
    return false;
  }

  const recipient = to.replace(/\D/g, '');
  if (recipient.length < 8 || recipient.length > 15) {
    console.error('[WhatsApp] Recipient number must include its country code.');
    return false;
  }

  try {
    const url = `${env.whatsapp.apiUrl}/${env.whatsapp.phoneNumberId}/messages`;
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${env.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('[WhatsApp] Message accepted by WhatsApp for delivery.');
    return true;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('[WhatsApp] Send failed:', error.response?.data || error.message);
    } else {
      console.error('[WhatsApp] Send failed:', error);
    }
    return false;
  }
}

export function buildRegistrationLeadMessage(data: Record<string, any>): string {
  const aadhaar = String(data.aadhaar || '').replace(/\D/g, '');
  const maskedAadhaar = aadhaar.length >= 4 ? `${'*'.repeat(aadhaar.length - 4)}${aadhaar.slice(-4)}` : 'Provided';
  return `*New Registration Lead*

*Name:* ${data.fullName}
*Parent:* ${data.parentName} (${data.parentMobile})
*Mobile:* ${data.mobile}
*Email:* ${data.email}
*Gender:* ${data.gender}
*Aadhaar:* ${maskedAadhaar}
*Occupation:* ${data.occupation} - ${data.organization}
*Room Pref:* ${data.roomPreference} ${data.acPreference?.toUpperCase()}
*Mess:* ${data.mess ? 'Yes' : 'No'}
*Laundry:* ${data.laundry ? 'Yes' : 'No'}
*Joining:* ${data.joiningDate}
*Address:* ${data.address}, ${data.city}, ${data.state} ${data.pincode}
*Emergency:* ${data.emergencyContact}`;
}

export async function sendRegistrationToOwner(data: Record<string, any>): Promise<boolean> {
  const message = buildRegistrationLeadMessage(data);
  return sendWhatsAppMessage(env.whatsapp.ownerNumber, message);
}
