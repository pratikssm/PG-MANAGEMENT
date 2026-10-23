import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Button, Card, Input } from '../components/ui'
import { apiRequest } from '../lib/api'

type ResetStep = 'email' | 'verify' | 'password' | 'complete'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ResetStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  async function requestCode() {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await apiRequest('/auth/password/forgot', {
        method: 'POST',
        body: { email: email.trim().toLowerCase() },
      })
      setStep('verify')
      setOtp('')
      setSecondsLeft(60)
      setNotice('If an account exists for this email, a reset code has been sent. Check your inbox and spam folder.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send a reset code.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode() {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const result = await apiRequest<{ resetToken: string }>('/auth/password/verify', {
        method: 'POST',
        body: { email: email.trim().toLowerCase(), otp },
      })
      setResetToken(result.resetToken)
      setStep('password')
      setNotice('Code verified. Choose a new password.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to verify the code.')
    } finally {
      setBusy(false)
    }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
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
      await apiRequest('/auth/password/reset', {
        method: 'POST',
        body: { email: email.trim().toLowerCase(), resetToken, password, confirmPassword },
      })
      setStep('complete')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reset your password.')
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
          <h1 className="text-2xl font-bold text-white">{step === 'complete' ? 'Password updated' : 'Reset your password'}</h1>
          <p className="mt-1 text-sm text-slate-300">Secure access to your StayNest account</p>
        </div>

        <Card className="p-6 sm:p-8">
          {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
          {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

          {step === 'email' && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void requestCode() }}>
              <h2 className="text-lg font-bold text-slate-900">Forgot your password?</h2>
              <p className="text-sm text-slate-600">Enter the email address associated with your account. If an account exists, we’ll send a six-digit reset code.</p>
              <Input label="Email Address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" disabled={busy} />
              <Button type="submit" className="w-full" disabled={busy}><Mail className="h-4 w-4" />{busy ? 'Sending...' : 'Send Reset Code'}</Button>
            </form>
          )}

          {step === 'verify' && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void verifyCode() }}>
              <h2 className="text-lg font-bold text-slate-900">Enter your reset code</h2>
              <p className="text-sm text-slate-600">Enter the six-digit code sent to <strong>{email}</strong>. It expires in five minutes.</p>
              <Input label="One-Time Password" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" disabled={busy} />
              <Button type="submit" className="w-full" disabled={busy || otp.length !== 6}><KeyRound className="h-4 w-4" />{busy ? 'Verifying...' : 'Verify Code'}</Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" className="font-semibold text-indigo-600 disabled:text-slate-400" disabled={busy || secondsLeft > 0} onClick={() => void requestCode()}>Resend code</button>
                {secondsLeft > 0 && <span className="text-slate-500">Resend in {formattedCountdown}</span>}
              </div>
              <button type="button" className="text-sm text-slate-500 hover:text-indigo-600" disabled={busy} onClick={() => { setStep('email'); setOtp(''); setNotice(''); setError('') }}>Change email</button>
            </form>
          )}

          {step === 'password' && (
            <form className="space-y-4" onSubmit={(event) => void updatePassword(event)}>
              <h2 className="text-lg font-bold text-slate-900">Choose a new password</h2>
              <p className="text-sm text-slate-600">Use at least 8 characters with uppercase, lowercase, and a number.</p>
              <div className="relative">
                <Input label="New Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}" title="Use at least 8 characters with uppercase, lowercase, and a number." value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your new password" disabled={busy} />
                <button type="button" aria-label={showPassword ? 'Hide new password' : 'Show new password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-9 text-slate-400" disabled={busy}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              <div className="relative">
                <Input label="Confirm New Password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your new password" disabled={busy} />
                <button type="button" aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-9 text-slate-400" disabled={busy}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              <Button type="submit" className="w-full" disabled={busy}><Lock className="h-4 w-4" />{busy ? 'Updating...' : 'Reset Password'}</Button>
              <button type="button" className="w-full text-sm text-slate-500 hover:text-indigo-600" disabled={busy} onClick={() => { setStep('email'); setResetToken(''); setPassword(''); setConfirmPassword(''); setNotice(''); setError('') }}>Reset session expired? Request a new code</button>
            </form>
          )}

          {step === 'complete' && (
            <div className="space-y-4 text-center">
              <p className="text-slate-700">Your password has been changed. You can now sign in using your new password.</p>
              <Button className="w-full" onClick={() => navigate('/login', { replace: true, state: { email: email.trim().toLowerCase() } })}>Back to Login</Button>
            </div>
          )}

          {step !== 'complete' && (
            <div className="mt-5 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
              <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-violet-600"><ArrowLeft className="h-4 w-4" /> Back to Login</Link>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
