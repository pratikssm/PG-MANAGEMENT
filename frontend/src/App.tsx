import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'
import Home from './pages/Home'
import PGPage from './pages/PGPage'
import RoomDetails from './pages/RoomDetails'
import FacilitiesPage from './pages/FacilitiesPage'
import Food from './pages/Food'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Register from './pages/Register'
import Signup from './pages/Signup'
import Booking from './pages/Booking'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ResidentDashboard from './pages/ResidentDashboard'
import Legal from './pages/Legal'
import { clearApiError, initializeApp, useStore } from './lib/hooks'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const db = useStore()

  useEffect(() => { void initializeApp() }, [])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      {db.error && (
        <div role="alert" className="fixed top-20 left-1/2 z-[60] flex w-[min(92vw,48rem)] -translate-x-1/2 items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-lg">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1">{db.error}</p>
          <button aria-label="Dismiss error" onClick={clearApiError}><X className="h-4 w-4" /></button>
        </div>
      )}
      <main>
        {db.loading ? (
          <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Connecting to StayNest...</div>
        ) : <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boys-pg" element={<PGPage pg="boys" />} />
          <Route path="/girls-pg" element={<PGPage pg="girls" />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/food" element={<Food />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/resident" element={<ResidentDashboard />} />
          <Route path="/legal/:type" element={<LegalWrapper />} />
          <Route path="*" element={<Home />} />
        </Routes>}
      </main>
      <Footer />
      <WhatsAppFab />
    </BrowserRouter>
  )
}

function LegalWrapper() {
  const { pathname } = useLocation()
  const type = pathname.split('/').pop() as 'privacy' | 'terms' | 'refund'
  const valid = ['privacy', 'terms', 'refund'].includes(type)
  return valid ? <Legal type={type} /> : <Home />
}
