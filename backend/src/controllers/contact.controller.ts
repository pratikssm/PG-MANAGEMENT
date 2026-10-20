import { Response } from 'express';
import Contact from '../models/Contact';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AppError, asyncHandler } from '../utils/ApiResponse';
import { sendEmail } from '../utils/email';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { env } from '../config/env';

export const createContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contact = await Contact.create(req.body);

  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
  const emailHtml = `<h2>New Contact Form Submission</h2><p><b>Name:</b> ${escapeHtml(contact.name)}</p><p><b>Email:</b> ${escapeHtml(contact.email)}</p><p><b>Phone:</b> ${escapeHtml(contact.phone)}</p><p><b>Subject:</b> ${escapeHtml(contact.subject)}</p><p><b>Message:</b><br>${escapeHtml(contact.message).replace(/\r?\n/g, '<br>')}</p>`;
  void sendEmail(env.smtp.from, `Contact: ${contact.subject}`, emailHtml).catch((error) => console.error('Contact notification email failed:', error));

  const whatsappSent = await sendWhatsAppMessage(
    env.whatsapp.ownerNumber,
    `*New Contact Enquiry*\nName: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nSubject: ${contact.subject}\nMessage: ${contact.message}`,
  );

  res.status(201).json(ApiResponse.ok('Contact request saved successfully', { contact, whatsappSent }));
});

export const getContacts = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(ApiResponse.ok('Contacts fetched', { count: contacts.length, contacts }));
});

export const resolveContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { isResolved: true }, { new: true });
  if (!contact) throw new AppError('Contact not found', 404);
  res.json(ApiResponse.ok('Contact marked resolved', { contact }));
});
