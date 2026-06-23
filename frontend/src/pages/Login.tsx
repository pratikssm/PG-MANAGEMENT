import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ShieldCheck, User, Eye, EyeOff } from 'lucide-react'
import { useStore, updateDB } from '../lib/hooks'
import { Button, Card } from '../components/ui'
import { PG_INFO } from '../lib/data'

export default function Login() {
  const nav = useNavigate()
  const db = useStore()
  const [role, setRole] = useState<'admin' | 'resident'>('resident')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')

  function login(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (role === 'admin') {
      if (email === 'admin@staynest.in' && pwd === 'admin123') {
        updateDB((d) => ({ ...d, user: { id: 'admin', name: 'Admin', email, role: 'admin' } }))
        nav('/admin')
      } else { setErr('Invalid admin credentials. Use admin@staynest.in / admin123') }
    } else {
      const reg = db.registrations.find((r) => r.email === email)
      if (reg && pwd === 'resident123') {
        updateDB((d) => ({ ...d, user: { id: reg.id, name: reg.fullName, email: reg.email, role: 'resident', residentId: reg.id } }))
        nav('/resident')
      } else if (email === 'rahul.mehta@staynest.in' && pwd === 'resident123') {
        updateDB((d) => ({ ...d, user: { id: 'reg-demo', name: 'Rahul Mehta', email, role: 'resident', residentId: 'reg-demo' } }))
        nav('/resident')
      } else { setErr('Use rahul.mehta@staynest.in / resident123 for demo') }
    }
  }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 p-4 py-20">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30"><ShieldCheck className="w-7 h-7 text-white" /></div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your {PG_INFO.name} account</p>
        </div>
        <Card className="p-7">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
            {(['resident', 'admin'] as const).map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition ${role === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>{r} Login</button>
            ))}
          </div>
          <form onSubmit={login} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><div className="relative"><Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><div className="relative"><Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input type={show ? 'text' : 'password'} required value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" /><button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-3.5 text-slate-400">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
            {err && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{err}</p>}
            <Button type="submit" className="w-full" size="lg"><User className="w-4 h-4" /> Sign In</Button>
          </form>
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
              <p><b>Admin:</b> admin@staynest.in / admin123</p>
              <p><b>Resident:</b> rahul.mehta@staynest.in / resident123</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
