
import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import { Resend } from 'resend';
import axios from 'axios';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;
let resendClient: Resend | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }

  return transporter;
}

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.resend.apiKey);
  }

  return resendClient;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (env.brevo.apiKey) {
    if (!env.brevo.senderEmail) {
      console.error('[Email] BREVO_SENDER_EMAIL is required when Brevo is configured.');
      return false;
    }

    try {
      const response = await axios.post<{ messageId?: string }>(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: env.brevo.senderName, email: env.brevo.senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            accept: 'application/json',
            'api-key': env.brevo.apiKey,
            'content-type': 'application/json',
          },
          timeout: 15000,
        },
      );

      console.log('[Email] Brevo accepted message:', response.data.messageId ?? 'accepted');
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('[Email] Brevo send failed:', error.response?.data || error.message);
      } else {
        console.error('[Email] Brevo send failed:', error instanceof Error ? error.message : 'Unknown error');
      }
      return false;
    }
  }

  // Prefer Resend when its API key is configured.
  if (env.resend.apiKey) {
    try {
      const { data, error } = await getResendClient().emails.send({
        from: `StayNest <${env.resend.from}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('[Email] Resend failed:', error.message);
        return false;
      }

      console.log('[Email] Sent using Resend:', data?.id ?? 'accepted');
      return true;
    } catch (error: unknown) {
      console.error(
        '[Email] Resend error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  // Fall back to SMTP only when Resend is not configured.
  if (!env.smtp.user || !env.smtp.pass) {
    console.error('[Email] Neither Resend nor SMTP is configured.');
    return false;
  }

  try {
    const info = await getTransporter().sendMail({
      from: `StayNest <${env.smtp.from}>`,
      to,
      subject,
      html,
    });

    console.log('[Email] Message accepted by SMTP:', info.messageId);
    return true;
  } catch (error: unknown) {
    console.error(
      '[Email] SMTP failed:',
      error instanceof Error ? error.message : 'Unknown SMTP error'
    );
    return false;
  }
}

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export async function sendOtpEmail(
  to: string,
  otp: string
): Promise<boolean> {
  return sendCodeEmail(to, otp, 'StayNest Email Verification', 'email verification');
}

export async function sendPasswordResetOtpEmail(
  to: string,
  otp: string
): Promise<boolean> {
  return sendCodeEmail(to, otp, 'StayNest Password Reset', 'password reset');
}

async function sendCodeEmail(to: string, otp: string, subject: string, purpose: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">${subject}</h2>
      <p>Your One-Time Password (OTP) for ${purpose} is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; text-align: center; padding: 20px; background: #f5f3ff; border-radius: 12px; margin: 20px 0;">${otp}</div>
      <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
      <p style="color: #64748b; font-size: 13px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail(to, `StayNest - ${subject.replace('StayNest ', '')} OTP`, html);
}

export async function sendBroadcastEmail(
  recipients: string[],
  subject: string,
  body: string
): Promise<boolean> {
  const safeBody = body
    .replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]!)
    .replace(/\r?\n/g, '<br>');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">StayNest Announcement</h2>
      <div style="padding: 16px; background: #f8fafc; border-radius: 12px;">${safeBody}</div>
      <p style="color: #64748b; font-size: 13px; margin-top: 20px;">StayNest Premium PG Management System</p>
    </div>
  `;

  let allSent = true;

  for (const email of recipients) {
    const sent = await sendEmail(email, subject, html);
    if (!sent) allSent = false;
  }

  return allSent;
}
