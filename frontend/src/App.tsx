import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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
import Booking from './pages/Booking'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ResidentDashboard from './pages/ResidentDashboard'
import Legal from './pages/Legal'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boys-pg" element={<PGPage pg="boys" />} />
          <Route path="/girls-pg" element={<PGPage pg="girls" />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/food" element={<Food />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/resident" element={<ResidentDashboard />} />
          <Route path="/legal/:type" element={<LegalWrapper />} />
          <Route path="*" element={<Home />} />
        </Routes>
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
