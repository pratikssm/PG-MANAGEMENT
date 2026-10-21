# StayNest Backend API

Production-ready Express + TypeScript + MongoDB backend for StayNest Premium PG Management System.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```powershell
Copy-Item .env.example .env
```
Open `.env` and set `MONGO_URI` to your local MongoDB or Atlas connection string and replace `JWT_SECRET` with a random value (at least 32 characters in production). Razorpay keys are required to complete real test/live bookings; email, SMS, WhatsApp, and Cloudinary credentials are optional integrations.

### 3. Seed Database
```bash
npm run seed
```
This safely creates development-only demo accounts (outside production), 16 rooms, and the weekly menu. It is idempotent and does not clear existing collections.

### 4. Start Development Server
```bash
npm run dev
```
Server runs at `http://localhost:5000`

### Frontend
In a second terminal:
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
The frontend is served at `http://localhost:5180` and uses the API URL in `frontend/.env`. Sign-in, registration, rooms, contact requests, dashboards, and payment verification use the MongoDB-backed API; there is no browser-side demo data store.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Development demo credentials

These demo accounts are created by `npm run seed` only when `NODE_ENV` is not `production`. They are not production credentials.

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@staynest.in` | `admin123` |
| Resident | `rahul.mehta@staynest.in` | `resident123` |

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/otp/request` | Public, rate-limited | Send a five-minute email verification code |
| POST | `/otp/verify` | Public, rate-limited | Verify the one-time email code |
| POST | `/signup` | Public, rate-limited | Create an account after email verification |
| POST | `/login` | Public, rate-limited | Login with verified email/password |
| POST | `/logout` | Auth | Invalidate the current session and clear auth cookie |
| GET | `/me` | Auth | Get current user |

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
| POST | `/` | Resident | Submit a registration linked to the signed-in account (sends WhatsApp + Email + SMS) |
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

### Brevo transactional email (recommended and required for account signup)
1. In Brevo, create an API key from **Settings → SMTP & API → API keys**. Use the API key with the HTTP API integration (not an SMTP key).
2. Add a sender under **Settings → Senders, Domains, IPs → Senders** and complete sender verification. Authenticate your domain with the DNS records Brevo provides when possible.
3. Set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (must be the verified sender), and optionally `BREVO_SENDER_NAME` in `backend/.env`.
4. Restart the backend and request an OTP. OTPs are never returned by the API; check Brevo transactional logs for delivery status.
5. Existing SMTP settings remain available as a fallback if Brevo is not configured.

### Twilio SMS (Optional)
1. Go to https://twilio.com → Sign up
2. Get Account SID, Auth Token, Phone Number
3. Paste into `.env`

### Signup and resident application flow
1. Visitors can browse public pages without an account.
2. `/signup` sends and verifies an email OTP, then creates an account; it does not create a resident application or log the user in.
3. The user logs in and is directed to `/register` to complete the existing resident application.
4. The backend associates the application with the authenticated account and uses the account email; the email sent in the request is ignored.
5. Pending/rejected applications can see their status, while resident services and booking require admin approval.
6. Demo admin/resident accounts are created only when running the seed script outside production. Create production admin accounts through a controlled deployment process.

Passwords must be at least 8 characters and contain uppercase, lowercase, and numeric characters. OTPs expire after five minutes, are stored as keyed hashes, allow at most five verification attempts, and can be requested at most once per minute (with additional IP rate limits). On backend startup, legacy OTP records containing plaintext codes are deleted; other account, room, and registration data is untouched.

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
   - Set `CLIENT_URL` to the exact Vercel frontend origin, without a trailing slash (for example, `https://your-project.vercel.app`). For multiple frontend domains, separate exact origins with commas. Do not include `/login` or `/api`.
5. Deploy

---

## 📝 Frontend Integration

In Vercel, set this environment variable for the frontend project and redeploy:
```
VITE_API_URL=https://your-render-service.onrender.com/api
```

For this deployment, the values should be:

- **Render `CLIENT_URL`:** `https://pg-management-8fb6fhlzr-pratikssms-projects.vercel.app`
- **Vercel `VITE_API_URL`:** `https://staynest-backend-lslj.onrender.com/api`

`CLIENT_URL` must match the frontend's browser origin exactly. If you also use a stable Vercel domain or another frontend domain, add it to `CLIENT_URL` separated by a comma. After changing environment variables, redeploy the affected service so the new configuration is loaded.

Example API call:
```typescript
const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();
```
