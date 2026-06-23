import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserCheck, Upload, MessageCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { Input, Select, Textarea, Button, Card } from '../components/ui'
import { updateDB } from '../lib/hooks'
import { type Registration } from '../lib/store'
import { PG_INFO } from '../lib/data'
import api from '../lib/api'

type Step = 1 | 2 | 3 | 4

export default function Register() {
  const nav = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Partial<Registration>>({
    gender: 'male', acPreference: 'ac', mess: true, laundry: true, status: 'pending',
  })

  function set(k: keyof Registration, v: any) { setForm((f) => ({ ...f, [k]: v })) }
  function next() { setStep((s) => Math.min(4, s + 1) as Step) }
  function prev() { setStep((s) => Math.max(1, s - 1) as Step) }

  async function submit() {
    setLoading(true)
    setError('')
    
    const reg: Registration = {
      id: `reg-${Date.now()}`,
      fullName: form.fullName || '', parentName: form.parentName || '', parentMobile: form.parentMobile || '',
      mobile: form.mobile || '', alternateMobile: form.alternateMobile || '', email: form.email || '',
      gender: form.gender || 'male', dob: form.dob || '', aadhaar: form.aadhaar || '',
      occupation: form.occupation || '', organization: form.organization || '', address: form.address || '',
      city: form.city || '', state: form.state || '', pincode: form.pincode || '',
      emergencyContact: form.emergencyContact || '', roomPreference: form.roomPreference || '',
      acPreference: form.acPreference || 'ac', mess: form.mess ?? true, laundry: form.laundry ?? true,
      joiningDate: form.joiningDate || '', status: 'pending', createdAt: new Date().toISOString(),
    }

    try {
      // Submit to API
      const response = await api.registrations.create(reg)
      
      if (response.success) {
        updateDB((d) => ({ ...d, registrations: [reg, ...d.registrations] }))
        
        // Send WhatsApp message with details
        const msg = `New Registration Lead:%0AName: ${reg.fullName}%0AParent: ${reg.parentName} (${reg.parentMobile})%0AMobile: ${reg.mobile}%0AEmail: ${reg.email}%0AGender: ${reg.gender}%0AAadhaar: ${reg.aadhaar}%0AOccupation: ${reg.occupation} - ${reg.organization}%0ARoom Pref: ${reg.roomPreference} ${reg.acPreference?.toUpperCase()}%0AMess: ${reg.mess ? 'Yes' : 'No'}%0ALaundry: ${reg.laundry ? 'Yes' : 'No'}%0AJoining: ${reg.joiningDate}%0AAddress: ${reg.address}, ${reg.city}, ${reg.state} ${reg.pincode}`
        window.open(`https://wa.me/${PG_INFO.whatsapp}?text=${msg}`, '_blank')
        setDone(true)
      } else {
        setError(response.message || 'Failed to submit registration')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-10 h-10" /></div>
          <h1 className="text-3xl font-bold text-slate-900">Registration Submitted!</h1>
          <p className="mt-3 text-slate-600">Your lead details have been sent to the PG owner via WhatsApp. Our team will contact you within 24 hours to confirm your booking.</p>
          <div className="mt-6 flex gap-3 justify-center"><Button onClick={() => nav('/')}>Back Home</Button><Button variant="outline" className="border-slate-300 text-slate-900" onClick={() => nav('/booking')}>Continue Booking</Button></div>
        </motion.div>
      </div>
    )
  }

  const steps = ['Personal', 'Contact', 'Room', 'Uploads']

  return (
    <div className="pt-16 min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2"><UserCheck className="w-5 h-5" /> Registration</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Join StayNest Community</h1>
          <p className="mt-2 text-slate-600">Complete the form below to register. Your details are sent to our team instantly.</p>
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
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Full Name *" required value={form.fullName || ''} onChange={(e) => set('fullName', e.target.value)} placeholder="John Doe" disabled={loading} /><Input label="Parent/Guardian Name *" required value={form.parentName || ''} onChange={(e) => set('parentName', e.target.value)} placeholder="Parent name" disabled={loading} /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Select label="Gender *" value={form.gender} onChange={(e) => set('gender', e.target.value)} disabled={loading}><option value="male">Male</option><option value="female">Female</option></Select><Input label="Date of Birth *" type="date" value={form.dob || ''} onChange={(e) => set('dob', e.target.value)} disabled={loading} /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Aadhaar Number *" required value={form.aadhaar || ''} onChange={(e) => set('aadhaar', e.target.value)} placeholder="1234-5678-9012" disabled={loading} /><Input label="Occupation *" required value={form.occupation || ''} onChange={(e) => set('occupation', e.target.value)} placeholder="Student / Professional" disabled={loading} /></div>
              <Input label="College / Company *" required value={form.organization || ''} onChange={(e) => set('organization', e.target.value)} placeholder="Delhi University / Tech Mahindra" disabled={loading} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Mobile Number *" required value={form.mobile || ''} onChange={(e) => set('mobile', e.target.value)} placeholder="98765 43210" disabled={loading} /><Input label="Alternate Number" value={form.alternateMobile || ''} onChange={(e) => set('alternateMobile', e.target.value)} placeholder="98765 43211" disabled={loading} /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Parent Mobile *" required value={form.parentMobile || ''} onChange={(e) => set('parentMobile', e.target.value)} placeholder="98111 11111" disabled={loading} /><Input label="Email *" type="email" required value={form.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="john@email.com" disabled={loading} /></div>
              <Input label="Emergency Contact *" required value={form.emergencyContact || ''} onChange={(e) => set('emergencyContact', e.target.value)} placeholder="98111 22222" disabled={loading} />
              <Textarea label="Full Address *" rows={2} required value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="House no, street, area" disabled={loading} />
              <div className="grid sm:grid-cols-3 gap-4"><Input label="City *" required value={form.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="Delhi" disabled={loading} /><Input label="State *" required value={form.state || ''} onChange={(e) => set('state', e.target.value)} placeholder="Delhi" disabled={loading} /><Input label="Pincode *" required value={form.pincode || ''} onChange={(e) => set('pincode', e.target.value)} placeholder="110001" disabled={loading} /></div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Select label="Room Preference *" value={form.roomPreference || ''} onChange={(e) => set('roomPreference', e.target.value)} disabled={loading}>
                <option value="">Select room type</option>
                <option>Single Seater AC - Boys</option><option>Double Seater AC - Boys</option><option>Triple Seater AC - Boys</option><option>Four Seater AC - Boys</option>
                <option>Single Seater Non-AC - Boys</option><option>Double Seater Non-AC - Boys</option><option>Triple Seater Non-AC - Boys</option><option>Four Seater Non-AC - Boys</option>
                <option>Single Seater AC - Girls</option><option>Double Seater AC - Girls</option><option>Triple Seater AC - Girls</option><option>Four Seater AC - Girls</option>
                <option>Single Seater Non-AC - Girls</option><option>Double Seater Non-AC - Girls</option><option>Triple Seater Non-AC - Girls</option><option>Four Seater Non-AC - Girls</option>
              </Select>
              <div className="grid sm:grid-cols-2 gap-4"><Select label="AC / Non-AC *" value={form.acPreference} onChange={(e) => set('acPreference', e.target.value)} disabled={loading}><option value="ac">AC</option><option value="nonac">Non-AC</option></Select><Input label="Joining Date *" type="date" value={form.joiningDate || ''} onChange={(e) => set('joiningDate', e.target.value)} disabled={loading} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="checkbox" checked={form.mess} onChange={(e) => set('mess', e.target.checked)} className="w-5 h-5 accent-indigo-600" disabled={loading} /><div><p className="font-medium text-slate-900">Mess Service</p><p className="text-xs text-slate-500">Rs. 3,500/month</p></div></label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="checkbox" checked={form.laundry} onChange={(e) => set('laundry', e.target.checked)} className="w-5 h-5 accent-indigo-600" disabled={loading} /><div><p className="font-medium text-slate-900">Laundry Service</p><p className="text-xs text-slate-500">Rs. 500/month</p></div></label>
              </div>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {[['Profile Photo'], ['Aadhaar Front'], ['Aadhaar Back']].map(([label]) => (
                <div key={label} className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-medium text-slate-900">Upload {label}</p>
                  <p className="text-xs text-slate-500 mt-1">Click to browse • JPG, PNG up to 5MB</p>
                  <input type="file" accept="image/*" className="hidden" disabled={loading} />
                </div>
              ))}
              <div className="bg-indigo-50 rounded-2xl p-4 flex items-start gap-3"><MessageCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" /><p className="text-sm text-slate-700">On submission, your complete lead details will be automatically sent to the PG owner's WhatsApp for instant processing.</p></div>
            </motion.div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? <Button variant="ghost" onClick={prev} disabled={loading}>Back</Button> : <span />}
            {step < 4 ? <Button onClick={next} disabled={loading}>Continue <ChevronRight className="w-4 h-4" /></Button> : <Button onClick={submit} disabled={loading}><MessageCircle className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit & Send to WhatsApp'}</Button>}
          </div>
        </Card>
      </div>
    </div>
  )
}

  if (done) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-10 h-10" /></div>
          <h1 className="text-3xl font-bold text-slate-900">Registration Submitted!</h1>
          <p className="mt-3 text-slate-600">Your lead details have been sent to the PG owner via WhatsApp. Our team will contact you within 24 hours to confirm your booking.</p>
          <div className="mt-6 flex gap-3 justify-center"><Button onClick={() => nav('/')}>Back Home</Button><Button variant="outline" className="border-slate-300 text-slate-900" onClick={() => nav('/booking')}>Continue Booking</Button></div>
        </motion.div>
      </div>
    )
  }

  const steps = ['Personal', 'Contact', 'Room', 'Uploads']

  return (
    <div className="pt-16 min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2"><UserCheck className="w-5 h-5" /> Registration</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Join StayNest Community</h1>
          <p className="mt-2 text-slate-600">Complete the form below to register. Your details are sent to our team instantly.</p>
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
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Full Name *" required value={form.fullName || ''} onChange={(e) => set('fullName', e.target.value)} placeholder="John Doe" /><Input label="Parent/Guardian Name *" required value={form.parentName || ''} onChange={(e) => set('parentName', e.target.value)} placeholder="Parent name" /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Select label="Gender *" value={form.gender} onChange={(e) => set('gender', e.target.value)}><option value="male">Male</option><option value="female">Female</option></Select><Input label="Date of Birth *" type="date" value={form.dob || ''} onChange={(e) => set('dob', e.target.value)} /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Aadhaar Number *" required value={form.aadhaar || ''} onChange={(e) => set('aadhaar', e.target.value)} placeholder="1234-5678-9012" /><Input label="Occupation *" required value={form.occupation || ''} onChange={(e) => set('occupation', e.target.value)} placeholder="Student / Professional" /></div>
              <Input label="College / Company *" required value={form.organization || ''} onChange={(e) => set('organization', e.target.value)} placeholder="Delhi University / Tech Mahindra" />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Mobile Number *" required value={form.mobile || ''} onChange={(e) => set('mobile', e.target.value)} placeholder="98765 43210" /><Input label="Alternate Number" value={form.alternateMobile || ''} onChange={(e) => set('alternateMobile', e.target.value)} placeholder="98765 43211" /></div>
              <div className="grid sm:grid-cols-2 gap-4"><Input label="Parent Mobile *" required value={form.parentMobile || ''} onChange={(e) => set('parentMobile', e.target.value)} placeholder="98111 11111" /><Input label="Email *" type="email" required value={form.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="john@email.com" /></div>
              <Input label="Emergency Contact *" required value={form.emergencyContact || ''} onChange={(e) => set('emergencyContact', e.target.value)} placeholder="98111 22222" />
              <Textarea label="Full Address *" rows={2} required value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="House no, street, area" />
              <div className="grid sm:grid-cols-3 gap-4"><Input label="City *" required value={form.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="Delhi" /><Input label="State *" required value={form.state || ''} onChange={(e) => set('state', e.target.value)} placeholder="Delhi" /><Input label="Pincode *" required value={form.pincode || ''} onChange={(e) => set('pincode', e.target.value)} placeholder="110001" /></div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Select label="Room Preference *" value={form.roomPreference || ''} onChange={(e) => set('roomPreference', e.target.value)}>
                <option value="">Select room type</option>
                <option>Single Seater AC - Boys</option><option>Double Seater AC - Boys</option><option>Triple Seater AC - Boys</option><option>Four Seater AC - Boys</option>
                <option>Single Seater Non-AC - Boys</option><option>Double Seater Non-AC - Boys</option><option>Triple Seater Non-AC - Boys</option><option>Four Seater Non-AC - Boys</option>
                <option>Single Seater AC - Girls</option><option>Double Seater AC - Girls</option><option>Triple Seater AC - Girls</option><option>Four Seater AC - Girls</option>
                <option>Single Seater Non-AC - Girls</option><option>Double Seater Non-AC - Girls</option><option>Triple Seater Non-AC - Girls</option><option>Four Seater Non-AC - Girls</option>
              </Select>
              <div className="grid sm:grid-cols-2 gap-4"><Select label="AC / Non-AC *" value={form.acPreference} onChange={(e) => set('acPreference', e.target.value)}><option value="ac">AC</option><option value="nonac">Non-AC</option></Select><Input label="Joining Date *" type="date" value={form.joiningDate || ''} onChange={(e) => set('joiningDate', e.target.value)} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="checkbox" checked={form.mess} onChange={(e) => set('mess', e.target.checked)} className="w-5 h-5 accent-indigo-600" /><div><p className="font-medium text-slate-900">Mess Service</p><p className="text-xs text-slate-500">Rs. 3,500/month</p></div></label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="checkbox" checked={form.laundry} onChange={(e) => set('laundry', e.target.checked)} className="w-5 h-5 accent-indigo-600" /><div><p className="font-medium text-slate-900">Laundry Service</p><p className="text-xs text-slate-500">Rs. 500/month</p></div></label>
              </div>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {[['Profile Photo'], ['Aadhaar Front'], ['Aadhaar Back']].map(([label]) => (
                <div key={label} className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-medium text-slate-900">Upload {label}</p>
                  <p className="text-xs text-slate-500 mt-1">Click to browse • JPG, PNG up to 5MB</p>
                  <input type="file" accept="image/*" className="hidden" />
                </div>
              ))}
              <div className="bg-indigo-50 rounded-2xl p-4 flex items-start gap-3"><MessageCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" /><p className="text-sm text-slate-700">On submission, your complete lead details will be automatically sent to the PG owner's WhatsApp for instant processing.</p></div>
            </motion.div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? <Button variant="ghost" onClick={prev}>Back</Button> : <span />}
            {step < 4 ? <Button onClick={next}>Continue <ChevronRight className="w-4 h-4" /></Button> : <Button onClick={submit}><MessageCircle className="w-4 h-4" /> Submit & Send to WhatsApp</Button>}
          </div>
        </Card>
      </div>
    </div>
  )
}
