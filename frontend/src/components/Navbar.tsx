
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Home,
  BedDouble,
  UtensilsCrossed,
  Images,
  Phone,
  LayoutDashboard,
  LogIn,
  Sparkles,
} from 'lucide-react'
import { PG_INFO } from '../lib/data'
import { logout as logoutFromApi, reportApiError, useStore } from '../lib/hooks'
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

    onScroll()
    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [loc.pathname])

  async function logout() {
    try {
      await logoutFromApi()
      nav('/')
    } catch (error) {
      reportApiError(error)
    }
  }

  const isHome = loc.pathname === '/'
  const lightNavbar = scrolled || !isHome

  const registrationButtonClass = lightNavbar
    ? 'whitespace-nowrap border border-violet-600 bg-violet-600 text-white hover:bg-violet-700 hover:border-violet-700'
    : 'whitespace-nowrap border border-white/40 bg-white/10 text-white hover:bg-white/20'

  const logoutButtonClass =
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-700/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2'

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        lightNavbar
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
            <Home className="w-5 h-5 text-white" />
          </div>

          <span
            className={cn(
              'font-bold text-xl tracking-tight',
              lightNavbar ? 'text-slate-900' : 'text-white'
            )}
          >
            {PG_INFO.name}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                'px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap',
                lightNavbar
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-white/90 hover:bg-white/10',
                loc.pathname === l.to &&
                  (lightNavbar
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-white bg-white/15')
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop Authentication Buttons */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {db.user ? (
            <>
              <Link
                to={db.user.role === 'admin' ? '/admin' : '/resident'}
              >
                <Button
                  variant={lightNavbar ? 'primary' : 'glass'}
                  size="sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>

              <button
                type="button"
                onClick={logout}
                className={logoutButtonClass}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <Button
                variant={lightNavbar ? 'primary' : 'glass'}
                size="sm"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            </Link>
          )}

          {(!db.user ||
            (db.user.role === 'resident' && !db.user.residentId)) && (
            <Link to={db.user ? '/register' : '/signup'}>
              <Button
                variant={lightNavbar ? 'primary' : 'glass'}
                size="sm"
                className={cn(
                  registrationButtonClass,
                  'focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2'
                )}
              >
                {db.user ? 'Registration' : 'Sign Up'}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className={cn(
            'lg:hidden p-2 rounded-lg transition',
            lightNavbar
              ? 'text-slate-900 hover:bg-slate-100'
              : 'text-white hover:bg-white/10'
          )}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
                >
                  <l.icon className="w-5 h-5" />
                  {l.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {db.user ? (
                  <Link
                    to={db.user.role === 'admin' ? '/admin' : '/resident'}
                    onClick={() => setOpen(false)}
                    className="flex-1 min-w-0"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 min-w-0"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                )}

                {db.user && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      void logout()
                    }}
                    className={cn(logoutButtonClass, 'flex-1')}
                  >
                    Logout
                  </button>
                )}

                {(!db.user ||
                  (db.user.role === 'resident' && !db.user.residentId)) && (
                  <Link
                    to={db.user ? '/register' : '/signup'}
                    onClick={() => setOpen(false)}
                    className="flex-1 min-w-0"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full whitespace-nowrap bg-violet-600 text-white hover:bg-violet-700"
                    >
                      {db.user ? 'Registration' : 'Sign Up'}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}