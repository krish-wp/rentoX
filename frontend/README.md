# rentoX — Peer-to-Peer Vehicle Rental Platform

**A full-stack vehicle rental marketplace where users can list their vehicles and rent from trusted owners.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46e3b7?style=flat-square&logo=render)](https://render.com)

---

## 🎯 Problem Statement

Renting a vehicle peer-to-peer is risky. Owners don't know if a renter is trustworthy. Renters don't know if a vehicle is actually available. Existing platforms are either too corporate or too informal.

**rentoX** solves this with:
- **Verified OTP signup** — every account is email-verified
- **Availability calendar with conflict prevention** — no double-bookings
- **Two-sided ratings & reviews** — owners rate renters, renters rate owners
- **Accept/reject workflow** — owners control who rents their vehicle

---

## 🚀 Live Demo

| | Link |
|---|---|
| **Frontend (Vercel)** | https://rento-x.vercel.app |
| **Backend API (Render)** | https://rentox.onrender.com |
| **Backend Health** | https://rentox.onrender.com/api/v1/auth/me |

> **Note:** Backend may take ~30 seconds to wake up on first request (Render free tier).

---

## ✨ Features

### 🔐 Authentication
- OTP-based email verification (Brevo)
- JWT access token (15 min) + refresh token (7 days) rotation
- Refresh token stored in `httpOnly` cookie
- Failed login lockout (5 attempts → 15 min lock)

### 🚗 Vehicles
- Browse with filters: type, location, price range, keyword search
- Sort: newest, price low→high, price high→low
- Paginated results
- Vehicle detail with availability calendar (blocked dates disabled)
- Owner cannot book their own vehicle

### 📋 Rental Requests
- Send rental request with start/end dates + optional message
- Backend prevents double-booking (conflict check on ACCEPTED requests)
- Owner accepts/rejects requests
- Renter cancels pending/accepted requests

### ⭐ Trust & Reviews
- Two-sided rating system (1-5 stars + comment)
- One review per accepted rental request
- Average rating displayed on vehicle detail page and user profile
- One review per request enforced at database level

### 🎨 UI/UX
- Dark mode toggle with localStorage persistence
- Electric blue accent design system
- Skeleton loading states
- Empty states with CTAs
- Staggered card entrance animations
- Sticky mobile booking bar
- `prefers-reduced-motion` support

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- React Hook Form + Zod (validation)
- Shadcn UI (Base UI primitives)
- Sonner (toasts)
- Lucide React (icons)

**Backend**
- Node.js + Express
- Prisma ORM (PostgreSQL)
- JWT authentication
- Bcrypt password hashing
- Brevo (email API)
- Rate limiting (express-rate-limit)
- Helmet (security headers)
- CORS + cookie-parser

**DevOps**
- Vercel (frontend hosting)
- Render (backend hosting)
- Neon (PostgreSQL)

---

## 📸 Screenshots

> Add screenshots here: landing page, vehicle detail, booking flow, profile page

```
frontend/public/screenshots/
├── landing.png
├── vehicle-detail.png
├── bookings.png
└── profile.png
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon/Supabase/local)
- Brevo API key (for emails)

### 1. Clone the repository
```bash
git clone https://github.com/krish-wp/rentoX.git
cd rentoX/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Backend
The backend is deployed at https://rentox.onrender.com. For local backend development, see the `backend/` folder.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (protected)/     # Authenticated routes
│   │   ├── auth/            # Login, register, OTP
│   │   └── page.tsx         # Landing page
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Shadcn primitives
│   │   └── auth-shell.tsx   # Shared auth page layout
│   ├── lib/                 # Utilities (API client, cn)
│   ├── services/            # API service functions
│   ├── types/               # TypeScript interfaces
│   └── hooks/               # Custom hooks (useAuth)
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── eslint.config.mjs
```

---

## 🧪 Testing

```bash
# Run lint
npm run lint

# Run build
npm run build

# Start production server
npm run start
```

---

## 🚀 Deployment

**Frontend:** Deployed on Vercel — pushes to `main` trigger automatic redeploys.

**Backend:** Deployed on Render — `backend/` folder contains the Express + Prisma API.

**Database:** Neon PostgreSQL (serverless).

---

## 🧠 What I Learned

- **Concurrency safety:** Backend conflict check prevents double-bookings even if two users submit simultaneously
- **Token rotation:** Refresh tokens are hashed and stored per-user; each rotation invalidates the previous token
- **Defense-in-depth:** Calendar blocks booked dates on the frontend; backend re-validates on every submission
- **SSR hydration:** Theme bootstrap script runs before paint to prevent flash-of-wrong-theme

---

## 🔮 Future Improvements

- [ ] Stripe test-mode payment integration
- [ ] Map-based vehicle search
- [ ] Owner dashboard with earnings analytics
- [ ] Vitest + Playwright test suite
- [ ] Image upload (currently requires external image URL)

---

## 📄 License

MIT

---

**Built with ❤️ by Krish**
