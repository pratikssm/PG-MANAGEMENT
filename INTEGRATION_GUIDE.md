# Backend-Frontend Integration Guide

## Overview
This document explains how the StayNest PG Management system integrates the backend API with the frontend React application.

## Architecture

### Backend (Node.js + Express)
- **Location**: `/backend`
- **Port**: 5000 (development)
- **API Base URL**: `http://localhost:5000/api`

### Frontend (React + Vite)
- **Location**: `/frontend`
- **Port**: 5173 (development)
- **API Base URL**: `http://localhost:5000/api` (configured in `.env`)

## CORS Configuration

The backend has enhanced CORS (Cross-Origin Resource Sharing) configuration:

```javascript
// Allowed Origins
- http://localhost:5173 (local dev)
- http://localhost:3000 (alternative dev)
- http://localhost:5000 (local dev)
- https://staynest.in (production)
```

**Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD

**Allowed Headers**:
- Content-Type
- Authorization
- X-Requested-With
- X-CSRF-Token
- Accept
- Accept-Language

**Exposed Headers**: X-Total-Count, X-Page-Number, Authorization

## API Client Setup

### Location: `/frontend/src/lib/api.ts`

The frontend uses a centralized API client with:
- Automatic token injection from localStorage
- Error handling and 401 redirect
- Credentials support for cookies
- Request/response typing

### Usage Examples

```typescript
import api from '@/lib/api'

// Authentication
await api.auth.login({ email, password })
await api.auth.register(userData)
await api.auth.logout()

// Rooms
const rooms = await api.rooms.getAll({ gender: 'boys', type: 'ac' })
const room = await api.rooms.getById(roomId)

// Registrations
await api.registrations.create(registrationData)
const registrations = await api.registrations.getAll()

// Other endpoints
await api.invoices.getAll()
await api.complaints.create(complaintData)
await api.laundry.getAll()
await api.menu.getAll()
await api.payments.create(paymentData)
```

## Authentication Flow

1. **Login**:
   - User submits email + password
   - Backend validates and returns JWT token + user data
   - Token stored in localStorage
   - Subsequent requests include Authorization header

2. **Token Management**:
   - Token automatically added to all API requests
   - 401 Responses trigger logout and redirect to /login
   - Token stored as `authToken` in localStorage

3. **Protected Routes**:
   - `/admin` - Admin dashboard (role: admin)
   - `/resident` - Resident dashboard (role: resident)

## Available API Endpoints

### Authentication (`/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Current user info
- `POST /request-otp` - Request OTP for phone
- `POST /verify-otp` - Verify OTP

### Rooms (`/rooms`)
- `GET /` - List all rooms
- `GET /:id` - Get room details
- `POST /` - Create room (admin)
- `PUT /:id` - Update room (admin)
- `DELETE /:id` - Delete room (admin)

### Registrations (`/registrations`)
- `GET /` - List registrations
- `GET /:id` - Get registration
- `POST /` - Create registration
- `PUT /:id` - Update registration
- `DELETE /:id` - Delete registration

### Invoices (`/invoices`)
- `GET /` - List invoices
- `GET /:id` - Get invoice
- `POST /` - Create invoice
- `PUT /:id` - Update invoice
- `GET /:id/download` - Download invoice PDF

### Complaints (`/complaints`)
- `GET /` - List complaints
- `GET /:id` - Get complaint
- `POST /` - Create complaint
- `PUT /:id` - Update complaint

### Other Services
- **Laundry** (`/laundry`) - Laundry request management
- **Menu** (`/menu`) - Mess menu management
- **Payments** (`/payments`) - Payment processing & verification
- **Uploads** (`/uploads`) - Image upload handling
- **Contacts** (`/contacts`) - Contact form submissions
- **Broadcast** (`/broadcast`) - Message broadcasting
- **Reports** (`/reports`) - Generate reports

## Environment Configuration

### Backend (`.env`)
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/staynest
JWT_SECRET=your_jwt_secret
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## Hooks for Data Fetching

### `useAuth()` Hook
```typescript
const { user, loading, isAuthenticated, login, logout, register, error } = useAuth()
```

### `useFetch<T>()` Hook
```typescript
const { data, loading, error, refetch } = useFetch(
  () => api.rooms.getAll(),
  [dependency]
)
```

## Frontend Pages with API Integration

### ✅ Implemented
- **Login** (`/login`) - Integrated with API
- **Register** (`/register`) - Integrated with API
- **Admin Dashboard** (`/admin`) - Loads user data
- **Resident Dashboard** (`/resident`) - Loads resident data

### 📋 Ready for Integration
- **Rooms** - Room listing and filtering
- **Complaints** - Create/manage complaints
- **Invoices** - View and download invoices
- **Food Menu** - View mess menu
- **Laundry** - Request laundry service
- **Payments** - Process payments

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## Error Handling

All API errors are caught and returned with:
- `success: boolean` - Operation status
- `message: string` - Error description
- `error: string` - Error details

Frontend automatically:
- Shows error messages to users
- Logs errors to console
- Handles 401 unauthorized responses
- Provides user-friendly error feedback

## Testing API Endpoints

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@staynest.in","password":"admin123"}'

# Get rooms
curl http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Create a new collection
2. Import the API endpoints
3. Set base URL to `http://localhost:5000/api`
4. Include token in Authorization header

## Troubleshooting

### CORS Errors
- Verify CLIENT_URL in backend .env
- Ensure frontend is running on correct port
- Check allowed origins in app.ts

### 401 Unauthorized
- Token may have expired
- User needs to login again
- Check token storage in localStorage

### Network Errors
- Verify backend is running (http://localhost:5000/api/health)
- Check frontend VITE_API_URL environment variable
- Ensure correct port configuration

## Next Steps

1. ✅ Backend CORS configured
2. ✅ Frontend API client created
3. ✅ Authentication integrated
4. 🔄 Integrate remaining pages with API
5. 🔄 Add error boundaries
6. 🔄 Add loading states
7. 🔄 Add form validation
8. 🔄 Deploy to production
