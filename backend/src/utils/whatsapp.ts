import axios from 'axios';
import { env } from '../config/env';

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!env.whatsapp.phoneNumberId || !env.whatsapp.accessToken) {
    console.warn('[WhatsApp] Not configured. Message would go to:', to, message);
    return false;
  }

  try {
    const url = `${env.whatsapp.apiUrl}/${env.whatsapp.phoneNumberId}/messages`;
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
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
    console.log(`[WhatsApp] Message sent to ${to}`);
    return true;
  } catch (error: any) {
    console.error('[WhatsApp] Error:', error.response?.data || error.message);
    return false;
  }
}

export function buildRegistrationLeadMessage(data: Record<string, any>): string {
  return `*New Registration Lead*

*Name:* ${data.fullName}
*Parent:* ${data.parentName} (${data.parentMobile})
*Mobile:* ${data.mobile}
*Email:* ${data.email}
*Gender:* ${data.gender}
*Aadhaar:* ${data.aadhaar}
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
