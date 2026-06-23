import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Star, ShieldCheck, Wifi, Snowflake, UtensilsCrossed, Dumbbell } from 'lucide-react'
import { IMAGES, PG_INFO, TESTIMONIALS } from '../../lib/data'
import { Button, GlassCard, SectionHeading, Badge } from '../ui'

const slides = [
  { img: IMAGES.hero, title: 'Premium Co-Living Spaces', sub: 'Where comfort meets community for students & professionals' },
  { img: IMAGES.lounge, title: 'Vibrant Common Areas', sub: 'Lounge, study rooms & indoor games to unwind and connect' },
  { img: IMAGES.dining, title: 'Hygienic Dining Hall', sub: 'Fresh, nutritious meals with rotating weekly menus' },
  { img: IMAGES.gym, title: 'Fitness & Wellness', sub: 'Fully-equipped gym and wellness zones in every property' },
]

export default function Hero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {slides.map((s, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? 'opacity-100' : 'opacity-0'}`}>
          <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-indigo-950/70 to-violet-950/60" />
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
          <Badge className="mb-5 bg-white/10 text-white border-white/20 backdrop-blur-md"><ShieldCheck className="w-3.5 h-3.5" /> ISO-Certified • 50+ Properties • 10,000+ Residents</Badge>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]">
            {slides[i].title.split(' ').slice(0, -1).join(' ')} <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{slides[i].title.split(' ').slice(-1)}</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-200 max-w-2xl leading-relaxed">{slides[i].sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/booking"><Button size="lg"><Play className="w-5 h-5" /> Book Your Room</Button></Link>
            <Link to="/boys-pg"><Button variant="glass" size="lg">Explore Rooms</Button></Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-white/90">
            {([['High-Speed WiFi', Wifi], ['AC Rooms', Snowflake], ['Daily Meals', UtensilsCrossed], ['Fitness Center', Dumbbell]] as const).map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium"><Icon className="w-4 h-4 text-indigo-300" /> {label}</div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 right-4 sm:right-8 flex items-center gap-3 z-10">
        <button onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`} />
          ))}
        </div>
        <button onClick={() => setI((p) => (p + 1) % slides.length)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition"><ChevronRight className="w-5 h-5" /></button>
      </div>
    </section>
  )
}
