import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { TESTIMONIALS } from '../../lib/data'
import { SectionHeading } from '../ui'

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Testimonials" title="Loved by 10,000+ Residents" subtitle="Don't just take our word for it. Here's what our residents say about living at StayNest." />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-7 shadow-lg border border-slate-100 hover:shadow-xl transition">
              <Quote className="w-8 h-8 text-indigo-200" />
              <p className="mt-3 text-slate-700 leading-relaxed">{t.text}</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">{Array.from({ length: t.rating }).map((_, idx) => <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
