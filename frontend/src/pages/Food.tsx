import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Coffee, UtensilsCrossed, Salad, Dumbbell, TrendingDown, HeartPulse, Check } from 'lucide-react'
import { WEEKLY_MENU, DIET_PLANS, MESS_CHARGES, IMAGES } from '../lib/data'
import { SectionHeading, Badge, Card } from '../components/ui'
import { formatINR } from '../lib/utils'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const todayName = days[new Date().getDay()]
const todayMenu = WEEKLY_MENU.find((m) => m.day === todayName) || WEEKLY_MENU[0]

const dietIcons: Record<string, any> = { 'Veg Diet': Salad, 'Non-Veg Diet': UtensilsCrossed, 'Special Diet': HeartPulse, 'Gym Diet': Dumbbell, 'Weight Loss Diet': TrendingDown, 'Diabetic Diet': HeartPulse }

export default function Food() {
  const [tab, setTab] = useState<'today' | 'weekly' | 'diets'>('today')
  return (
    <div className="pt-16">
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <img src={IMAGES.dining} alt="Dining" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-orange-950/75 to-rose-950/65" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center px-4">
          <Badge className="mb-3 bg-white/10 text-white border-white/20"><Coffee className="w-3.5 h-3.5" /> Fresh & Hygienic</Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">Food & Mess</h1>
          <p className="mt-3 text-lg text-slate-200 max-w-2xl mx-auto">Nutritious meals prepared fresh daily with rotating weekly menus and special diet plans.</p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 mb-8">
            {([['today', 'Today\'s Menu'], ['weekly', 'Weekly Menu'], ['diets', 'Diet Plans']] as const).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>{label}</button>
            ))}
          </div>

          {tab === 'today' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-6">
              {([['Breakfast', todayMenu.breakfast, Sun, '7:00 - 9:30 AM'], ['Lunch', todayMenu.lunch, UtensilsCrossed, '12:30 - 2:30 PM'], ['Dinner', todayMenu.dinner, Moon, '8:00 - 10:00 PM']] as const).map(([meal, items, Icon, time]) => (
                <Card key={meal as string} className="overflow-hidden">
                  <div className="bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-white flex items-center justify-between">
                    <div><p className="text-sm opacity-90">{todayName}</p><h3 className="text-xl font-bold">{meal as string}</h3></div>
                    <Icon className="w-8 h-8 opacity-80" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-500 font-medium">{time}</p>
                    <p className="mt-2 text-slate-700 leading-relaxed">{items as string}</p>
                  </div>
                </Card>
              ))}
              <div className="lg:col-span-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4">
                <div><p className="text-sm text-slate-600">Monthly Mess Charges</p><p className="text-3xl font-bold text-slate-900">{formatINR(MESS_CHARGES)}<span className="text-sm font-normal text-slate-500">/month</span></p></div>
                <Badge color="green"><Check className="w-3 h-3" /> Included in all plans</Badge>
              </div>
            </motion.div>
          )}

          {tab === 'weekly' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-slate-700">
                  <th className="text-left p-4 font-semibold">Day</th>
                  <th className="text-left p-4 font-semibold"><span className="flex items-center gap-1.5"><Sun className="w-4 h-4 text-amber-500" /> Breakfast</span></th>
                  <th className="text-left p-4 font-semibold"><span className="flex items-center gap-1.5"><UtensilsCrossed className="w-4 h-4 text-indigo-500" /> Lunch</span></th>
                  <th className="text-left p-4 font-semibold"><span className="flex items-center gap-1.5"><Moon className="w-4 h-4 text-violet-500" /> Dinner</span></th>
                </tr></thead>
                <tbody>
                  {WEEKLY_MENU.map((m) => (
                    <tr key={m.day} className={`border-t border-slate-100 ${m.day === todayName ? 'bg-indigo-50/50' : 'bg-white'}`}>
                      <td className="p-4 font-semibold text-slate-900">{m.day}{m.day === todayName && <Badge color="indigo" className="ml-2">Today</Badge>}</td>
                      <td className="p-4 text-slate-700">{m.breakfast}</td>
                      <td className="p-4 text-slate-700">{m.lunch}</td>
                      <td className="p-4 text-slate-700">{m.dinner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {tab === 'diets' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DIET_PLANS.map((d) => {
                const Icon = dietIcons[d.name] || Salad
                return (
                  <Card key={d.name} className="p-6 hover:shadow-xl transition">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center"><Icon className="w-6 h-6" /></div>
                    <h3 className="mt-4 font-bold text-slate-900">{d.name}</h3>
                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{d.desc}</p>
                    <p className="mt-4 text-2xl font-bold text-slate-900">{d.price === 0 ? 'Included' : `+${formatINR(d.price)}/mo`}</p>
                  </Card>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
