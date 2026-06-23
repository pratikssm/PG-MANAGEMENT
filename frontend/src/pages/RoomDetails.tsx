import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BedDouble, Snowflake, Wind, Check, Play, Wifi, ShieldCheck, Calendar, ArrowRight } from 'lucide-react'
import { useStore } from '../lib/hooks'
import { formatINR } from '../lib/utils'
import { Button, Badge, Card } from '../components/ui'

export default function RoomDetails() {
  const { id } = useParams()
  const db = useStore()
  const nav = useNavigate()
  const room = db.rooms.find((r) => r.id === id)
  const [activeImg, setActiveImg] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  if (!room) {
    return <div className="pt-32 min-h-screen flex flex-col items-center justify-center"><p className="text-slate-600">Room not found.</p><Link to="/"><Button className="mt-4">Back Home</Button></Link></div>
  }

  const available = room.totalBeds - room.occupiedBeds

  return (
    <div className="pt-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={room.pg === 'boys' ? '/boys-pg' : '/girls-pg'} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600 mb-4"><ArrowLeft className="w-4 h-4" /> Back to {room.pg === 'boys' ? 'Boys' : 'Girls'} PG</Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="relative rounded-3xl overflow-hidden shadow-xl group">
              <img src={room.images[activeImg]} alt={room.name} className="w-full h-96 object-cover" />
              <button onClick={() => setShowVideo(true)} className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-white/90 backdrop-blur text-indigo-600 hover:bg-white flex items-center justify-center shadow-lg transition hover:scale-110"><Play className="w-6 h-6" /></button>
              <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 border-white/0">Video Tour Available</Badge>
            </div>
            <div className="mt-4 flex gap-3">
              {room.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-24 h-20 rounded-xl overflow-hidden border-2 transition ${activeImg === i ? 'border-indigo-600' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex gap-2 mb-3">
              <Badge color={room.ac === 'ac' ? 'indigo' : 'slate'}>{room.ac === 'ac' ? <><Snowflake className="w-3 h-3" /> AC</> : <><Wind className="w-3 h-3" /> Non-AC</>}</Badge>
              <Badge color={room.pg === 'boys' ? 'amber' : 'rose'}>{room.pg === 'boys' ? 'Boys' : 'Girls'}</Badge>
              <Badge color={available > 0 ? 'green' : 'rose'}>{available > 0 ? `${available} Beds Available` : 'Fully Occupied'}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{room.name}</h1>
            <p className="mt-3 text-slate-600 leading-relaxed">{room.description}</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4 text-center"><BedDouble className="w-6 h-6 text-indigo-600 mx-auto" /><p className="mt-1 text-sm font-semibold text-slate-900">{room.seater} Seater</p></div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center"><ShieldCheck className="w-6 h-6 text-indigo-600 mx-auto" /><p className="mt-1 text-sm font-semibold text-slate-900">{room.occupiedBeds}/{room.totalBeds} Filled</p></div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center"><Wifi className="w-6 h-6 text-indigo-600 mx-auto" /><p className="mt-1 text-sm font-semibold text-slate-900">WiFi Included</p></div>
            </div>

            <Card className="mt-6 p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{formatINR(room.rent)}<span className="text-base font-normal text-slate-500">/month</span></p>
                  <p className="text-sm text-slate-500 mt-1">Security Deposit: {formatINR(room.deposit)}</p>
                </div>
                <Badge color="green"><Calendar className="w-3 h-3" /> Ready to Move-in</Badge>
              </div>
              <div className="mt-5 flex gap-3">
                <Button onClick={() => nav('/booking', { state: { roomId: room.id } })} className="flex-1" disabled={available === 0}>Book Now <ArrowRight className="w-4 h-4" /></Button>
                <Link to="/register" className="flex-1"><Button variant="outline" className="w-full border-slate-300 text-slate-900 hover:bg-slate-100">Register</Button></Link>
              </div>
            </Card>

            <div className="mt-6">
              <h3 className="font-bold text-slate-900 mb-3">Room Facilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {room.facilities.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700"><span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check className="w-3 h-3" /></span>{f}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <button className="absolute top-5 right-5 text-white text-2xl">×</button>
          <video className="max-w-4xl w-full rounded-2xl" controls autoPlay><source src={room.video} type="video/mp4" /></video>
        </div>
      )}
    </div>
  )
}
