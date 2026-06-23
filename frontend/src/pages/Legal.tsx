import { motion } from 'framer-motion'
import { Shield, FileText, RefreshCw } from 'lucide-react'

const content: Record<string, { title: string; icon: any; updated: string; sections: { h: string; p: string }[] }> = {
  privacy: {
    title: 'Privacy Policy', icon: Shield, updated: 'December 2024',
    sections: [
      { h: '1. Information We Collect', p: 'We collect personal information including your name, contact details, Aadhaar number, profile photo, and emergency contact information when you register for our services. We also collect payment information processed securely through Razorpay.' },
      { h: '2. How We Use Your Information', p: 'Your information is used to process registrations, manage room allotments, generate invoices, send notifications via WhatsApp, email and SMS, and provide resident support. We do not sell your data to third parties.' },
      { h: '3. Data Security', p: 'We implement industry-standard security measures including JWT authentication, HTTPS encryption, input validation, XSS protection, and secure cookies. Your Aadhaar and payment data are encrypted and stored securely.' },
      { h: '4. Data Retention', p: 'We retain your personal data for the duration of your stay and up to 7 years thereafter for legal and tax compliance. You may request data deletion subject to regulatory requirements.' },
      { h: '5. Your Rights', p: 'You have the right to access, correct, or delete your personal information. Contact us at privacy@staynest.in for any data-related requests.' },
    ],
  },
  terms: {
    title: 'Terms of Service', icon: FileText, updated: 'December 2024',
    sections: [
      { h: '1. Acceptance of Terms', p: 'By registering and residing at StayNest, you agree to abide by these terms and our community guidelines. Violation may result in termination of residency.' },
      { h: '2. Rent & Payment', p: 'Rent is due monthly in advance. Late payments incur a penalty of Rs. 50/day. Mess charges are billed separately. All payments are processed via Razorpay, UPI, net banking, or cards.' },
      { h: '3. Security Deposit', p: 'A refundable security deposit equal to two months rent is required. It is refunded within 15 days of checkout, less any pending dues or damage charges.' },
      { h: '4. House Rules', p: 'Residents must maintain decorum, adhere to visiting hours (9 AM - 9 PM), refrain from smoking and alcohol on premises, and cooperate with housekeeping and security protocols.' },
      { h: '5. Termination', p: 'Either party may terminate residency with 30 days notice. StayNest reserves the right to terminate immediately for serious misconduct or violation of terms.' },
    ],
  },
  refund: {
    title: 'Refund Policy', icon: RefreshCw, updated: 'December 2024',
    sections: [
      { h: '1. Security Deposit Refund', p: 'The security deposit is fully refundable upon checkout, subject to deductions for pending rent, mess charges, laundry charges, or damages beyond normal wear and tear.' },
      { h: '2. Rent Refund', p: 'If you vacate mid-month, rent is refunded on a pro-rata basis for the remaining days, provided a 30-day notice was given. No refund is issued for short notice vacating.' },
      { h: '3. Mess Charges Refund', p: 'Mess charges are refunded on pro-rata basis for unused days when you provide 7 days notice of diet plan cancellation or checkout.' },
      { h: '4. Processing Time', p: 'All refunds are processed within 15 working days of checkout and credited to the original payment method or bank account provided by the resident.' },
      { h: '5. Disputes', p: 'Any refund disputes will be resolved within 30 days. For escalation, contact our grievance officer at grievances@staynest.in.' },
    ],
  },
}

export default function Legal({ type }: { type: 'privacy' | 'terms' | 'refund' }) {
  const c = content[type]
  return (
    <div className="pt-16 min-h-screen">
      <section className="bg-gradient-to-br from-indigo-950 to-violet-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur text-white flex items-center justify-center mx-auto mb-4"><c.icon className="w-8 h-8" /></div>
            <h1 className="text-4xl font-bold text-white tracking-tight">{c.title}</h1>
            <p className="mt-2 text-indigo-200">Last updated: {c.updated}</p>
          </motion.div>
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {c.sections.map((s) => (
            <div key={s.h}><h2 className="text-xl font-bold text-slate-900">{s.h}</h2><p className="mt-2 text-slate-600 leading-relaxed">{s.p}</p></div>
          ))}
        </div>
      </section>
    </div>
  )
}
