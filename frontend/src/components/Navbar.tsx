import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, BedDouble, UtensilsCrossed, Images, Phone, LayoutDashboard, LogIn, Sparkles } from 'lucide-react'
import { PG_INFO } from '../lib/data'
import { useStore, updateDB } from '../lib/hooks'
import { Button } from './ui'
import { cn } from '../lib/utils'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/boys-pg', label: 'Boys PG', icon: BedDouble },
  { to: '/girls-pg', label: 'Girls PG', icon: BedDouble },
  { to: '/facilities', label: 'Facilities', icon: Sparkles },
  { to: '/food', label: 'Food', icon: UtensilsCrossed },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/contact', label: 'Contact', icon: Phone },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()
  const db = useStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [loc.pathname])

  function logout() {
    updateDB((d) => ({ ...d, user: null }))
    nav('/')
  }

  const isHome = loc.pathname === '/'

  return (
    <header className={cn('fixed top-0 inset-x-0 z-50 transition-all duration-300', scrolled || !isHome ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm' : 'bg-transparent')}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className={cn('font-bold text-xl tracking-tight', scrolled || !isHome ? 'text-slate-900' : 'text-white')}>{PG_INFO.name}</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={cn('px-3.5 py-2 rounded-lg text-sm font-medium transition', scrolled || !isHome ? 'text-slate-700 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10', loc.pathname === l.to && (scrolled || !isHome ? 'text-indigo-600 bg-indigo-50' : 'text-white bg-white/15'))}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {db.user ? (
            <div className="flex items-center gap-2">
              <Link to={db.user.role === 'admin' ? '/admin' : '/resident'}>
                <Button variant={scrolled || !isHome ? 'primary' : 'glass'} size="sm"><LayoutDashboard className="w-4 h-4" /> Dashboard</Button>
              </Link>
              <Button onClick={logout} variant="ghost" size="sm" className={scrolled || !isHome ? 'text-slate-700' : 'text-white'}>Logout</Button>
            </div>
          ) : (
            <Link to="/login"><Button variant={scrolled || !isHome ? 'primary' : 'glass'} size="sm"><LogIn className="w-4 h-4" /> Login</Button></Link>
          )}
          <Link to="/register"><Button variant={scrolled || !isHome ? 'outline' : 'glass'} size="sm" className={scrolled || !isHome ? 'border-slate-300 text-slate-900 hover:bg-slate-100' : ''}>Register</Button></Link>
        </div>

        <button className={cn('lg:hidden p-2 rounded-lg', scrolled || !isHome ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10')} onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t border-slate-200 overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium">
                  <l.icon className="w-5 h-5" /> {l.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                {db.user ? (
                  <Link to={db.user.role === 'admin' ? '/admin' : '/resident'} className="flex-1"><Button variant="primary" size="sm" className="w-full">Dashboard</Button></Link>
                ) : (
                  <Link to="/login" className="flex-1"><Button variant="primary" size="sm" className="w-full">Login</Button></Link>
                )}
                <Link to="/register" className="flex-1"><Button variant="outline" size="sm" className="w-full border-slate-300 text-slate-900">Register</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
