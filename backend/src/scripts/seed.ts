import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import User from '../models/User';
import Room from '../models/Room';
import MenuItem from '../models/MenuItem';
import Registration from '../models/Registration';

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
  if (process.env.NODE_ENV !== 'production') {
    console.log('Ensuring development demo accounts exist...');
    if (!await User.exists({ email: 'admin@staynest.in' })) {
      await User.create({
        name: 'Admin',
        email: 'admin@staynest.in',
        password: 'admin123',
        phone: '+919876543210',
        role: 'admin',
        isEmailVerified: true,
      });
    }

    const resident = await Registration.findOneAndUpdate(
      { email: 'rahul.mehta@staynest.in' },
      { $setOnInsert: {
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
      } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    let residentUser = await User.findOne({ email: 'rahul.mehta@staynest.in' });
    if (!residentUser) {
      residentUser = await User.create({
        name: 'Rahul Mehta',
        email: 'rahul.mehta@staynest.in',
        password: 'resident123',
        phone: '+919900000001',
        role: 'resident',
        isEmailVerified: true,
      });
    }
    resident.userId = residentUser._id;
    await resident.save();
    if (!residentUser.registrationId || residentUser.registrationId.toString() !== resident._id.toString()) {
      residentUser.registrationId = resident._id;
      await residentUser.save();
    }
  }

  console.log('Creating rooms...');
  const types = [
    { type: 'single', seater: 1, label: 'Single Seater' },
    { type: 'double', seater: 2, label: 'Double Seater' },
    { type: 'triple', seater: 3, label: 'Triple Seater' },
    { type: 'quad', seater: 4, label: 'Four Seater' },
  ] as const;
  const pgs = ['boys', 'girls'] as const;
  const accs = ['ac', 'nonac'] as const;
  const defaultRoomImages = ['/images/room-single.jpg', '/images/lounge.jpg', '/images/bathroom.jpg'];

  for (const pg of pgs) {
    for (const t of types) {
      for (const ac of accs) {
        const baseRent = t.seater === 1 ? 12000 : t.seater === 2 ? 9000 : t.seater === 3 ? 7000 : 5500;
        const rent = ac === 'ac' ? baseRent + 2500 : baseRent;
        const name = `${t.label} ${ac === 'ac' ? 'AC' : 'Non-AC'} - ${pg === 'boys' ? 'Boys' : 'Girls'}`;
        const images = [
          t.seater === 1 ? '/images/room-single.jpg' : '/images/room-shared.jpg',
          '/images/lounge.jpg',
          '/images/bathroom.jpg',
        ];
        if (t.seater > 1) {
          await Room.findOneAndUpdate(
            { name, images: defaultRoomImages },
            { $set: { images } },
          );
        }
        await Room.findOneAndUpdate({ name }, {
          $setOnInsert: {
            pg, type: t.type, seater: t.seater, ac, name,
            rent, deposit: rent * 2,
            totalBeds: t.seater === 1 ? 8 : 6,
            occupiedBeds: 0,
            images,
            video: '/video/tour.mp4',
            description: `Premium ${t.label.toLowerCase()} ${ac === 'ac' ? 'air-conditioned' : 'non-AC'} room designed for ${pg} with modern furniture, ergonomic study desks, spacious wardrobes, and 24x7 security.`,
            facilities: ac === 'ac' ? [...baseFacilities, 'AC', 'Geyser'] : [...baseFacilities, 'Cooler', 'Geyser'],
          },
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
      }
    }
  }

  console.log('Creating weekly menu...');
  for (const item of weeklyMenu) {
    await MenuItem.findOneAndUpdate({ day: item.day }, { $setOnInsert: item }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  console.log('\n✅ Seed completed successfully!');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Development admin login: admin@staynest.in / admin123');
    console.log('Development resident login: rahul.mehta@staynest.in / resident123');
  }
  console.log(`Total rooms: ${await Room.countDocuments()}`);
  console.log(`Total menu items: ${await MenuItem.countDocuments()}`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
