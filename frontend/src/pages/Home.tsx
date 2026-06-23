import Hero from '../components/home/Hero'
import VideoTour from '../components/home/VideoTour'
import Facilities from '../components/home/Facilities'
import Testimonials from '../components/home/Testimonials'
import FAQ from '../components/home/FAQ'
import CTA from '../components/home/CTA'
import ContactSection from '../components/home/ContactSection'
import { motion } from 'framer-motion'
import { Home as HomeIcon, ShieldCheck, Users, Award } from 'lucide-react'
import { SectionHeading } from '../components/ui'

const stats = [
  { value: '50+', label: 'Properties', icon: HomeIcon },
  { value: '10K+', label: 'Happy Residents', icon: Users },
  { value: '21', label: 'Premium Amenities', icon: Award },
  { value: '24/7', label: 'Security & Support', icon: ShieldCheck },
]

export default function Home() {
  return (
    <div>
      <Hero />
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
                <s.icon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-600 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Facilities />
      <VideoTour />
      <Testimonials />
      <FAQ />
      <CTA />
      <ContactSection />
    </div>
  )
}
