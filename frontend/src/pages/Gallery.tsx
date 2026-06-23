import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Image as ImageIcon, Video } from 'lucide-react'
import { GALLERY } from '../lib/data'
import { SectionHeading } from '../components/ui'

export default function Gallery() {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')
  const [active, setActive] = useState<number | null>(null)
  const items = GALLERY.filter((g) => filter === 'all' || g.type === filter)

  return (
    <div className="pt-16">
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <img src="/images/lounge.jpg" alt="Gallery" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-indigo-950/75 to-violet-950/65" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center px-4">
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">Gallery</h1>
          <p className="mt-3 text-lg text-slate-200 max-w-2xl mx-auto">Take a visual tour of our premium properties, rooms & amenities.</p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 mb-8">
            {([['all', 'All', null], ['image', 'Photos', ImageIcon], ['video', 'Videos', Video]] as const).map(([t, label, Icon]) => (
              <button key={t} onClick={() => setFilter(t)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition ${filter === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>{Icon && <Icon className="w-4 h-4" />}{label}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((g, i) => (
              <motion.button key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.05 }} onClick={() => setActive(i)} className="group relative rounded-2xl overflow-hidden aspect-video shadow-md hover:shadow-xl transition">
                <img src={g.type === 'video' ? '/images/hero-building.jpg' : g.src} alt={g.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white text-left"><p className="font-semibold text-sm">{g.title}</p></div>
                {g.type === 'video' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center"><Play className="w-6 h-6 text-indigo-600" /></div></div>}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {active !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActive(null)}>
            <button className="absolute top-5 right-5 text-white" onClick={() => setActive(null)}><X className="w-8 h-8" /></button>
            {items[active].type === 'video' ? (
              <video className="max-w-5xl w-full rounded-2xl" controls autoPlay><source src={items[active].src} type="video/mp4" /></video>
            ) : (
              <img src={items[active].src} alt={items[active].title} className="max-w-5xl max-h-[85vh] w-full object-contain rounded-2xl" />
            )}
            <p className="absolute bottom-6 left-0 right-0 text-center text-white font-semibold">{items[active].title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
