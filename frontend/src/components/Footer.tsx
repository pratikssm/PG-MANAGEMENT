import { Link } from 'react-router-dom'
import { Home, Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import { PG_INFO } from '../lib/data'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center"><Home className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl text-white">{PG_INFO.name}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{PG_INFO.tagline}. Premium co-living spaces with world-class amenities, secure living, and a vibrant community.</p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition"><Icon className="w-4 h-4" /></a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[['/boys-pg', 'Boys PG'], ['/girls-pg', 'Girls PG'], ['/facilities', 'Facilities'], ['/food', 'Food & Mess'], ['/gallery', 'Gallery'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-white transition">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Resources</h4>
          <ul className="space-y-2 text-sm">
            {[['/register', 'Register Now'], ['/booking', 'Book a Room'], ['/login', 'Resident Login'], ['/login', 'Admin Login'], ['/legal/privacy', 'Privacy Policy'], ['/legal/terms', 'Terms of Service'], ['/legal/refund', 'Refund Policy']].map(([to, label]) => (
              <li key={label}><Link to={to} className="hover:text-white transition">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Get in Touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 text-indigo-400" /> {PG_INFO.phone}</li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 text-indigo-400" /> {PG_INFO.email}</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-indigo-400" /> {PG_INFO.address}</li>
            <li><a href={`https://wa.me/${PG_INFO.whatsapp}`} target="_blank" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"><MessageCircle className="w-4 h-4" /> WhatsApp Us</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} {PG_INFO.fullName}. All rights reserved.</p>
        <p>Built with security, scalability & premium design.</p>
      </div>
    </footer>
  )
}
