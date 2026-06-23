import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/hooks'
import RoomCard from '../components/RoomCard'
import { SectionHeading, Select, Badge } from '../components/ui'
import { IMAGES } from '../lib/data'

type PGType = 'boys' | 'girls'

export default function PGPage({ pg }: { pg: PGType }) {
  const db = useStore()
  const [ac, setAc] = useState('all')
  const [seater, setSeater] = useState('all')
  const [sort, setSort] = useState('default')
  const [maxPrice, setMaxPrice] = useState(20000)

  const rooms = useMemo(() => {
    let list = db.rooms.filter((r) => r.pg === pg)
    if (ac !== 'all') list = list.filter((r) => r.ac === ac)
    if (seater !== 'all') list = list.filter((r) => r.seater === Number(seater))
    list = list.filter((r) => r.rent <= maxPrice)
    if (sort === 'low') list = [...list].sort((a, b) => a.rent - b.rent)
    if (sort === 'high') list = [...list].sort((a, b) => b.rent - a.rent)
    return list
  }, [db.rooms, pg, ac, seater, sort, maxPrice])

  const title = pg === 'boys' ? 'Boys PG' : 'Girls PG'
  const hero = pg === 'boys' ? IMAGES.roomSingle : IMAGES.lounge

  return (
    <div className="pt-16">
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <img src={hero} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-indigo-950/75 to-violet-950/65" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center px-4">
          <Badge className="mb-3 bg-white/10 text-white border-white/20">{pg === 'boys' ? 'For Boys' : 'For Girls'}</Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">Premium {title}</h1>
          <p className="mt-3 text-lg text-slate-200 max-w-2xl mx-auto">Secure, modern & comfortable co-living spaces with 21+ premium amenities.</p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end sticky top-20 z-30">
            <Select label="AC / Non-AC" value={ac} onChange={(e) => setAc(e.target.value)}><option value="all">All</option><option value="ac">AC</option><option value="nonac">Non-AC</option></Select>
            <Select label="Room Type" value={seater} onChange={(e) => setSeater(e.target.value)}><option value="all">All</option><option value="1">Single</option><option value="2">Double</option><option value="3">Triple</option><option value="4">Four Seater</option></Select>
            <Select label="Sort By" value={sort} onChange={(e) => setSort(e.target.value)}><option value="default">Default</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></Select>
            <label className="block"><span className="block text-sm font-medium text-slate-700 mb-1.5">Max Price: ₹{maxPrice}</span><input type="range" min={5000} max={20000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600">Showing <span className="font-semibold text-slate-900">{rooms.length}</span> rooms</p>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-20"><p className="text-slate-500">No rooms match your filters. Try adjusting them.</p></div>
          ) : (
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((r, i) => <RoomCard key={r.id} room={r} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
