import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, CreditCard, Smartphone, Building2, CheckCircle2, Download } from 'lucide-react'
import { useStore, updateDB } from '../lib/hooks'
import { type Invoice } from '../lib/store'
import { MESS_CHARGES } from '../lib/data'
import { formatINR, generateInvoiceNo } from '../lib/utils'
import { Button, Card, Badge, Input } from '../components/ui'

type Step = 1 | 2 | 3 | 4 | 5

export default function Booking() {
  const nav = useNavigate()
  const loc = useLocation()
  const db = useStore()
  const initialRoom = (loc.state as any)?.roomId
  const [step, setStep] = useState<Step>(initialRoom ? 2 : 1)
  const [pg, setPg] = useState<'boys' | 'girls'>('boys')
  const [roomId, setRoomId] = useState(initialRoom || '')
  const [mess, setMess] = useState(true)
  const [laundry, setLaundry] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [payment, setPayment] = useState('upi')
  const [paid, setPaid] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  const room = db.rooms.find((r) => r.id === roomId)
  const availableRooms = db.rooms.filter((r) => r.pg === pg && (r.totalBeds - r.occupiedBeds) > 0)

  const messAmt = mess ? MESS_CHARGES : 0
  const laundryAmt = laundry ? 500 : 0
  const rent = room?.rent || 0
  const gst = Math.round((rent + messAmt + laundryAmt) * 0.18)
  const total = rent + messAmt + laundryAmt + gst

  function pay() {
    const inv: Invoice = {
      id: `inv-${Date.now()}`, invoiceNo: generateInvoiceNo(),
      residentId: `reg-${Date.now()}`, residentName: name || 'New Resident',
      roomName: room?.name || '', roomRent: rent, messCharges: messAmt, laundryCharges: laundryAmt,
      gst, total, status: 'paid', date: new Date().toISOString().slice(0, 10),
      period: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    }
    updateDB((d) => ({ ...d, invoices: [inv, ...d.invoices] }))
    setInvoice(inv)
    setPaid(true)
    setStep(5)
  }

  const steps = ['Select PG', 'Choose Room', 'Add Services', 'Review', 'Confirmation']

  return (
    <div className="pt-16 min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">Book Your Room</h1>
        <p className="mt-2 text-center text-slate-600">Complete your booking in 5 simple steps</p>

        <div className="flex items-center justify-between my-8 max-w-2xl mx-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}</div>
              {i < steps.length - 1 && <div className={`h-1 flex-1 mx-1 rounded ${step > i + 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <Card className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Select PG Type</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(['boys', 'girls'] as const).map((p) => (
                    <button key={p} onClick={() => { setPg(p); setStep(2) }} className={`p-6 rounded-2xl border-2 text-left transition hover:shadow-lg ${pg === p ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                      <p className="text-2xl font-bold text-slate-900 capitalize">{p} PG</p>
                      <p className="text-sm text-slate-600 mt-1">Premium {p} co-living spaces with 21+ amenities</p>
                      <p className="mt-3 text-indigo-600 font-semibold text-sm">{db.rooms.filter((r) => r.pg === p && r.totalBeds - r.occupiedBeds > 0).length} rooms available →</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Choose Your Room ({pg} PG)</h2>
                <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {availableRooms.map((r) => (
                    <button key={r.id} onClick={() => { setRoomId(r.id); setStep(3) }} className={`p-4 rounded-xl border-2 text-left transition hover:shadow-md ${roomId === r.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                      <div className="flex justify-between items-start"><p className="font-semibold text-slate-900">{r.name}</p><Badge color="green">{r.totalBeds - r.occupiedBeds} left</Badge></div>
                      <p className="text-lg font-bold text-indigo-600 mt-1">{formatINR(r.rent)}/mo</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 3 && room && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Add Services</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-300"><div className="flex items-center gap-3"><input type="checkbox" checked={mess} onChange={(e) => setMess(e.target.checked)} className="w-5 h-5 accent-indigo-600" /><div><p className="font-medium text-slate-900">Mess Service</p><p className="text-xs text-slate-500">Daily breakfast, lunch & dinner</p></div></div><span className="font-bold text-slate-900">{formatINR(MESS_CHARGES)}/mo</span></label>
                  <label className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-300"><div className="flex items-center gap-3"><input type="checkbox" checked={laundry} onChange={(e) => setLaundry(e.target.checked)} className="w-5 h-5 accent-indigo-600" /><div><p className="font-medium text-slate-900">Laundry Service</p><p className="text-xs text-slate-500">Weekly wash & iron</p></div></div><span className="font-bold text-slate-900">{formatINR(500)}/mo</span></label>
                </div>
                <div className="mt-6 grid sm:grid-cols-3 gap-4"><Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /><Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@x.com" /><Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" /></div>
              </motion.div>
            )}
            {step === 4 && room && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Review & Pay</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Room</span><span className="font-medium text-slate-900">{room.name}</span></div>
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Room Rent</span><span className="font-medium text-slate-900">{formatINR(rent)}</span></div>
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Mess Charges</span><span className="font-medium text-slate-900">{formatINR(messAmt)}</span></div>
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">Laundry Charges</span><span className="font-medium text-slate-900">{formatINR(laundryAmt)}</span></div>
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-600">GST (18%)</span><span className="font-medium text-slate-900">{formatINR(gst)}</span></div>
                  <div className="flex justify-between py-3 text-lg font-bold"><span className="text-slate-900">Total</span><span className="text-indigo-600">{formatINR(total)}</span></div>
                </div>
                <div className="mt-6">
                  <p className="font-semibold text-slate-900 mb-3">Payment Method</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([['upi', Smartphone, 'UPI'], ['card', CreditCard, 'Card'], ['netbanking', Building2, 'Net Banking']] as const).map(([id, Icon, label]) => (
                      <button key={id} onClick={() => setPayment(id)} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition ${payment === id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}><Icon className="w-5 h-5" /><span className="text-xs font-medium">{label}</span></button>
                    ))}
                  </div>
                </div>
                <Button onClick={pay} className="w-full mt-6" size="lg"><CreditCard className="w-5 h-5" /> Pay {formatINR(total)}</Button>
                <p className="text-center text-xs text-slate-400 mt-2">Secured by Razorpay • 256-bit encryption</p>
              </motion.div>
            )}
            {step === 5 && invoice && (
              <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10" /></div>
                <h2 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
                <p className="mt-2 text-slate-600">Invoice #{invoice.invoiceNo} • {formatINR(invoice.total)} paid successfully</p>
                <Card className="mt-6 p-6 text-left">
                  <div className="flex items-center justify-between mb-4"><div><p className="font-bold text-slate-900">StayNest</p><p className="text-xs text-slate-500">Invoice {invoice.invoiceNo}</p></div><Badge color="green"><Check className="w-3 h-3" /> Paid</Badge></div>
                  <div className="space-y-1.5 text-sm border-t border-slate-100 pt-4">
                    <div className="flex justify-between"><span className="text-slate-600">Resident</span><span className="font-medium">{invoice.residentName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Room</span><span className="font-medium">{invoice.roomName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Period</span><span className="font-medium">{invoice.period}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Room Rent</span><span className="font-medium">{formatINR(invoice.roomRent)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Mess</span><span className="font-medium">{formatINR(invoice.messCharges)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Laundry</span><span className="font-medium">{formatINR(invoice.laundryCharges)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">GST</span><span className="font-medium">{formatINR(invoice.gst)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-slate-100 text-base font-bold"><span>Total</span><span className="text-indigo-600">{formatINR(invoice.total)}</span></div>
                  </div>
                </Card>
                <div className="mt-6 flex gap-3 justify-center"><Button onClick={() => window.print()}><Download className="w-4 h-4" /> Download Invoice</Button><Button variant="outline" className="border-slate-300 text-slate-900" onClick={() => nav('/')}>Done</Button></div>
              </motion.div>
            )}
          </AnimatePresence>

          {step > 1 && step < 4 && !paid && (
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}>Back</Button>
              {step === 3 && <Button onClick={() => setStep(4)}>Review <ChevronRight className="w-4 h-4" /></Button>}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
