import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, CreditCard, CheckCircle2, Download } from 'lucide-react'
import { refreshAppData, reportApiError, useStore } from '../lib/hooks'
import { apiRequest, downloadApiFile, normalizeDocument } from '../lib/api'
import { type Invoice } from '../lib/store'
import { LAUNDRY_CHARGES, MESS_CHARGES } from '../lib/data'
import { formatINR } from '../lib/utils'
import { Button, Card, Badge, Input } from '../components/ui'

type Step = 1 | 2 | 3 | 4 | 5
type CheckoutResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
type CheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string; contact: string }
  handler: (response: CheckoutResponse) => void
  modal: { ondismiss: () => void }
}

declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => { open: () => void }
  }
}

export default function Booking() {
  const nav = useNavigate()
  const loc = useLocation()
  const db = useStore()
  const initialRoom = (loc.state as { roomId?: string } | null)?.roomId || ''
  const [step, setStep] = useState<Step>(initialRoom ? 2 : 1)
  const [pg, setPg] = useState<'boys' | 'girls'>(() => db.rooms.find((room) => room.id === initialRoom)?.pg || 'boys')
  const [roomId, setRoomId] = useState(initialRoom)
  const [mess, setMess] = useState(true)
  const [laundry, setLaundry] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  const resident = db.registrations.find((item) => item.id === db.user?.residentId)
  const name = resident?.fullName || ''
  const email = resident?.email || ''
  const phone = resident?.mobile || ''
  const room = db.rooms.find((r) => r.id === roomId)
  const availableRooms = db.rooms.filter((r) => r.pg === pg && (r.totalBeds - r.occupiedBeds) > 0)

  const messAmt = mess ? MESS_CHARGES : 0
  const laundryAmt = laundry ? LAUNDRY_CHARGES : 0
  const rent = room?.rent || 0
  const gst = Math.round((rent + messAmt + laundryAmt) * 0.18)
  const total = rent + messAmt + laundryAmt + gst

  async function pay() {
    if (!room || !resident) return
    setError('')
    setPaying(true)
    try {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Razorpay checkout could not be loaded. Please try again.'))
        document.body.appendChild(script)
      })
      if (!window.Razorpay) throw new Error('Razorpay checkout is unavailable.')

      const order = await apiRequest<{
        orderId: string
        amount: number
        currency: string
        keyId: string
      }>('/payments/order', {
        method: 'POST',
        body: { roomId: room.id, mess, laundry },
      })

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'StayNest',
        description: `Room booking - ${room.name}`,
        order_id: order.orderId,
        prefill: { name, email, contact: phone },
        handler: (response) => {
          void apiRequest<{ invoice: Record<string, unknown> }>('/payments/verify', {
            method: 'POST',
            body: response,
          }).then(async (result) => {
            await refreshAppData()
            setInvoice(normalizeDocument(result.invoice) as unknown as Invoice)
            setStep(5)
          }).catch((requestError) => {
            setError(requestError instanceof Error ? requestError.message : 'Payment verification failed.')
            reportApiError(requestError)
          }).finally(() => setPaying(false))
        },
        modal: { ondismiss: () => setPaying(false) },
      })
      checkout.open()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start payment.')
      reportApiError(requestError)
      setPaying(false)
    }
  }

  const steps = ['Select PG', 'Choose Room', 'Add Services', 'Review', 'Confirmation']

  if (db.loading) return <div className="pt-32 min-h-screen text-center text-slate-500">Loading booking details...</div>
  if (!db.user || db.user.role !== 'resident') {
    return (
      <div className="pt-32 min-h-screen px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to book a room</h1>
        <p className="mt-2 text-slate-600">Create a resident account and submit your registration before booking.</p>
        <div className="mt-6 flex justify-center gap-3"><Button onClick={() => nav('/login', { state: { from: '/booking' } })}>Sign in</Button><Button variant="outline" className="border-slate-300 text-slate-900" onClick={() => nav('/signup')}>Sign Up</Button></div>
      </div>
    )
  }
  if (!resident) {
    return (
      <div className="pt-32 min-h-screen px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Complete your resident registration</h1>
        <p className="mt-2 text-slate-600">A registration is required to create a booking and payment record.</p>
        <Button className="mt-6" onClick={() => nav('/register')}>Continue registration</Button>
      </div>
    )
  }
  if (resident.status !== 'approved') {
    return (
      <div className="pt-32 min-h-screen px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Application under review</h1>
        <p className="mt-2 text-slate-600">Room booking and payments are available after your resident application is approved.</p>
        <Button className="mt-6" onClick={() => nav('/resident')}>Check application status</Button>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">Book Your Room</h1>
        <p className="mt-2 text-center text-slate-600">Complete your booking in 5 simple steps</p>
        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-center text-sm text-rose-700">{error}</p>}

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
                  <label className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-300"><div className="flex items-center gap-3"><input type="checkbox" checked={laundry} onChange={(e) => setLaundry(e.target.checked)} className="w-5 h-5 accent-indigo-600" /><div><p className="font-medium text-slate-900">Laundry Service</p><p className="text-xs text-slate-500">Weekly wash & iron</p></div></div><span className="font-bold text-slate-900">{formatINR(LAUNDRY_CHARGES)}/mo</span></label>
                </div>
                <div className="mt-6 grid sm:grid-cols-3 gap-4"><Input label="Full Name" value={name} readOnly /><Input label="Email" type="email" value={email} readOnly /><Input label="Phone" value={phone} readOnly /></div>
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
                  <p className="text-sm text-slate-600">Choose UPI, card, or net banking in Razorpay's secure checkout.</p>
                </div>
                <Button onClick={() => void pay()} className="w-full mt-6" size="lg" disabled={paying}><CreditCard className="w-5 h-5" /> {paying ? 'Opening secure payment...' : `Pay ${formatINR(total)}`}</Button>
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
                <div className="mt-6 flex gap-3 justify-center"><Button onClick={() => void downloadApiFile(`/invoices/${invoice.id}/pdf`, `invoice-${invoice.invoiceNo}.pdf`).catch(reportApiError)}><Download className="w-4 h-4" /> Download Invoice</Button><Button variant="outline" className="border-slate-300 text-slate-900" onClick={() => nav('/')}>Done</Button></div>
              </motion.div>
            )}
          </AnimatePresence>

          {step > 1 && step < 4 && (
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
