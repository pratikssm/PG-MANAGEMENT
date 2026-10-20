
import { PG_INFO } from '../../lib/data'
import { Phone, Mail, MapPin, MessageCircle, Navigation } from 'lucide-react'
import { SectionHeading, Button, Input, Textarea } from '../ui'
import { useState } from 'react'
import { apiRequest } from '../../lib/api'
import { reportApiError } from '../../lib/hooks'

export default function ContactSection() {
  const [whatsappSent, setWhatsappSent] = useState<boolean | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setWhatsappSent(null)

    try {
      const result = await apiRequest<{ whatsappSent: boolean }>('/contacts', {
        method: 'POST',
        body: { name, phone, email, subject, message },
      })
      if (result.whatsappSent) {
        setName('')
        setPhone('')
        setEmail('')
        setSubject('')
        setMessage('')
      }
      setWhatsappSent(result.whatsappSent)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send your message.')
      reportApiError(requestError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Get in Touch With Us"
          subtitle="Have questions? Our team is available 24x7 to help you find the perfect accommodation."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              {
                icon: Phone,
                label: 'Call Us',
                value: PG_INFO.phone,
                href: `tel:${PG_INFO.phone}`,
              },
              {
                icon: Mail,
                label: 'Email Us',
                value: PG_INFO.email,
                href: `mailto:${PG_INFO.email}`,
              },
              {
                icon: MessageCircle,
                label: 'WhatsApp',
                value: 'Chat with us instantly',
                href: `https://wa.me/${PG_INFO.whatsapp}`,
              },
              {
                icon: MapPin,
                label: 'Visit Us',
                value: PG_INFO.address,
                href: PG_INFO.mapsLink,
              },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                  <c.icon className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    {c.label}
                  </p>
                  <p className="font-semibold text-slate-900">{c.value}</p>
                </div>
              </a>
            ))}

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <iframe
                title="StayNest Location"
                src={PG_INFO.mapEmbed}
                className="w-full h-56"
                loading="lazy"
              />

              <a
                href={PG_INFO.mapsLink}
                target="_blank"
                className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                Send us a message
              </h3>

              {whatsappSent !== null && (
                <p role="status" className={`rounded-lg p-3 text-sm ${whatsappSent ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                  {whatsappSent
                    ? 'Message sent. The owner has been notified on WhatsApp.'
                    : 'Your message was saved, but WhatsApp notification could not be sent. Please contact us by phone.'}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input
                  label="Phone"
                  required
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Input
                label="Email"
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Subject"
                required
                placeholder="Enter the subject of your message"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <Textarea
                label="Message"
                rows={4}
                required
                placeholder="Enter your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
