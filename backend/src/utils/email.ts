import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

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

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!env.smtp.user || !env.smtp.pass) {
    console.warn('[Email] SMTP not configured. Would send to:', to, subject);
    return false;
  }

  try {
    const info = await getTransporter().sendMail({
      from: `StayNest <${env.smtp.from}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('[Email] Error:', error.message);
    return false;
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
 const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">StayNest Email Verification</h2>
      <p>Your One-Time Password (OTP) for email verification is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; text-align: center; padding: 20px; background: #f5f3ff; border-radius: 12px; margin: 20px 0;">${otp}</div>
      <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      <p style="color: #64748b; font-size: 13px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail(to, 'StayNest - Your OTP Code', html);
}

export async function sendBroadcastEmail(recipients: string[], subject: string, body: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">StayNest Announcement</h2>
      <div style="padding: 16px; background: #f8fafc; border-radius: 12px;">${body}</div>
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
