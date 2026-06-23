import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { FACILITIES } from '../lib/data'
import { SectionHeading } from '../components/ui'

export default function FacilitiesPage() {
  return (
    <div className="pt-16">
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <img src="/images/gym.jpg" alt="Facilities" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-indigo-950/75 to-violet-950/65" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center px-4">
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">21+ Premium Amenities</h1>
          <p className="mt-3 text-lg text-slate-200 max-w-2xl mx-auto">Everything you need for a comfortable, secure & productive lifestyle.</p>
        </motion.div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES.map((f, i) => {
              const Icon = (Icons as any)[f.icon] || Icons.Sparkles
              return (
                <motion.div key={f.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.05 }} className="group bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center group-hover:scale-110 transition"><Icon className="w-6 h-6" /></div>
                  <h3 className="mt-4 font-bold text-slate-900">{f.name}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{f.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
