import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserCheck, Upload, MessageCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { Input, Select, Textarea, Button, Card } from '../components/ui'
import { refreshAppData, reportApiError, useStore } from '../lib/hooks'
import { apiRequest } from '../lib/api'
import { type Registration } from '../lib/store'

type Step = 1 | 2 | 3 | 4

export default function Register() {
  const nav = useNavigate()
  const db = useStore()
  const [step, setStep] = useState<Step>(1)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<Partial<Registration>>({
    gender: 'male', acPreference: 'ac', mess: true, laundry: true, status: 'pending',
    fullName: db.user?.name || '', email: db.user?.email || '',
  })

  function set(k: keyof Registration, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })) }
  function next() {
    setError('')
    const fieldsByStep: Partial<Record<Step, (keyof Registration)[]>> = {
      1: ['fullName', 'parentName', 'dob', 'aadhaar', 'occupation', 'organization'],
      2: ['mobile', 'parentMobile', 'email', 'emergencyContact', 'address', 'city', 'state', 'pincode'],
      3: ['roomPreference', 'joiningDate'],
    }
    const missing = (fieldsByStep[step] || []).some((field) => !String(form[field] ?? '').trim())
    const phoneInvalid = step === 2 && [form.mobile, form.parentMobile, form.emergencyContact]
      .some((value) => String(value || '').replace(/\D/g, '').length < 10)
    const aadhaarInvalid = step === 1 && String(form.aadhaar || '').replace(/\D/g, '').length !== 12
    const pincodeInvalid = step === 2 && !/^\d{6}$/.test(String(form.pincode || ''))
    if (missing || phoneInvalid || aadhaarInvalid || pincodeInvalid) {
      setError(aadhaarInvalid
        ? 'Enter a valid 12-digit Aadhaar number.'
        : pincodeInvalid
          ? 'Enter a valid 6-digit pincode.'
          : phoneInvalid
            ? 'Enter valid phone numbers with at least 10 digits.'
            : 'Complete all required fields before continuing.')
      return
    }
    setStep((s) => Math.min(4, s + 1) as Step)
  }
  function prev() { setStep((s) => Math.max(1, s - 1) as Step) }

  async function submit() {
    setError('')
    if (!db.user || db.user.role !== 'resident') return
    setSubmitting(true)
    const reg: Omit<Registration, 'id' | 'status' | 'createdAt'> = {
      fullName: form.fullName || '', parentName: form.parentName || '', parentMobile: form.parentMobile || '',
      mobile: form.mobile || '', alternateMobile: form.alternateMobile || '', email: form.email || '',
      gender: form.gender || 'male', dob: form.dob || '', aadhaar: form.aadhaar || '',
      occupation: form.occupation || '', organization: form.organization || '', address: form.address || '',
      city: form.city || '', state: form.state || '', pincode: form.pincode || '',
      emergencyContact: form.emergencyContact || '', roomPreference: form.roomPreference || '',
      acPreference: form.acPreference || 'ac', mess: form.mess ?? true, laundry: form.laundry ?? true,
      joiningDate: form.joiningDate || '',
    }
    try {
      await apiRequest('/registrations', { method: 'POST', body: reg })
      await refreshAppData()
      setDone(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit your registration.')
      reportApiError(requestError)
    } finally {
      setSubmitting(false)
    }
  }

  if (!db.user) return <Navigate to="/login" replace state={{ from: '/register' }} />
  if (db.user.role !== 'resident') return <Navigate to="/admin" replace />
  if (db.user.residentId) return <Navigate to="/resident" replace />

  if (done) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-10 h-10" /></div>
          <h1 className="text-3xl font-bold text-slate-900">Registration Submitted!</h1>
          <p className="mt-3 text-slate-600">Your application has been submitted for review. You can check its status in your dashboard; account creation does not mean the application is approved.</p>
          <div className="mt-6 flex gap-3 justify-center"><Button onClick={() => nav('/')}>Back Home</Button><Button variant="outline" className="border-slate-300 text-slate-900" onClick={() => nav('/resident')}>Open Dashboard</Button></div>
        </motion.div>
      </div>
    )
  }

  const steps = ['Personal', 'Contact', 'Room', 'Review']

  return (
    <div className="pt-16 min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2"><UserCheck className="w-5 h-5" /> Registration</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Join StayNest Community</h1>
          <p className="mt-2 text-slate-600">Complete this application using your signed-in account. Your email is taken from your verified profile.</p>
        </div>

        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}</div>
              {i < steps.length - 1 && <div className={`h-1 flex-1 mx-1 rounded ${step > i + 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <Card className="p-6 sm:p-8">
          {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">{error}</div>}
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Full Name *" required value={form.fullName || ''} onChange={(e) => set('fullName', e.target.value)} placeholder="Enter your full name" /><Input label="Parent/Guardian Name *" required value={form.parentName || ''} onChange={(e) => set('parentName', e.target.value)} placeholder="Enter parent/guardian name" /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Select label="Gender *" required value={form.gender} onChange={(e) => set('gender', e.target.value)}><option value="male">Male</option><option value="female">Female</option></Select><Input label="Date of Birth *" type="date" required value={form.dob || ''} onChange={(e) => set('dob', e.target.value)} /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Aadhaar Number *" required value={form.aadhaar || ''} onChange={(e) => set('aadhaar', e.target.value)} placeholder="Enter Aadhaar number" /><Input label="Occupation *" required value={form.occupation || ''} onChange={(e) => set('occupation', e.target.value)} placeholder="Enter occupation" /></div>
              <Input label="College / Company *" required value={form.organization || ''} onChange={(e) => set('organization', e.target.value)} placeholder="Enter college or company name" />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Mobile Number *" required value={form.mobile || ''} onChange={(e) => set('mobile', e.target.value)} placeholder="Enter mobile number" /><Input label="Alternate Number" value={form.alternateMobile || ''} onChange={(e) => set('alternateMobile', e.target.value)} placeholder="Enter alternate number" /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Parent Mobile *" required value={form.parentMobile || ''} onChange={(e) => set('parentMobile', e.target.value)} placeholder="Enter parent mobile number" /><Input label="Verified Account Email" type="email" readOnly value={db.user.email} /></div>
              <Input label="Emergency Contact *" required value={form.emergencyContact || ''} onChange={(e) => set('emergencyContact', e.target.value)} placeholder="Enter emergency contact number" />
              <Textarea label="Full Address *" rows={2} required value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Enter full address" />
              <div className="grid sm:grid-cols-3 gap-4"><Input label="City *" required value={form.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="Enter city" /><Input label="State *" required value={form.state || ''} onChange={(e) => set('state', e.target.value)} placeholder="Enter state" /><Input label="Pincode *" required value={form.pincode || ''} onChange={(e) => set('pincode', e.target.value)} placeholder="Enter pincode" /></div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Select label="Room Preference *" required value={form.roomPreference || ''} onChange={(e) => set('roomPreference', e.target.value)}>
                <option value="">Select room type</option>
                <option>Single Seater AC - Boys</option><option>Double Seater AC - Boys</option><option>Triple Seater AC - Boys</option><option>Four Seater AC - Boys</option>
                <option>Single Seater Non-AC - Boys</option><option>Double Seater Non-AC - Boys</option><option>Triple Seater Non-AC - Boys</option><option>Four Seater Non-AC - Boys</option>
                <option>Single Seater AC - Girls</option><option>Double Seater AC - Girls</option><option>Triple Seater AC - Girls</option><option>Four Seater AC - Girls</option>
                <option>Single Seater Non-AC - Girls</option><option>Double Seater Non-AC - Girls</option><option>Triple Seater Non-AC - Girls</option><option>Four Seater Non-AC - Girls</option>
              </Select>
              <div className="grid sm:grid-cols-2 gap-4"><Select label="AC / Non-AC *" required value={form.acPreference} onChange={(e) => set('acPreference', e.target.value)}><option value="ac">AC</option><option value="nonac">Non-AC</option></Select><Input label="Joining Date *" type="date" required value={form.joiningDate || ''} onChange={(e) => set('joiningDate', e.target.value)} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="checkbox" checked={form.mess} onChange={(e) => set('mess', e.target.checked)} className="w-5 h-5 accent-indigo-600" disabled={submitting} /><div><p className="font-medium text-slate-900">Mess Service</p><p className="text-xs text-slate-500">Rs. 3,500/month</p></div></label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="checkbox" checked={form.laundry} onChange={(e) => set('laundry', e.target.checked)} className="w-5 h-5 accent-indigo-600" disabled={submitting} /><div><p className="font-medium text-slate-900">Laundry Service</p><p className="text-xs text-slate-500">Rs. 500/month</p></div></label>
              </div>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">This application will be linked to your verified account: <strong>{db.user.email}</strong></p>
              <div className="bg-indigo-50 rounded-2xl p-4 flex items-start gap-3"><Upload className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" /><p className="text-sm text-slate-700">Identity documents can be shared with the StayNest team after registration. Your Aadhaar number is stored with your private application record.</p></div>
              <p className="text-sm text-slate-600">After submission, your application will remain pending until the StayNest team reviews it.</p>
            </motion.div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? <Button variant="ghost" onClick={prev}>Back</Button> : <span />}
            {step < 4 ? <Button onClick={next}>Continue <ChevronRight className="w-4 h-4" /></Button> : <Button onClick={() => void submit()} disabled={submitting}><MessageCircle className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Application'}</Button>}
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        </Card>
      </div>
    </div>
  )
}
