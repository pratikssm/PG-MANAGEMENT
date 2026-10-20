import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Button, Card, Input } from '../components/ui'
import { apiRequest } from '../lib/api'

type SignupStep = 'details' | 'verify' | 'password'

export default function Signup() {
  const nav = useNavigate()
  const [step, setStep] = useState<SignupStep>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  async function sendOtp() {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const result = await apiRequest<undefined>('/auth/otp/request', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim().toLowerCase() },
      })
      setStep('verify')
      setSecondsLeft(60)
      setNotice(result ? 'Verification code sent. Check your inbox and spam folder.' : 'If this email is eligible, a verification code has been sent.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send verification code.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyOtp() {
    setError('')
    setBusy(true)
    try {
      await apiRequest('/auth/otp/verify', {
        method: 'POST',
        body: { email: email.trim().toLowerCase(), otp },
      })
      setStep('password')
      setNotice('Email verified. Create a password to finish setting up your account.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to verify code.')
    } finally {
      setBusy(false)
    }
  }

  async function createAccount(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError('Use at least 8 characters, including uppercase, lowercase, and a number.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await apiRequest('/auth/signup', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim().toLowerCase(), password, confirmPassword },
      })
      nav('/login', { replace: true, state: { email: email.trim().toLowerCase(), accountCreated: true } })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create your account.')
    } finally {
      setBusy(false)
    }
  }

  const formattedCountdown = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 p-4 py-20">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your StayNest account</h1>
          <p className="mt-1 text-sm text-slate-300">Sign up first; resident registration comes after you log in.</p>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2" aria-label="Signup progress">
            {(['details', 'verify', 'password'] as SignupStep[]).map((current, index) => {
              const activeIndex = (['details', 'verify', 'password'] as SignupStep[]).indexOf(step)
              return <div key={current} className={`h-1.5 flex-1 rounded-full ${index <= activeIndex ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            })}
          </div>

          {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
          {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

          {step === 'details' && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void sendOtp() }}>
              <h2 className="text-lg font-bold text-slate-900">Verify your email</h2>
              <Input label="Full Name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your full name" />
              <Input label="Email Address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              <Button type="submit" className="w-full" disabled={busy}><Mail className="h-4 w-4" />{busy ? 'Sending...' : 'Send OTP'}</Button>
            </form>
          )}

          {step === 'verify' && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void verifyOtp() }}>
              <h2 className="text-lg font-bold text-slate-900">Enter your verification code</h2>
              <p className="text-sm text-slate-600">We sent a six-digit code to <strong>{email}</strong>. It expires in five minutes.</p>
              <Input label="One-Time Password" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" />
              <Button type="submit" className="w-full" disabled={busy || otp.length !== 6}><KeyRound className="h-4 w-4" />{busy ? 'Verifying...' : 'Verify Email'}</Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" className="font-semibold text-indigo-600 disabled:text-slate-400" disabled={busy || secondsLeft > 0} onClick={() => void sendOtp()}>
                  Resend code
                </button>
                {secondsLeft > 0 && <span className="text-slate-500">Resend in {formattedCountdown}</span>}
              </div>
              <button type="button" className="text-sm text-slate-500 hover:text-indigo-600" onClick={() => { setStep('details'); setOtp(''); setNotice('') }}>Change name or email</button>
            </form>
          )}

          {step === 'password' && (
            <form className="space-y-4" onSubmit={(event) => void createAccount(event)}>
              <h2 className="text-lg font-bold text-slate-900">Create your password</h2>
              <p className="text-sm text-slate-600">Verified email: <strong>{email}</strong></p>
              <div className="relative">
                <Input label="Create Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}" title="Use at least 8 characters with uppercase, lowercase, and a number." value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters, upper/lowercase and a number" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-9 text-slate-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input label="Confirm Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" />
              <p className="text-xs text-slate-500">Use at least 8 characters, including an uppercase letter, lowercase letter, and number.</p>
              <Button type="submit" className="w-full" disabled={busy}><UserRound className="h-4 w-4" />{busy ? 'Creating account...' : 'Create Account'}</Button>
            </form>
          )}

          <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-violet-600">Log in</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
