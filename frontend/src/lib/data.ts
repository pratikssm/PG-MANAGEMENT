import roomSingle from '/images/room-single.jpg'
import roomShared from '/images/room-shared.jpg'
import diningImg from '/images/dining.jpg'
import gymImg from '/images/gym.jpg'
import laundryImg from '/images/laundry.jpg'
import loungeImg from '/images/lounge.jpg'
import studyImg from '/images/study.jpg'
import bathroomImg from '/images/bathroom.jpg'
import receptionImg from '/images/reception.jpg'
import heroImg from '/images/hero-building.jpg'

export const IMAGES = {
  hero: heroImg,
  roomSingle,
  roomShared,
  dining: diningImg,
  gym: gymImg,
  laundry: laundryImg,
  lounge: loungeImg,
  study: studyImg,
  bathroom: bathroomImg,
  reception: receptionImg,
}

export type RoomType = 'single' | 'double' | 'triple' | 'quad'
export type PGType = 'boys' | 'girls'
export type ACCType = 'ac' | 'nonac'

export interface Room {
  id: string
  pg: PGType
  type: RoomType
  seater: number
  ac: ACCType
  name: string
  rent: number
  deposit: number
  totalBeds: number
  occupiedBeds: number
  images: string[]
  video: string
  description: string
  facilities: string[]
}

const baseFacilities = [
  'WiFi', 'Study Table', 'Wardrobe', 'Power Backup', 'CCTV', 'Housekeeping',
]

function buildRooms(): Room[] {
  const rooms: Room[] = []
  const types: { type: RoomType; seater: number; label: string }[] = [
    { type: 'single', seater: 1, label: 'Single Seater' },
    { type: 'double', seater: 2, label: 'Double Seater' },
    { type: 'triple', seater: 3, label: 'Triple Seater' },
    { type: 'quad', seater: 4, label: 'Four Seater' },
  ]
  const pgs: PGType[] = ['boys', 'girls']
  const accs: ACCType[] = ['ac', 'nonac']
  let idx = 1
  for (const pg of pgs) {
    for (const t of types) {
      for (const ac of accs) {
        const baseRent = t.seater === 1 ? 12000 : t.seater === 2 ? 9000 : t.seater === 3 ? 7000 : 5500
        const rent = ac === 'ac' ? baseRent + 2500 : baseRent
        const deposit = rent * 2
        const totalBeds = t.seater === 1 ? 8 : 6
        const occupied = Math.floor(Math.random() * (totalBeds + 1))
        rooms.push({
          id: `room-${idx++}`,
          pg,
          type: t.type,
          seater: t.seater,
          ac,
          name: `${t.label} ${ac === 'ac' ? 'AC' : 'Non-AC'} - ${pg === 'boys' ? 'Boys' : 'Girls'}`,
          rent,
          deposit,
          totalBeds,
          occupiedBeds: occupied,
          images: [t.seater === 1 ? roomSingle : roomShared, loungeImg, bathroomImg],
          video: '/video/tour.mp4',
          description: `Premium ${t.label.toLowerCase()} ${ac === 'ac' ? 'air-conditioned' : 'non-AC'} room designed for ${pg === 'boys' ? 'boys' : 'girls'} with modern furniture, ergonomic study desks, spacious wardrobes, and 24x7 security. Includes high-speed WiFi, regular housekeeping, and uninterrupted power backup for a comfortable and productive stay.`,
          facilities: ac === 'ac' ? [...baseFacilities, 'AC', 'Geyser'] : [...baseFacilities, 'Cooler', 'Geyser'],
        })
      }
    }
  }
  return rooms
}

export const ROOMS: Room[] = buildRooms()

export interface Facility {
  name: string
  icon: string
  description: string
}

export const FACILITIES: Facility[] = [
  { name: 'High-Speed WiFi', icon: 'Wifi', description: 'Dedicated 100 Mbps fiber internet across all floors and common areas.' },
  { name: 'Air Conditioning', icon: 'Snowflake', description: 'Premium AC rooms with climate control for year-round comfort.' },
  { name: 'Air Cooler', icon: 'Wind', description: 'Economical cooler options available in non-AC rooms.' },
  { name: 'Geyser', icon: 'Flame', description: '24x7 hot water supply in all bathrooms.' },
  { name: 'RO Water', icon: 'Droplets', description: 'Purified drinking water with multi-stage RO filtration.' },
  { name: 'CCTV Surveillance', icon: 'Cctv', description: 'HD cameras monitoring all entrances, corridors and common areas.' },
  { name: 'Biometric Entry', icon: 'Fingerprint', description: 'Secure fingerprint-based access for residents only.' },
  { name: 'Power Backup', icon: 'BatteryCharging', description: 'Full power backup for lights, fans, WiFi and common areas.' },
  { name: 'Housekeeping', icon: 'Sparkles', description: 'Daily room and bathroom cleaning by trained staff.' },
  { name: 'Laundry', icon: 'WashingMachine', description: 'On-premise washing machines with weekly laundry service.' },
  { name: 'Ironing', icon: 'Shirt', description: 'Shared ironing facility available on every floor.' },
  { name: 'Study Table', icon: 'BookOpen', description: 'Ergonomic study desks with reading lamp in every room.' },
  { name: 'Wardrobe', icon: 'Archive', description: 'Personal lockable wardrobe for each resident.' },
  { name: 'Lift', icon: 'ArrowUpDown', description: 'High-speed elevators with 24x7 operation.' },
  { name: 'Parking', icon: 'Car', description: 'Secure covered parking for two-wheelers and bicycles.' },
  { name: 'Common Area', icon: 'Sofa', description: 'Spacious common lounge for relaxation and socializing.' },
  { name: 'Gym', icon: 'Dumbbell', description: 'Fully-equipped fitness center with cardio and strength equipment.' },
  { name: 'Indoor Games', icon: 'Gamepad2', description: 'Carrom, chess, table tennis and board games.' },
  { name: 'TV Lounge', icon: 'Tv', description: 'Large-screen TV lounge with streaming subscriptions.' },
  { name: 'Medical Assistance', icon: 'Stethoscope', description: 'On-call doctor and first-aid support round the clock.' },
  { name: 'Emergency Support', icon: 'Siren', description: '24x7 emergency helpline and warden support.' },
]

export interface MenuItem {
  day: string
  breakfast: string
  lunch: string
  dinner: string
}

export const WEEKLY_MENU: MenuItem[] = [
  { day: 'Monday', breakfast: 'Poha, Boiled Eggs, Banana, Tea/Coffee', lunch: 'Rajma, Steamed Rice, Roti, Salad, Curd', dinner: 'Paneer Butter Masala, Roti, Jeera Rice, Gulab Jamun' },
  { day: 'Tuesday', breakfast: 'Idli Sambar, Coconut Chutney, Tea/Coffee', lunch: 'Chole, Bhature, Boondi Raita, Salad', dinner: 'Veg Biryani, Mirchi Ka Salan, Papad' },
  { day: 'Wednesday', breakfast: 'Aloo Paratha, Curd, Pickle, Tea/Coffee', lunch: 'Dal Tadka, Rice, Roti, Bhindi Fry, Buttermilk', dinner: 'Chicken Curry (Non-Veg), Roti, Rice, Salad' },
  { day: 'Thursday', breakfast: 'Upma, Peanuts, Fruits, Tea/Coffee', lunch: 'Kadhai Paneer, Roti, Rice, Kheer', dinner: 'Mix Dal, Roti, Rice, Aloo Gobi, Salad' },
  { day: 'Friday', breakfast: 'Masala Dosa, Sambar, Chutney, Tea/Coffee', lunch: 'Chana Masala, Rice, Roti, Cucumber Raita', dinner: 'Veg Pulao, Shahi Paneer, Roti, Ice Cream' },
  { day: 'Saturday', breakfast: 'Puri Bhaji, Fruits, Tea/Coffee', lunch: 'Veg Thali (5 Items), Roti, Rice, Papad', dinner: 'Egg Curry (Non-Veg), Roti, Rice, Salad' },
  { day: 'Sunday', breakfast: 'Chole Kulche, Lassi, Fruits', lunch: 'Special Biryani, Raita, Papad, Sweet', dinner: 'Paneer Tikka, Butter Naan, Dal Makhani, Halwa' },
]

export const DIET_PLANS = [
  { name: 'Veg Diet', desc: 'Pure vegetarian balanced meals with protein-rich legumes and dairy.', price: 0 },
  { name: 'Non-Veg Diet', desc: 'Includes chicken, eggs and fish options on select days.', price: 800 },
  { name: 'Special Diet', desc: 'Customized high-protein meals for active individuals.', price: 1200 },
  { name: 'Gym Diet', desc: 'High-protein, low-carb meals with boiled eggs, chicken and paneer.', price: 1500 },
  { name: 'Weight Loss Diet', desc: 'Calorie-controlled meals with salads, soups and grilled items.', price: 1300 },
  { name: 'Diabetic Diet', desc: 'Low-sugar, low-GI meals with millets and steamed preparations.', price: 1400 },
]

export const MESS_CHARGES = 3500

export interface Testimonial {
  name: string
  role: string
  image: string
  rating: number
  text: string
}

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Aarav Sharma', role: 'B.Tech Student, IIT Delhi', image: '/images/testimonial-3.jpg', rating: 5, text: 'StayNest has been my home for two years. The rooms are spotless, WiFi is blazing fast, and the food feels like home-cooked. Best PG experience in the city.' },
  { name: 'Priya Verma', role: 'Software Engineer, Tech Mahindra', image: '/images/testimonial-2.jpg', rating: 5, text: 'As a working professional, safety and hygiene matter most. StayNest delivers on both with biometric entry, CCTV, and daily housekeeping. Highly recommended.' },
  { name: 'Sneha Reddy', role: 'MBA Student, IIM Bangalore', image: '/images/testimonial-1.jpg', rating: 5, text: 'The gym, study lounge, and common areas are world-class. The mess menu changes weekly and the gym diet plan helped me stay fit during exams.' },
]

export interface FAQ {
  q: string
  a: string
}

export const FAQS: FAQ[] = [
  { q: 'What documents are required for registration?', a: 'You need a valid Aadhaar card (front and back), a profile photo, college/company ID proof, and emergency contact details. All uploads can be done online during registration.' },
  { q: 'Is the security deposit refundable?', a: 'Yes, the security deposit is fully refundable at the time of checkout, subject to deduction of any pending dues or damages beyond normal wear and tear.' },
  { q: 'Can I choose my roommate?', a: 'Yes, you can request a specific roommate during booking. Both residents must mutually confirm the request for it to be approved.' },
  { q: 'Are meals included in the rent?', a: 'Mess charges are billed separately at Rs. 3,500/month. You can opt for specialized diet plans at an additional cost. Today\'s menu is updated daily.' },
  { q: 'What are the visitation and entry timings?', a: 'Residents have 24x7 biometric access. Visitors are allowed between 9 AM and 9 PM with prior approval at the reception. Late entry requires warden intimation.' },
  { q: 'How is maintenance handled?', a: 'You can raise complaints through the resident dashboard under categories like food, room, electricity, water, and laundry. Our team resolves issues within 24 hours.' },
  { q: 'Do you provide laundry service?', a: 'Yes, weekly laundry service is available. You can also use on-premise washing machines. Laundry requests can be tracked through your dashboard.' },
  { q: 'Is there a notice period for vacating?', a: 'A 30-day notice period is required before vacating. This helps us process your deposit refund and prepare the room for the next resident.' },
]

export const GALLERY = [
  { type: 'image' as const, src: heroImg, title: 'Building Exterior' },
  { type: 'image' as const, src: loungeImg, title: 'Common Lounge' },
  { type: 'image' as const, src: diningImg, title: 'Dining Hall' },
  { type: 'image' as const, src: gymImg, title: 'Fitness Center' },
  { type: 'image' as const, src: studyImg, title: 'Study Room' },
  { type: 'image' as const, src: laundryImg, title: 'Laundry Area' },
  { type: 'image' as const, src: roomSingle, title: 'Single Room' },
  { type: 'image' as const, src: roomShared, title: 'Shared Room' },
  { type: 'image' as const, src: bathroomImg, title: 'Bathroom' },
  { type: 'image' as const, src: receptionImg, title: 'Reception' },
  { type: 'video' as const, src: '/video/tour.mp4', title: 'Property Tour' },
  { type: 'image' as const, src: '/images/food-thali.jpg', title: 'Mess Food' },
]

export const PG_INFO = {
  name: 'StayNest',
  fullName: 'StayNest Premium PG Management System',
  tagline: 'Premium Co-Living Spaces for Students & Professionals',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'hello@staynest.in',
  address: '42, Knowledge Park, Sector 18, Noida, Uttar Pradesh 201301',
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.074!2d77.3188!3d28.5244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3c3abcdef%3A0x123!2sSector%2018%20Noida!5e0!3m2!1sen!2sin!4v1700000000000',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Sector+18+Noida',
}
