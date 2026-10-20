import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ShieldCheck, User, Eye, EyeOff } from 'lucide-react'
import { loginWithPassword, reportApiError } from '../lib/hooks'
import { Button, Card } from '../components/ui'
import { PG_INFO } from '../lib/data'

export default function Login() {
  const nav = useNavigate()
  const location = useLocation()
  const loginState = location.state as { from?: string; email?: string; accountCreated?: boolean } | null
  const [role, setRole] = useState<'admin' | 'resident'>('resident')
  const [email, setEmail] = useState(loginState?.email || '')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setSubmitting(true)
    try {
      const user = await loginWithPassword(email, pwd, role)
      const returnPath = loginState?.from?.startsWith('/') && loginState.from !== '/login' ? loginState.from : null
      nav(user.role === 'admin' ? '/admin' : returnPath || (user.residentId ? '/resident' : '/register'), { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.'
      setErr(message)
      reportApiError(error)
    } finally {
      setSubmitting(false)
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
          {loginState?.accountCreated && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Account created. Sign in to start your resident registration.</p>}
          <form onSubmit={login} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><div className="relative"><Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={submitting} /></div></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><div className="relative"><Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input type={show ? 'text' : 'password'} required value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={submitting} /><button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-3.5 text-slate-400" disabled={submitting}>{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
            {err && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{err}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={submitting}><User className="w-4 h-4" /> {submitting ? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            New to StayNest? <Link to="/signup" className="font-semibold text-indigo-600 hover:text-violet-600">Create an account</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
