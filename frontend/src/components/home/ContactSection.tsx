import { PG_INFO } from '../../lib/data'
import { Phone, Mail, MapPin, MessageCircle, Navigation } from 'lucide-react'
import { SectionHeading, Button, Input, Textarea } from '../ui'
import { useState } from 'react'

export default function ContactSection() {
  const [sent, setSent] = useState(false)
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Contact" title="Get in Touch With Us" subtitle="Have questions? Our team is available 24x7 to help you find the perfect accommodation." />
        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              { icon: Phone, label: 'Call Us', value: PG_INFO.phone, href: `tel:${PG_INFO.phone}` },
              { icon: Mail, label: 'Email Us', value: PG_INFO.email, href: `mailto:${PG_INFO.email}` },
              { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us instantly', href: `https://wa.me/${PG_INFO.whatsapp}` },
              { icon: MapPin, label: 'Visit Us', value: PG_INFO.address, href: PG_INFO.mapsLink },
            ].map((c) => (
              <a key={c.label} href={c.href} target="_blank" className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition group">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition"><c.icon className="w-5 h-5" /></div>
                <div><p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{c.label}</p><p className="font-semibold text-slate-900">{c.value}</p></div>
              </a>
            ))}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <iframe title="StayNest Location" src={PG_INFO.mapEmbed} className="w-full h-56" loading="lazy" />
              <a href={PG_INFO.mapsLink} target="_blank" className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition"><Navigation className="w-4 h-4" /> Get Directions</a>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4"><MessageCircle className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
                <p className="text-slate-600 mt-2">Our team will get back to you within 24 hours.</p>
                <Button className="mt-6" onClick={() => setSent(false)}>Send Another</Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Send us a message</h3>
                <div className="grid sm:grid-cols-2 gap-4"><Input label="Full Name" required placeholder="John Doe" /><Input label="Phone" required placeholder="98765 43210" /></div>
                <Input label="Email" type="email" required placeholder="john@email.com" />
                <Input label="Subject" required placeholder="Enquiry about Boys PG" />
                <Textarea label="Message" rows={4} required placeholder="Tell us what you're looking for..." />
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
