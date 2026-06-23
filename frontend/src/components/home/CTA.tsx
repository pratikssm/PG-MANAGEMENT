import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Phone, MessageCircle } from 'lucide-react'
import { PG_INFO, IMAGES } from '../../lib/data'
import { Button } from '../ui'

export default function CTA() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-[2.5rem] overflow-hidden">
          <img src={IMAGES.lounge} alt="CTA" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-violet-900/90 to-slate-900/85" />
          <div className="relative p-10 sm:p-16 max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">Ready to Find Your New Home?</h2>
            <p className="mt-4 text-lg text-indigo-100 leading-relaxed">Join 10,000+ happy residents at StayNest. Premium rooms, world-class amenities, and a community that feels like family. Book a visit today.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register"><Button size="lg">Register Now <ArrowRight className="w-5 h-5" /></Button></Link>
              <a href={`https://wa.me/${PG_INFO.whatsapp}`} target="_blank"><Button variant="glass" size="lg"><MessageCircle className="w-5 h-5" /> WhatsApp</Button></a>
              <a href={`tel:${PG_INFO.phone}`}><Button variant="glass" size="lg"><Phone className="w-5 h-5" /> Call Us</Button></a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
