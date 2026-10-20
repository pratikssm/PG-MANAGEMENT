import type { MenuItem, Room } from './data'

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
  menu: MenuItem[]
  user: AuthUser | null
  loading: boolean
  error: string | null
}

let state: DB = {
  rooms: [],
  registrations: [],
  invoices: [],
  complaints: [],
  laundry: [],
  menu: [],
  user: null,
  loading: true,
  error: null,
}

export const store = {
  get(): DB {
    return state
  },
  set(next: DB) {
    state = next
    listeners.forEach((cb) => cb())
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
