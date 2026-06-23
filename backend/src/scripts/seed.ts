import mongoose from 'mongoose';
import { env } from '../config/env';
import { connectDB } from '../config/db';
import User from '../models/User';
import Room from '../models/Room';
import MenuItem from '../models/MenuItem';
import Registration from '../models/Registration';
import { FACILITIES } from '../config/constants';

const weeklyMenu = [
  { day: 'Monday', breakfast: 'Poha, Boiled Eggs, Banana, Tea/Coffee', lunch: 'Rajma, Steamed Rice, Roti, Salad, Curd', dinner: 'Paneer Butter Masala, Roti, Jeera Rice, Gulab Jamun' },
  { day: 'Tuesday', breakfast: 'Idli Sambar, Coconut Chutney, Tea/Coffee', lunch: 'Chole, Bhature, Boondi Raita, Salad', dinner: 'Veg Biryani, Mirchi Ka Salan, Papad' },
  { day: 'Wednesday', breakfast: 'Aloo Paratha, Curd, Pickle, Tea/Coffee', lunch: 'Dal Tadka, Rice, Roti, Bhindi Fry, Buttermilk', dinner: 'Chicken Curry (Non-Veg), Roti, Rice, Salad' },
  { day: 'Thursday', breakfast: 'Upma, Peanuts, Fruits, Tea/Coffee', lunch: 'Kadhai Paneer, Roti, Rice, Kheer', dinner: 'Mix Dal, Roti, Rice, Aloo Gobi, Salad' },
  { day: 'Friday', breakfast: 'Masala Dosa, Sambar, Chutney, Tea/Coffee', lunch: 'Chana Masala, Rice, Roti, Cucumber Raita', dinner: 'Veg Pulao, Shahi Paneer, Roti, Ice Cream' },
  { day: 'Saturday', breakfast: 'Puri Bhaji, Fruits, Tea/Coffee', lunch: 'Veg Thali (5 Items), Roti, Rice, Papad', dinner: 'Egg Curry (Non-Veg), Roti, Rice, Salad' },
  { day: 'Sunday', breakfast: 'Chole Kulche, Lassi, Fruits', lunch: 'Special Biryani, Raita, Papad, Sweet', dinner: 'Paneer Tikka, Butter Naan, Dal Makhani, Halwa' },
];

const baseFacilities = ['WiFi', 'Study Table', 'Wardrobe', 'Power Backup', 'CCTV', 'Housekeeping'];

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany({}), Room.deleteMany({}), MenuItem.deleteMany({}), Registration.deleteMany({})]);

  console.log('Creating admin user...');
  await User.create({
    name: 'Admin',
    email: 'admin@staynest.in',
    password: 'admin123',
    phone: '+919876543210',
    role: 'admin',
    isEmailVerified: true,
  });

  console.log('Creating demo resident...');
  const resident = await Registration.create({
    fullName: 'Rahul Mehta',
    parentName: 'Suresh Mehta',
    parentMobile: '+919811111111',
    mobile: '+919900000001',
    alternateMobile: '+919900000002',
    email: 'rahul.mehta@staynest.in',
    gender: 'male',
    dob: '2000-05-14',
    aadhaar: '1234-5678-9012',
    occupation: 'Student',
    organization: 'Delhi University',
    address: '12 MG Road',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    emergencyContact: '+919811111111',
    roomPreference: 'Double Seater AC - Boys',
    acPreference: 'ac',
    mess: true,
    laundry: true,
    joiningDate: '2024-08-01',
    status: 'approved',
  });

  await User.create({
    name: 'Rahul Mehta',
    email: 'rahul.mehta@staynest.in',
    password: 'resident123',
    phone: '+919900000001',
    role: 'resident',
    isEmailVerified: true,
    registrationId: resident._id,
  });

  console.log('Creating rooms...');
  const types = [
    { type: 'single', seater: 1, label: 'Single Seater' },
    { type: 'double', seater: 2, label: 'Double Seater' },
    { type: 'triple', seater: 3, label: 'Triple Seater' },
    { type: 'quad', seater: 4, label: 'Four Seater' },
  ] as const;
  const pgs = ['boys', 'girls'] as const;
  const accs = ['ac', 'nonac'] as const;

  for (const pg of pgs) {
    for (const t of types) {
      for (const ac of accs) {
        const baseRent = t.seater === 1 ? 12000 : t.seater === 2 ? 9000 : t.seater === 3 ? 7000 : 5500;
        const rent = ac === 'ac' ? baseRent + 2500 : baseRent;
        await Room.create({
          pg, type: t.type, seater: t.seater, ac,
          name: `${t.label} ${ac === 'ac' ? 'AC' : 'Non-AC'} - ${pg === 'boys' ? 'Boys' : 'Girls'}`,
          rent, deposit: rent * 2,
          totalBeds: t.seater === 1 ? 8 : 6,
          occupiedBeds: Math.floor(Math.random() * (t.seater === 1 ? 9 : 7)),
          images: ['/images/room-single.jpg', '/images/lounge.jpg', '/images/bathroom.jpg'],
          video: '/video/tour.mp4',
          description: `Premium ${t.label.toLowerCase()} ${ac === 'ac' ? 'air-conditioned' : 'non-AC'} room designed for ${pg} with modern furniture, ergonomic study desks, spacious wardrobes, and 24x7 security.`,
          facilities: ac === 'ac' ? [...baseFacilities, 'AC', 'Geyser'] : [...baseFacilities, 'Cooler', 'Geyser'],
        });
      }
    }
  }

  console.log('Creating weekly menu...');
  await MenuItem.insertMany(weeklyMenu);

  console.log('\n✅ Seed completed successfully!');
  console.log('Admin login: admin@staynest.in / admin123');
  console.log('Resident login: rahul.mehta@staynest.in / resident123');
  console.log(`Total rooms: ${await Room.countDocuments()}`);
  console.log(`Total menu items: ${await MenuItem.countDocuments()}`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
