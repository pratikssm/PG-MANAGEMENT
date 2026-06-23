# StayNest Backend API

Production-ready Express + TypeScript + MongoDB backend for StayNest Premium PG Management System.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Open `.env` and fill in your credentials (see below for where to get each).

### 3. Seed Database
```bash
npm run seed
```
This creates: Admin user, demo resident, 16 rooms, and weekly menu.

### 4. Start Development Server
```bash
npm run dev
```
Server runs at `http://localhost:5000`

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Default Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@staynest.in` | `admin123` |
| Resident | `rahul.mehta@staynest.in` | `resident123` |

---

## 🌐 API Endpoints

### Auth (`/api/auth`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/signup` | Public | Register new user |
| POST | `/login` | Public | Login with email/password |
| POST | `/logout` | Public | Clear auth cookie |
| GET | `/me` | Auth | Get current user |
| POST | `/otp/request` | Public | Request email OTP |
| POST | `/otp/verify` | Public | Verify email OTP |
| POST | `/google` | Public | Google OAuth login |

### Rooms (`/api/rooms`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List rooms (filters: pg, ac, seater, sort, maxPrice) |
| GET | `/:id` | Public | Get single room |
| POST | `/` | Admin | Create room |
| PUT | `/:id` | Admin | Update room |
| DELETE | `/:id` | Admin | Delete room |
| PATCH | `/:id/pricing` | Admin | Update rent & deposit |
| PATCH | `/:id/occupancy` | Admin | Update occupied beds |

### Registrations (`/api/registrations`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Public | Submit registration (sends WhatsApp + Email + SMS) |
| GET | `/` | Admin | List all registrations |
| GET | `/me` | Resident | Get my registration |
| PATCH | `/:id/approve` | Admin | Approve registration |
| PATCH | `/:id/reject` | Admin | Reject registration |
| DELETE | `/:id` | Admin | Delete registration |

### Invoices (`/api/invoices`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Auth | List invoices (residents see own) |
| GET | `/export/csv` | Admin | Export CSV |
| GET | `/:id` | Auth | Get invoice |
| GET | `/:id/pdf` | Auth | Download PDF invoice |
| POST | `/` | Admin | Create invoice |
| PATCH | `/:id/pay` | Auth | Mark as paid |

### Payments (`/api/payments`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/key` | Auth | Get Razorpay key |
| POST | `/order` | Auth | Create Razorpay order |
| POST | `/verify` | Auth | Verify payment & generate invoice |

### Complaints (`/api/complaints`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Auth | List complaints |
| POST | `/` | Resident | File complaint |
| PATCH | `/:id/assign` | Admin | Assign complaint |
| PATCH | `/:id/resolve` | Admin | Resolve complaint |
| DELETE | `/:id` | Admin | Delete complaint |

### Laundry (`/api/laundry`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Auth | List requests |
| POST | `/` | Resident | Create request |
| PATCH | `/:id` | Admin | Update status |

### Menu (`/api/menu`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | Full weekly menu |
| GET | `/today` | Public | Today's menu |
| POST | `/` | Admin | Create menu item |
| PUT | `/:id` | Admin | Update menu item |

### Uploads (`/api/uploads`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Admin | Upload single file (Cloudinary) |
| POST | `/multiple` | Admin | Upload multiple files |

### Contacts (`/api/contacts`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Public | Submit contact form |
| GET | `/` | Admin | List contacts |
| PATCH | `/:id/resolve` | Admin | Mark resolved |

### Broadcast (`/api/broadcast`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Admin | Send broadcast (whatsapp/email/sms) |

### Reports (`/api/reports`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/dashboard` | Admin | Dashboard stats |
| GET | `/occupancy` | Admin | Occupancy report |
| GET | `/revenue` | Admin | Revenue report |

---

## 🔧 Environment Variables Setup

### MongoDB Atlas (Required)
1. Go to https://cloud.mongodb.com → Create free account
2. Create a cluster (free tier M0)
3. Database Access → Add user → Save username & password
4. Network Access → Allow IP `0.0.0.0/0`
5. Connect → Drivers → Copy connection string
6. Paste as `MONGO_URI`

### Cloudinary (Required for image uploads)
1. Go to https://cloudinary.com → Sign up (free)
2. Dashboard → Copy Cloud Name, API Key, API Secret
3. Paste into `.env`

### Razorpay (Required for payments)
1. Go to https://razorpay.com → Create account
2. Settings → API Keys → Generate Test Key
3. Copy Key ID & Secret into `.env`

### WhatsApp Business API (Optional)
1. Go to https://developers.facebook.com → Meta for Developers
2. Create app → Add WhatsApp product
3. Get Phone Number ID & Access Token
4. Paste into `.env`

### Email SMTP (Optional, for OTP & notifications)
1. Use Gmail: Enable 2FA → Generate App Password
2. Or use services like SendGrid, Mailgun
3. Fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### Twilio SMS (Optional)
1. Go to https://twilio.com → Sign up
2. Get Account SID, Auth Token, Phone Number
3. Paste into `.env`

### Google OAuth (Optional)
1. Go to https://console.cloud.google.com
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Paste Client ID & Secret into `.env`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts          # Environment variables
│   │   ├── db.ts           # MongoDB connection
│   │   ├── cloudinary.ts   # Cloudinary config
│   │   └── constants.ts    # App constants
│   ├── models/
│   │   ├── User.ts         # User (admin/resident)
│   │   ├── Room.ts         # Room listings
│   │   ├── Registration.ts # Registration leads
│   │   ├── Invoice.ts      # Payment invoices
│   │   ├── Complaint.ts    # Complaints
│   │   ├── LaundryRequest.ts
│   │   ├── MenuItem.ts     # Weekly menu
│   │   ├── Contact.ts      # Contact form
│   │   └── Otp.ts          # Email OTP
│   ├── controllers/        # Business logic (12 files)
│   ├── routes/             # API routes (12 files)
│   ├── middleware/
│   │   ├── auth.ts         # JWT protect + authorize
│   │   ├── validate.ts     # Zod validation
│   │   ├── rateLimit.ts    # Rate limiting
│   │   ├── upload.ts       # Multer file upload
│   │   └── errorHandler.ts # Error handling
│   ├── utils/
│   │   ├── jwt.ts          # JWT sign/verify
│   │   ├── whatsapp.ts     # WhatsApp Business API
│   │   ├── email.ts        # Nodemailer + OTP
│   │   ├── sms.ts          # Twilio SMS
│   │   ├── pdf.ts          # PDFKit invoice generation
│   │   └── ApiResponse.ts  # Response helpers
│   ├── validators/
│   │   └── schemas.ts      # Zod validation schemas
│   ├── scripts/
│   │   └── seed.ts         # Database seeder
│   ├── app.ts              # Express app config
│   └── server.ts           # Server entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Security Features

- **Helmet** — Secure HTTP headers
- **CORS** — Cross-origin configured
- **HPP** — HTTP Parameter Pollution protection
- **Rate Limiting** — API (200/15min), Auth (10/15min), OTP (3/10min)
- **JWT** — HttpOnly secure cookies
- **Bcrypt** — Password hashing (salt rounds: 12)
- **Zod** — Input validation on all routes
- **XSS Protection** — Helmet + input sanitization
- **MongoDB Injection** — Mongoose sanitization

---

## 🚀 Deploy to Render

1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your repo
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all from `.env`
5. Deploy

---

## 📝 Frontend Integration

In your frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Example API call:
```typescript
const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();
```
