import { ROOMS, MESS_CHARGES, type Room } from './data'
import { generateInvoiceNo } from './utils'

export interface Registration {
  id: string
  fullName: string
  parentName: string
  parentMobile: string
  mobile: string
  alternateMobile: string
  email: string
  gender: 'male' | 'female'
  dob: string
  aadhaar: string
  occupation: string
  organization: string
  address: string
  city: string
  state: string
  pincode: string
  emergencyContact: string
  roomPreference: string
  acPreference: 'ac' | 'nonac'
  mess: boolean
  laundry: boolean
  joiningDate: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNo: string
  residentId: string
  residentName: string
  roomName: string
  roomRent: number
  messCharges: number
  laundryCharges: number
  gst: number
  total: number
  status: 'paid' | 'pending' | 'overdue'
  date: string
  period: string
}

export interface Complaint {
  id: string
  residentId: string
  residentName: string
  category: 'food' | 'room' | 'electricity' | 'water' | 'laundry' | 'other'
  subject: string
  description: string
  status: 'open' | 'assigned' | 'resolved'
  assignedTo: string
  createdAt: string
}

export interface LaundryRequest {
  id: string
  residentId: string
  residentName: string
  items: number
  status: 'requested' | 'in-progress' | 'delivered'
  createdAt: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'resident'
  residentId?: string
}

export interface DB {
  rooms: Room[]
  registrations: Registration[]
  invoices: Invoice[]
  complaints: Complaint[]
  laundry: LaundryRequest[]
  user: AuthUser | null
}

const KEY = 'staynest_db_v1'

function seedDB(): DB {
  const demoResident: Registration = {
    id: 'reg-demo',
    fullName: 'Rahul Mehta',
    parentName: 'Suresh Mehta',
    parentMobile: '+91 98111 11111',
    mobile: '+91 99000 00001',
    alternateMobile: '+91 99000 00002',
    email: 'rahul.mehta@staynest.in',
    gender: 'male',
    dob: '2000-05-14',
    aadhaar: 'XXXX-XXXX-1234',
    occupation: 'Student',
    organization: 'Delhi University',
    address: '12 MG Road',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    emergencyContact: '+91 98111 11111',
    roomPreference: 'Double Seater AC - Boys',
    acPreference: 'ac',
    mess: true,
    laundry: true,
    joiningDate: '2024-08-01',
    status: 'approved',
    createdAt: '2024-07-20T10:00:00Z',
  }

  const demoInvoice: Invoice = {
    id: 'inv-demo',
    invoiceNo: generateInvoiceNo(),
    residentId: 'reg-demo',
    residentName: 'Rahul Mehta',
    roomName: 'Double Seater AC - Boys',
    roomRent: 11500,
    messCharges: MESS_CHARGES,
    laundryCharges: 500,
    gst: 2700,
    total: 18200,
    status: 'paid',
    date: '2024-12-01',
    period: 'December 2024',
  }

  const demoComplaint: Complaint = {
    id: 'cmp-demo',
    residentId: 'reg-demo',
    residentName: 'Rahul Mehta',
    category: 'electricity',
    subject: 'Power fluctuation in room',
    description: 'There is frequent power fluctuation in room 204 affecting my laptop charger.',
    status: 'assigned',
    assignedTo: 'Maintenance Team',
    createdAt: '2024-12-10T09:30:00Z',
  }

  return {
    rooms: ROOMS.map((r) => ({ ...r })),
    registrations: [demoResident],
    invoices: [demoInvoice],
    complaints: [demoComplaint],
    laundry: [
      { id: 'lnd-demo', residentId: 'reg-demo', residentName: 'Rahul Mehta', items: 8, status: 'delivered', createdAt: '2024-12-08T08:00:00Z' },
    ],
    user: null,
  }
}

let cache: DB | null = null

function load(): DB {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      cache = JSON.parse(raw)
      return cache!
    }
  } catch {
    // ignore
  }
  cache = seedDB()
  save(cache)
  return cache
}

function save(db: DB) {
  cache = db
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // ignore
  }
}

export const store = {
  get(): DB {
    return load()
  },
  set(updater: (db: DB) => DB) {
    const db = load()
    const next = updater(db)
    save(next)
    return next
  },
  reset() {
    cache = seedDB()
    save(cache)
    return cache
  },
  subscribe(cb: () => void) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}

const listeners = new Set<() => void>()

export function notify() {
  listeners.forEach((cb) => cb())
}

export function useDB(): DB {
  return store.get()
}
