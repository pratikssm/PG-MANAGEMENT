import { MessageCircle } from 'lucide-react'
import { PG_INFO } from '../lib/data'

export default function WhatsAppFab() {
  return (
    <a href={`https://wa.me/${PG_INFO.whatsapp}?text=Hi%20StayNest,%20I%20want%20to%20enquire%20about%20PG%20rooms`} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-500/40 flex items-center justify-center transition hover:scale-110 group">
      <MessageCircle className="w-7 h-7 text-white" />
      <span className="absolute right-full mr-3 whitespace-nowrap bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">Chat on WhatsApp</span>
    </a>
  )
}
