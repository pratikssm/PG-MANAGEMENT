import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { IMAGES } from '../../lib/data'
import { SectionHeading, Button } from '../ui'

const cards = [
  { img: IMAGES.roomSingle, title: 'Single Seater Rooms', desc: 'Private premium rooms with AC, study desk & wardrobe.', pg: 'boys' },
  { img: IMAGES.lounge, title: 'Boys PG', desc: 'Spacious co-living spaces designed for students & professionals.', pg: 'boys' },
  { img: IMAGES.roomShared, title: 'Girls PG', desc: 'Secure, modern rooms with 24x7 surveillance & premium amenities.', pg: 'girls' },
  { img: IMAGES.gym, title: 'Wellness & Fitness', desc: 'On-site gym, yoga zone & indoor games for a balanced lifestyle.', pg: 'boys' },
]

export default function Facilities() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Accommodation" title="Spaces Designed for Modern Living" subtitle="From single-seater premium rooms to vibrant shared spaces — find your perfect home at StayNest." />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
              <img src={c.img} alt={c.title} className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="text-xl font-bold">{c.title}</h3>
                <p className="text-sm text-slate-200 mt-1 line-clamp-2">{c.desc}</p>
                <Link to={c.pg === 'boys' ? '/boys-pg' : '/girls-pg'} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 hover:text-indigo-200">Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" /></Link>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center"><Link to="/facilities"><Button variant="outline" className="border-slate-300 text-slate-900 hover:bg-slate-100">View All Facilities <ArrowRight className="w-4 h-4" /></Button></Link></div>
      </div>
    </section>
  )
}
