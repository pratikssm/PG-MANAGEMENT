import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ShieldCheck, User, Eye, EyeOff } from 'lucide-react'
import { useStore, updateDB, useAuth } from '../lib/hooks'
import { Button, Card } from '../components/ui'
import { PG_INFO } from '../lib/data'

export default function Login() {
  const nav = useNavigate()
  const db = useStore()
  const { login: apiLogin } = useAuth()
  const [role, setRole] = useState<'admin' | 'resident'>('resident')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)

    try {
      if (role === 'admin') {
        // Admin login through API
        const response = await apiLogin(email, pwd)
        if (response?.user?.role === 'admin') {
          updateDB((d) => ({ ...d, user: { ...response.user, role: 'admin' } }))
          nav('/admin')
        } else {
          setErr('Invalid admin credentials')
        }
      } else {
        // Resident login through API
        const response = await apiLogin(email, pwd)
        if (response?.user?.role === 'resident' || response?.user?.residentId) {
          updateDB((d) => ({ ...d, user: { ...response.user, role: 'resident' } }))
          nav('/resident')
        } else {
          setErr('Invalid resident credentials')
        }
      }
    } catch (error: any) {
      setErr(error.message || 'Login failed. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
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
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><div className="relative"><Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={loading} /></div></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><div className="relative"><Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input type={show ? 'text' : 'password'} required value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={loading} /><button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-3.5 text-slate-400" disabled={loading}>{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
            {err && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{err}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}><User className="w-4 h-4" /> {loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-3">Demo Credentials (for testing)</p>
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
              <p><b>Admin:</b> admin@staynest.in / admin123</p>
              <p><b>Resident:</b> rahul.mehta@staynest.in / resident123</p>
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">Or <button onClick={() => nav('/register')} className="text-indigo-600 hover:underline">register as a new resident</button></p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
