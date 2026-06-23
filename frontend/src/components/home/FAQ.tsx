import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { FAQS } from '../../lib/data'
import { SectionHeading } from '../ui'

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about living at StayNest. Can't find an answer? Reach out to us." />
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-semibold text-slate-900">{f.q}</span>
                <span className="ml-4 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">{open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-slate-600 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
