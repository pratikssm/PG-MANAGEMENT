import { Response } from 'express';
import Contact from '../models/Contact';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, asyncHandler } from '../utils/ApiResponse';
import { sendEmail } from '../utils/email';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { env } from '../config/env';

export const createContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contact = await Contact.create(req.body);

  const emailHtml = `<h2>New Contact Form Submission</h2><p><b>Name:</b> ${contact.name}</p><p><b>Email:</b> ${contact.email}</p><p><b>Phone:</b> ${contact.phone}</p><p><b>Subject:</b> ${contact.subject}</p><p><b>Message:</b> ${contact.message}</p>`;
  sendEmail(env.smtp.from, `Contact: ${contact.subject}`, emailHtml).catch(() => {});

  sendWhatsAppMessage(env.whatsapp.ownerNumber, `*New Contact Enquiry*\nName: ${contact.name}\nPhone: ${contact.phone}\nSubject: ${contact.subject}`).catch(() => {});

  res.status(201).json(ApiResponse.ok('Message sent successfully', { contact }));
});

export const getContacts = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(ApiResponse.ok('Contacts fetched', { count: contacts.length, contacts }));
});

export const resolveContact = asyncHandler(async (req: AuthRequest, res: Response) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { isResolved: true }, { new: true });
  res.json(ApiResponse.ok('Contact marked resolved', { contact }));
});
