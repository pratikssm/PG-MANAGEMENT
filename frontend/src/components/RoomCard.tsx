import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BedDouble, Snowflake, Wind, Check, ArrowRight } from 'lucide-react'
import { type Room } from '../lib/data'
import { formatINR } from '../lib/utils'
import { Card, Badge, Button } from './ui'

export default function RoomCard({ room, index = 0 }: { room: Room; index?: number }) {
  const available = room.totalBeds - room.occupiedBeds
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="relative h-52 overflow-hidden">
          <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge color={room.ac === 'ac' ? 'indigo' : 'slate'}>{room.ac === 'ac' ? <><Snowflake className="w-3 h-3" /> AC</> : <><Wind className="w-3 h-3" /> Non-AC</>}</Badge>
            <Badge color={room.pg === 'boys' ? 'amber' : 'rose'}>{room.pg === 'boys' ? 'Boys' : 'Girls'}</Badge>
          </div>
          <div className="absolute top-3 right-3"><Badge color={available > 0 ? 'green' : 'rose'}>{available > 0 ? `${available} Available` : 'Full'}</Badge></div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-slate-900">{room.name}</h3>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><BedDouble className="w-4 h-4" /> {room.seater} Seater • {room.occupiedBeds}/{room.totalBeds} occupied</p>
          <p className="text-sm text-slate-600 mt-3 line-clamp-2">{room.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.facilities.slice(0, 4).map((f) => (
              <span key={f} className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md"><Check className="w-3 h-3 text-emerald-500" />{f}</span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between mt-auto">
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatINR(room.rent)}<span className="text-sm font-normal text-slate-500">/mo</span></p>
              <p className="text-xs text-slate-500">Deposit: {formatINR(room.deposit)}</p>
            </div>
            <Link to={`/rooms/${room.id}`}><Button size="sm">View <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
