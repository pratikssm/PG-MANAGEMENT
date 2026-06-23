import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react'
import { IMAGES } from '../../lib/data'
import { Button, SectionHeading } from '../ui'

export default function VideoTour() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [open, setOpen] = useState(false)

  function toggle() {
    const v = ref.current
    if (!v) return
    if (playing) { v.pause() } else { v.play() }
    setPlaying(!playing)
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Video Tour" title="Take a Virtual Walkthrough" subtitle="Explore our premium properties from the comfort of your home. Get a 360° feel of rooms, amenities, and community spaces." />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 relative rounded-3xl overflow-hidden shadow-2xl group">
          <video ref={ref} className="w-full aspect-video object-cover" poster={IMAGES.hero} loop muted={muted} onClick={() => setOpen(true)}>
            <source src="/video/tour.mp4" type="video/mp4" />
          </video>
          <div className={`absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent ${playing ? 'opacity-0' : 'opacity-100'} transition-opacity flex items-end p-6 sm:p-10`}>
            <div className="flex items-end justify-between w-full">
              <div className="text-white">
                <h3 className="text-2xl sm:text-3xl font-bold">StayNest Property Tour</h3>
                <p className="text-slate-200 mt-1">2 minutes • Full walkthrough</p>
              </div>
              <Button onClick={toggle} size="lg" className="!rounded-full w-16 h-16 !p-0"><Play className="w-6 h-6" /></Button>
            </div>
          </div>
          {playing && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button onClick={() => { setMuted(!muted); if (ref.current) ref.current.muted = !muted }} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 flex items-center justify-center">{muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
              <button onClick={toggle} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 flex items-center justify-center"><Pause className="w-5 h-5" /></button>
            </div>
          )}
        </motion.div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <button className="absolute top-5 right-5 text-white"><X className="w-8 h-8" /></button>
          <video className="max-w-5xl w-full rounded-2xl" controls autoPlay><source src="/video/tour.mp4" type="video/mp4" /></video>
        </div>
      )}
    </section>
  )
}
