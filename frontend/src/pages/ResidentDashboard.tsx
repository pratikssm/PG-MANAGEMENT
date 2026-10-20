import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, User, Receipt, UtensilsCrossed, WashingMachine,
  MessageSquare, Download, Check, Plus, BedDouble, CreditCard,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore, refreshAppData, reportApiError } from '../lib/hooks'
import { apiRequest, downloadApiFile } from '../lib/api'
import { Button, Card, Badge, Select, Input, Textarea } from '../components/ui'
import { formatINR, formatDate } from '../lib/utils'

type Tab = 'overview' | 'profile' | 'payments' | 'meals' | 'laundry' | 'complaints'

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
  { id: 'laundry', label: 'Laundry', icon: WashingMachine },
  { id: 'complaints', label: 'Complaints', icon: MessageSquare },
]

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const todayName = days[new Date().getDay()]

export default function ResidentDashboard() {
  const db = useStore()
  const todayMenu = db.menu.find((m) => m.day === todayName)
  const [tab, setTab] = useState<Tab>('overview')
  const [complaintForm, setComplaintForm] = useState({ category: 'food', subject: '', description: '' })
  const [laundryItems, setLaundryItems] = useState(5)

  if (!db.user || db.user.role !== 'resident') return <Navigate to="/login" replace />

  const resident = db.registrations.find((r) => r.id === db.user?.residentId)
  const myInvoices = db.invoices.filter((i) => i.residentId === db.user?.residentId)
  const myComplaints = db.complaints.filter((c) => c.residentId === db.user?.residentId)
  const myLaundry = db.laundry.filter((l) => l.residentId === db.user?.residentId)
  const pendingDues = myInvoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.total, 0)

  if (!resident) return <Navigate to="/register" replace />

  async function fileComplaint() {
    if (!complaintForm.subject || !resident) return
    try {
      await apiRequest('/complaints', { method: 'POST', body: complaintForm })
      await refreshAppData()
      setComplaintForm({ category: 'food', subject: '', description: '' })
    } catch (error) {
      reportApiError(error)
    }
  }

  async function requestLaundry() {
    if (!resident) return
    try {
      await apiRequest('/laundry', { method: 'POST', body: { items: laundryItems } })
      await refreshAppData()
    } catch (error) {
      reportApiError(error)
    }
  }

  if (resident.status !== 'approved') {
    const rejected = resident.status === 'rejected'
    return (
      <div className="pt-16 min-h-screen bg-slate-50 px-4 py-12">
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${rejected ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'}`}>
            {rejected ? <User className="h-8 w-8" /> : <LayoutDashboard className="h-8 w-8" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Application {rejected ? 'Needs Attention' : 'Under Review'}</h1>
          <p className="mt-3 text-slate-600">
            {rejected
              ? 'Your resident application was not approved. Please contact the StayNest team to discuss the next steps.'
              : 'Your account is active, but your resident application is still pending. Resident services become available after approval.'}
          </p>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
            <p><strong>Applicant:</strong> {resident.fullName}</p>
            <p className="mt-1"><strong>Verified email:</strong> {db.user.email}</p>
            <p className="mt-1"><strong>Status:</strong> <span className="capitalize">{resident.status}</span></p>
          </div>
          <Link to="/contact" className="mt-6 inline-flex"><Button>Contact StayNest</Button></Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Resident Dashboard</h1>
          <p className="text-slate-600">Hello, {db.user.name} 👋</p>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${tab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><t.icon className="w-4 h-4" /> {t.label}</button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center mb-3"><BedDouble className="w-5 h-5" /></div><p className="text-sm text-slate-500">Room</p><p className="font-bold text-slate-900">{resident?.roomPreference || 'Not assigned'}</p></Card>
                <Card className="p-5"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-3"><CreditCard className="w-5 h-5" /></div><p className="text-sm text-slate-500">Pending Dues</p><p className="font-bold text-slate-900">{formatINR(pendingDues)}</p></Card>
                <Card className="p-5"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center mb-3"><MessageSquare className="w-5 h-5" /></div><p className="text-sm text-slate-500">Open Complaints</p><p className="font-bold text-slate-900">{myComplaints.filter((c) => c.status !== 'resolved').length}</p></Card>
                <Card className="p-5"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 text-white flex items-center justify-center mb-3"><WashingMachine className="w-5 h-5" /></div><p className="text-sm text-slate-500">Laundry Requests</p><p className="font-bold text-slate-900">{myLaundry.length}</p></Card>
              </div>
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Today's Menu</h3>
                {todayMenu ? <div className="grid sm:grid-cols-3 gap-4">
                  {[['Breakfast', todayMenu.breakfast], ['Lunch', todayMenu.lunch], ['Dinner', todayMenu.dinner]].map(([meal, items]) => (
                    <div key={meal} className="bg-slate-50 rounded-2xl p-4"><p className="font-semibold text-slate-900 text-sm">{meal}</p><p className="text-xs text-slate-600 mt-1">{items}</p></div>
                  ))}
                </div> : <p className="text-sm text-slate-500">Today's menu is not available yet.</p>}
              </Card>
            </div>
          )}

          {tab === 'profile' && resident && (
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-2xl font-bold">{resident.fullName.charAt(0)}</div>
                <div><h3 className="text-xl font-bold text-slate-900">{resident.fullName}</h3><p className="text-slate-500">{resident.email}</p></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {[['Mobile', resident.mobile], ['Alternate', resident.alternateMobile], ['Gender', resident.gender], ['DOB', resident.dob], ['Aadhaar', resident.aadhaar], ['Occupation', resident.occupation], ['Organization', resident.organization], ['Parent', resident.parentName], ['Parent Mobile', resident.parentMobile], ['Emergency Contact', resident.emergencyContact], ['Address', `${resident.address}, ${resident.city}, ${resident.state} ${resident.pincode}`], ['Room Preference', resident.roomPreference], ['AC Preference', resident.acPreference?.toUpperCase()], ['Mess', resident.mess ? 'Yes' : 'No'], ['Laundry', resident.laundry ? 'Yes' : 'No'], ['Joining Date', resident.joiningDate]].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">{k}</span><span className="text-sm font-medium text-slate-900 text-right capitalize">{v}</span></div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'payments' && (
            <div className="space-y-4">
              {myInvoices.length === 0 && <Card className="p-10 text-center text-slate-500">No invoices yet. Book a room to generate your first invoice.</Card>}
              {myInvoices.map((i) => (
                <Card key={i.id} className="p-6">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div><p className="font-mono text-xs text-slate-500">{i.invoiceNo}</p><p className="font-bold text-slate-900 mt-1">{i.period}</p><p className="text-sm text-slate-600">{i.roomName}</p></div>
                    <Badge color={i.status === 'paid' ? 'green' : i.status === 'pending' ? 'amber' : 'rose'}>{i.status}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-slate-500">Rent</p><p className="font-medium">{formatINR(i.roomRent)}</p></div>
                    <div><p className="text-slate-500">Mess</p><p className="font-medium">{formatINR(i.messCharges)}</p></div>
                    <div><p className="text-slate-500">Laundry</p><p className="font-medium">{formatINR(i.laundryCharges)}</p></div>
                    <div><p className="text-slate-500">GST</p><p className="font-medium">{formatINR(i.gst)}</p></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-900">Total: <span className="text-indigo-600">{formatINR(i.total)}</span></p>
                    <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => void downloadApiFile(`/invoices/${i.id}/pdf`, `invoice-${i.invoiceNo}.pdf`).catch(reportApiError)}><Download className="w-4 h-4" /> Invoice</Button>{i.status !== 'paid' && <span className="self-center text-xs text-slate-500">Contact the office to settle this invoice.</span>}</div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === 'meals' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Today's Menu ({todayName})</h3>
                {todayMenu ? <div className="grid sm:grid-cols-3 gap-4">
                  {[['Breakfast', todayMenu.breakfast, '7:00 - 9:30 AM'], ['Lunch', todayMenu.lunch, '12:30 - 2:30 PM'], ['Dinner', todayMenu.dinner, '8:00 - 10:00 PM']].map(([meal, items, time]) => (
                    <div key={meal} className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-4"><p className="text-xs text-slate-500">{time}</p><p className="font-bold text-slate-900 mt-1">{meal}</p><p className="text-sm text-slate-600 mt-2">{items}</p></div>
                  ))}
                </div> : <p className="text-sm text-slate-500">Today's menu is not available yet.</p>}
              </Card>
              <Card className="overflow-hidden">
                <h3 className="font-bold text-slate-900 p-5 border-b border-slate-100">Weekly Menu</h3>
                <div className="overflow-x-auto"><table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 text-slate-600 text-left"><th className="p-3 font-semibold">Day</th><th className="p-3 font-semibold">Breakfast</th><th className="p-3 font-semibold">Lunch</th><th className="p-3 font-semibold">Dinner</th></tr></thead>
                  <tbody>{db.menu.map((m) => (
                    <tr key={m.day} className={`border-t border-slate-100 ${m.day === todayName ? 'bg-indigo-50/50' : ''}`}><td className="p-3 font-semibold text-slate-900">{m.day}</td><td className="p-3 text-slate-700">{m.breakfast}</td><td className="p-3 text-slate-700">{m.lunch}</td><td className="p-3 text-slate-700">{m.dinner}</td></tr>
                  ))}</tbody>
                </table></div>
              </Card>
            </div>
          )}

          {tab === 'laundry' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Request Laundry Service</h3>
                <div className="flex items-end gap-3 flex-wrap">
                  <label className="block"><span className="block text-sm font-medium text-slate-700 mb-1.5">Number of items</span><input type="number" min={1} value={laundryItems} onChange={(e) => setLaundryItems(Number(e.target.value))} className="px-4 py-2.5 rounded-xl border border-slate-300 w-32" /></label>
                  <Button onClick={requestLaundry}><Plus className="w-4 h-4" /> Request Pickup</Button>
                </div>
              </Card>
              <div className="space-y-3">
                {myLaundry.map((l) => (
                  <Card key={l.id} className="p-5 flex items-center justify-between">
                    <div><p className="font-medium text-slate-900">{l.items} items</p><p className="text-xs text-slate-500">{formatDate(l.createdAt)}</p></div>
                    <Badge color={l.status === 'delivered' ? 'green' : l.status === 'in-progress' ? 'indigo' : 'amber'}>{l.status}</Badge>
                  </Card>
                ))}
                {myLaundry.length === 0 && <p className="text-center text-slate-500 py-6">No laundry requests yet.</p>}
              </div>
            </div>
          )}

          {tab === 'complaints' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">File a Complaint</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select label="Category" value={complaintForm.category} onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}><option value="food">Food</option><option value="room">Room</option><option value="electricity">Electricity</option><option value="water">Water</option><option value="laundry">Laundry</option><option value="other">Other</option></Select>
                  <Input label="Subject" value={complaintForm.subject} onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })} placeholder="Brief title" />
                </div>
                <div className="mt-4"><Textarea label="Description" rows={3} value={complaintForm.description} onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} placeholder="Describe the issue..." /></div>
                <Button className="mt-4" onClick={fileComplaint}><Plus className="w-4 h-4" /> Submit Complaint</Button>
              </Card>
              <div className="space-y-3">
                {myComplaints.map((c) => (
                  <Card key={c.id} className="p-5">
                    <div className="flex items-start justify-between"><div><p className="font-bold text-slate-900">{c.subject}</p><p className="text-xs text-slate-500 capitalize">{c.category} • {formatDate(c.createdAt)}</p></div><Badge color={c.status === 'resolved' ? 'green' : c.status === 'assigned' ? 'indigo' : 'amber'}>{c.status}</Badge></div>
                    <p className="text-sm text-slate-600 mt-2">{c.description}</p>
                    {c.assignedTo && c.status !== 'resolved' && <p className="text-xs text-slate-500 mt-2">Assigned to: {c.assignedTo}</p>}
                    {c.status === 'resolved' && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Resolved</p>}
                  </Card>
                ))}
                {myComplaints.length === 0 && <p className="text-center text-slate-500 py-6">No complaints filed. Everything looking good!</p>}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
