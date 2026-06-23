import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, BedDouble, Receipt, MessageSquare, WashingMachine,
  Send, BarChart3, Check, X, Trash2, Download, TrendingUp, Home, DollarSign,
  AlertCircle, Mail, MessageCircle, FileSpreadsheet,
} from 'lucide-react'
import { useStore, updateDB, resetDB } from '../lib/hooks'
import { type Registration, type Complaint } from '../lib/store'
import { Button, Card, Badge, Select, Input, Textarea } from '../components/ui'
import { formatINR, formatDate, downloadText } from '../lib/utils'
import { PG_INFO, WEEKLY_MENU } from '../lib/data'

type Tab = 'overview' | 'registrations' | 'rooms' | 'payments' | 'complaints' | 'laundry' | 'broadcast' | 'reports'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'registrations', label: 'Registrations', icon: Users },
  { id: 'rooms', label: 'Rooms', icon: BedDouble },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  { id: 'laundry', label: 'Laundry', icon: WashingMachine },
  { id: 'broadcast', label: 'Broadcast', icon: Send },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
]

export default function AdminDashboard() {
  const db = useStore()
  const [tab, setTab] = useState<Tab>('overview')
  const [menuEdit, setMenuEdit] = useState(false)

  if (!db.user || db.user.role !== 'admin') return <Navigate to="/login" replace />

  const totalRevenue = db.invoices.reduce((s, i) => s + i.total, 0)
  const pendingRegs = db.registrations.filter((r) => r.status === 'pending').length
  const openComplaints = db.complaints.filter((c) => c.status !== 'resolved').length
  const totalBeds = db.rooms.reduce((s, r) => s + r.totalBeds, 0)
  const occupiedBeds = db.rooms.reduce((s, r) => s + r.occupiedBeds, 0)
  const occupancy = Math.round((occupiedBeds / totalBeds) * 100)

  function approveReg(id: string) { updateDB((d) => ({ ...d, registrations: d.registrations.map((r) => r.id === id ? { ...r, status: 'approved' } : r) })) }
  function rejectReg(id: string) { updateDB((d) => ({ ...d, registrations: d.registrations.map((r) => r.id === id ? { ...r, status: 'rejected' } : r) })) }
  function deleteReg(id: string) { updateDB((d) => ({ ...d, registrations: d.registrations.filter((r) => r.id !== id) })) }
  function setRoomPrice(id: string, rent: number) { updateDB((d) => ({ ...d, rooms: d.rooms.map((r) => r.id === id ? { ...r, rent, deposit: rent * 2 } : r) })) }
  function setOccupancy(id: string, occ: number) { updateDB((d) => ({ ...d, rooms: d.rooms.map((r) => r.id === id ? { ...r, occupiedBeds: Math.min(occ, r.totalBeds) } : r) })) }
  function resolveComplaint(id: string) { updateDB((d) => ({ ...d, complaints: d.complaints.map((c) => c.id === id ? { ...c, status: 'resolved' } : c) })) }
  function assignComplaint(id: string, to: string) { updateDB((d) => ({ ...d, complaints: d.complaints.map((c) => c.id === id ? { ...c, status: 'assigned', assignedTo: to } : c) })) }
  function updateLaundry(id: string, status: any) { updateDB((d) => ({ ...d, laundry: d.laundry.map((l) => l.id === id ? { ...l, status } : l) })) }

  function exportCSV() {
    const headers = ['Invoice No', 'Resident', 'Room', 'Rent', 'Mess', 'Laundry', 'GST', 'Total', 'Status', 'Date']
    const rows = db.invoices.map((i) => [i.invoiceNo, i.residentName, i.roomName, i.roomRent, i.messCharges, i.laundryCharges, i.gst, i.total, i.status, i.date])
    downloadText('staynest-invoices.csv', [headers, ...rows].map((r) => r.join(',')).join('\n'))
  }
  function exportRegs() {
    const headers = ['Name', 'Email', 'Mobile', 'Gender', 'Aadhaar', 'Occupation', 'Room Pref', 'Status', 'Date']
    const rows = db.registrations.map((r) => [r.fullName, r.email, r.mobile, r.gender, r.aadhaar, r.occupation, r.roomPreference, r.status, formatDate(r.createdAt)])
    downloadText('staynest-registrations.csv', [headers, ...rows].map((r) => r.join(',')).join('\n'))
  }

  const stats = [
    { label: 'Total Revenue', value: formatINR(totalRevenue), icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
    { label: 'Occupancy', value: `${occupancy}%`, icon: Home, color: 'from-indigo-500 to-violet-500' },
    { label: 'Pending Approvals', value: String(pendingRegs), icon: Users, color: 'from-amber-500 to-orange-500' },
    { label: 'Open Complaints', value: String(openComplaints), icon: AlertCircle, color: 'from-rose-500 to-red-500' },
  ]

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">Welcome back, {db.user.name}</p>
          </div>
          <Button variant="ghost" onClick={() => { if (confirm('Reset all demo data?')) resetDB() }} className="text-slate-500">Reset Demo Data</Button>
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
                {stats.map((s) => (
                  <Card key={s.label} className="p-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
                    <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-sm text-slate-500">{s.label}</p>
                  </Card>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900">Recent Registrations</h3><button onClick={() => setTab('registrations')} className="text-sm text-indigo-600 font-medium">View all</button></div>
                  <div className="space-y-3">{db.registrations.slice(0, 4).map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div><p className="font-medium text-slate-900 text-sm">{r.fullName}</p><p className="text-xs text-slate-500">{r.roomPreference}</p></div>
                      <Badge color={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'rose' : 'amber'}>{r.status}</Badge>
                    </div>
                  ))}</div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900">Recent Complaints</h3><button onClick={() => setTab('complaints')} className="text-sm text-indigo-600 font-medium">View all</button></div>
                  <div className="space-y-3">{db.complaints.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div><p className="font-medium text-slate-900 text-sm">{c.subject}</p><p className="text-xs text-slate-500 capitalize">{c.category} • {c.residentName}</p></div>
                      <Badge color={c.status === 'resolved' ? 'green' : c.status === 'assigned' ? 'indigo' : 'amber'}>{c.status}</Badge>
                    </div>
                  ))}</div>
                </Card>
              </div>
            </div>
          )}

          {tab === 'registrations' && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="font-bold text-slate-900">All Registrations ({db.registrations.length})</h3><Button size="sm" variant="ghost" onClick={exportRegs}><FileSpreadsheet className="w-4 h-4" /> Export CSV</Button></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 text-slate-600 text-left"><th className="p-4 font-semibold">Resident</th><th className="p-4 font-semibold">Contact</th><th className="p-4 font-semibold">Room Pref</th><th className="p-4 font-semibold">Date</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Actions</th></tr></thead>
                  <tbody>
                    {db.registrations.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="p-4"><p className="font-medium text-slate-900">{r.fullName}</p><p className="text-xs text-slate-500">{r.gender} • {r.occupation}</p></td>
                        <td className="p-4"><p className="text-slate-700">{r.mobile}</p><p className="text-xs text-slate-500">{r.email}</p></td>
                        <td className="p-4 text-slate-700">{r.roomPreference}</td>
                        <td className="p-4 text-slate-600">{formatDate(r.createdAt)}</td>
                        <td className="p-4"><Badge color={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'rose' : 'amber'}>{r.status}</Badge></td>
                        <td className="p-4"><div className="flex gap-1">{r.status === 'pending' && <><button onClick={() => approveReg(r.id)} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center"><Check className="w-4 h-4" /></button><button onClick={() => rejectReg(r.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center"><X className="w-4 h-4" /></button></>}<button onClick={() => deleteReg(r.id)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === 'rooms' && (
            <div className="grid lg:grid-cols-2 gap-4">
              {db.rooms.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div><p className="font-bold text-slate-900">{r.name}</p><p className="text-xs text-slate-500 capitalize">{r.pg} • {r.seater} seater • {r.ac === 'ac' ? 'AC' : 'Non-AC'}</p></div>
                    <Badge color={r.totalBeds - r.occupiedBeds > 0 ? 'green' : 'rose'}>{r.totalBeds - r.occupiedBeds} avail</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block"><span className="text-xs text-slate-500 font-medium">Rent (₹/mo)</span><input type="number" value={r.rent} onChange={(e) => setRoomPrice(r.id, Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" /></label>
                    <label className="block"><span className="text-xs text-slate-500 font-medium">Occupied / {r.totalBeds}</span><input type="number" min={0} max={r.totalBeds} value={r.occupiedBeds} onChange={(e) => setOccupancy(r.id, Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" /></label>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Deposit: {formatINR(r.deposit)}</p>
                </Card>
              ))}
            </div>
          )}

          {tab === 'payments' && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100"><h3 className="font-bold text-slate-900">Payment Invoices ({db.invoices.length})</h3><Button size="sm" variant="ghost" onClick={exportCSV}><FileSpreadsheet className="w-4 h-4" /> Export CSV</Button></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 text-slate-600 text-left"><th className="p-4 font-semibold">Invoice</th><th className="p-4 font-semibold">Resident</th><th className="p-4 font-semibold">Room</th><th className="p-4 font-semibold">Total</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Date</th></tr></thead>
                  <tbody>{db.invoices.map((i) => (
                    <tr key={i.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs text-slate-700">{i.invoiceNo}</td>
                      <td className="p-4 text-slate-900 font-medium">{i.residentName}</td>
                      <td className="p-4 text-slate-600">{i.roomName}</td>
                      <td className="p-4 font-bold text-slate-900">{formatINR(i.total)}</td>
                      <td className="p-4"><Badge color={i.status === 'paid' ? 'green' : i.status === 'pending' ? 'amber' : 'rose'}>{i.status}</Badge></td>
                      <td className="p-4 text-slate-600">{formatDate(i.date)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === 'complaints' && (
            <div className="grid lg:grid-cols-2 gap-4">
              {db.complaints.map((c) => (
                <Card key={c.id} className="p-5">
                  <div className="flex items-start justify-between mb-2"><div><p className="font-bold text-slate-900">{c.subject}</p><p className="text-xs text-slate-500 capitalize">{c.category} • {c.residentName}</p></div><Badge color={c.status === 'resolved' ? 'green' : c.status === 'assigned' ? 'indigo' : 'amber'}>{c.status}</Badge></div>
                  <p className="text-sm text-slate-600 mt-2">{c.description}</p>
                  <p className="text-xs text-slate-400 mt-2">Filed: {formatDate(c.createdAt)}{c.assignedTo && ` • Assigned: ${c.assignedTo}`}</p>
                  <div className="mt-3 flex gap-2">
                    {c.status === 'open' && <Select className="text-sm py-1.5" onChange={(e) => assignComplaint(c.id, e.target.value)} value=""><option value="">Assign to...</option><option>Maintenance Team</option><option>Housekeeping</option><option>Electrician</option><option>Plumber</option></Select>}
                    {c.status !== 'resolved' && <Button size="sm" onClick={() => resolveComplaint(c.id)}><Check className="w-4 h-4" /> Resolve</Button>}
                  </div>
                </Card>
              ))}
              {db.complaints.length === 0 && <p className="text-slate-500 text-center py-10">No complaints yet.</p>}
            </div>
          )}

          {tab === 'laundry' && (
            <Card className="overflow-hidden">
              <h3 className="font-bold text-slate-900 p-5 border-b border-slate-100">Laundry Requests ({db.laundry.length})</h3>
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-slate-600 text-left"><th className="p-4 font-semibold">Resident</th><th className="p-4 font-semibold">Items</th><th className="p-4 font-semibold">Date</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Update</th></tr></thead>
                <tbody>{db.laundry.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100">
                    <td className="p-4 font-medium text-slate-900">{l.residentName}</td>
                    <td className="p-4 text-slate-700">{l.items} items</td>
                    <td className="p-4 text-slate-600">{formatDate(l.createdAt)}</td>
                    <td className="p-4"><Badge color={l.status === 'delivered' ? 'green' : l.status === 'in-progress' ? 'indigo' : 'amber'}>{l.status}</Badge></td>
                    <td className="p-4"><Select className="text-sm py-1.5 w-40" value={l.status} onChange={(e) => updateLaundry(l.id, e.target.value)}><option value="requested">Requested</option><option value="in-progress">In Progress</option><option value="delivered">Delivered</option></Select></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </Card>
          )}

          {tab === 'broadcast' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4"><MessageCircle className="w-5 h-5 text-emerald-500" /><h3 className="font-bold text-slate-900">WhatsApp Broadcast</h3></div>
                <Textarea label="Message" rows={5} placeholder="Dear residents, tomorrow's menu has been updated..." defaultValue="" id="wa-msg" />
                <Button className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400" onClick={() => { const v = (document.getElementById('wa-msg') as HTMLTextAreaElement).value; window.open(`https://wa.me/${PG_INFO.whatsapp}?text=${encodeURIComponent(v)}`) }}><Send className="w-4 h-4" /> Send Broadcast</Button>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4"><Mail className="w-5 h-5 text-indigo-500" /><h3 className="font-bold text-slate-900">Email Broadcast</h3></div>
                <Input label="Subject" placeholder="Important announcement" id="email-sub" />
                <div className="mt-3"><Textarea label="Body" rows={4} placeholder="Dear residents..." id="email-body" /></div>
                <Button className="mt-3 w-full" onClick={() => alert('Email broadcast sent to all residents!')}><Send className="w-4 h-4" /> Send Email</Button>
              </Card>
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-5"><div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Revenue</div><p className="text-2xl font-bold text-slate-900">{formatINR(totalRevenue)}</p></Card>
                <Card className="p-5"><div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><Home className="w-4 h-4" /> Occupancy</div><p className="text-2xl font-bold text-slate-900">{occupiedBeds}/{totalBeds} beds</p></Card>
                <Card className="p-5"><div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><Users className="w-4 h-4" /> Residents</div><p className="text-2xl font-bold text-slate-900">{db.registrations.filter((r) => r.status === 'approved').length}</p></Card>
              </div>
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Room Occupancy Report</h3>
                <div className="space-y-3">{db.rooms.map((r) => (
                  <div key={r.id}><div className="flex justify-between text-sm mb-1"><span className="text-slate-700">{r.name}</span><span className="text-slate-500">{r.occupiedBeds}/{r.totalBeds}</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${(r.occupiedBeds / r.totalBeds) * 100}%` }} /></div></div>
                ))}</div>
              </Card>
              <div className="flex gap-3"><Button onClick={exportCSV}><Download className="w-4 h-4" /> Export Invoices</Button><Button variant="outline" className="border-slate-300 text-slate-900" onClick={exportRegs}><Download className="w-4 h-4" /> Export Registrations</Button></div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
