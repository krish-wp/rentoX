# RentoX

A full-stack vehicle rental marketplace built for the Indian market. Users can register, list vehicles for rent, browse available vehicles, and send rental requests to vehicle owners.

## Live Demo

🔗 [Live URL]() — _Coming soon_

## Screenshots

| Landing Page | Vehicle Browse |
|:---:|:---:|
| _Screenshot_ | _Screenshot_ |

| Booking Form | My Vehicles |
|:---:|:---:|
| _Screenshot_ | _Screenshot_ |

## Tech Stack

### Frontend
- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (base-nova style)
- [Axios](https://axios-http.com/) — HTTP client with auto token refresh interceptor
- [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — Form validation
- [lucide-react](https://lucide.dev/) — Icons

### Backend
- [Express 5](https://expressjs.com/) — REST API framework
- [Prisma ORM](https://www.prisma.io/) + PostgreSQL — Database
- JWT (access + refresh tokens) with httpOnly cookies — Authentication
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — Password hashing
- [Nodemailer](https://nodemailer.com/) (Gmail OAuth2) — Email service
- [Zod](https://zod.dev/) — Input validation
- [Swagger](https://swagger.io/) / OpenAPI 3.0.3 — API documentation
- [Helmet](https://helmetjs.github.io/) + [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) — Security

### DevOps

| Tool | Purpose |
|------|---------|
| npm workspaces | Monorepo management |
| concurrently | Parallel dev server |
| nodemon | Backend auto-restart |
| ESLint + Prettier | Code quality |
| Vercel | Frontend deployment |
| Railway | Backend + DB deployment |

## Features

### 🔐 Authentication
- Registration with 6-digit OTP email verification (10 min expiry)
- Login with JWT (15 min access token + 7 day refresh token in httpOnly cookie)
- Auto token refresh via Axios interceptor
- Logout clears httpOnly cookie

### 👤 Profile Management
- View profile with account details
- Edit profile: phone number, Indian state, cascading state → district dropdown, 6-digit pincode
- Profile completion gate — users must complete profile before creating vehicles or sending rental requests

### 🚗 Vehicle Management
- Create, edit, delete your own vehicle listings
- Indian plate number auto-formatting (`XX 00 XX 0000`)
- Brand → Model cascading dropdown (60+ Indian brands including Maruti, Hyundai, Tata, Mahindra, and 200+ models)
- Vehicle types: Car, Bike, SUV, Van, Truck, Auto, EV, Scooter
- Toggle vehicle availability on/off
- Ownership validation — only the owner can edit/delete their vehicles

### 🔍 Vehicle Browsing
- Paginated vehicle listing with filters: type, location, min/max price
- Excludes user's own vehicles from browse results
- Vehicle detail page with image, specs, and owner information

### 📅 Rental Requests
- Send rental request with date range (start/end) and optional message
- Date conflict detection — prevents overlapping with accepted bookings
- Max 30-day booking limit enforced on frontend and backend
- Live price calculator showing total cost
- Self-booking prevention — cannot rent your own vehicle
- Accept / reject received requests (owner only)
- Delete sent requests (sender only)
- Tabbed dashboard: Sent / Received with count badges
- Email notification to owner on new request

### 🇮🇳 India-Focused
- 28 states + 8 union territories in cascading dropdowns
- All districts mapped to their states
- 400+ serviceable cities
- Vehicle brands and models specific to the Indian market
- INR pricing (₹)

### 🌐 SEO & Metadata
- Dynamic sitemap.xml
- robots.txt configuration
- OpenGraph and Twitter card metadata on all pages
- Custom 404 and error pages

## Security

| Feature | Implementation |
|---------|---------------|
| **Helmet** | Security headers (CSP, HSTS, X-Frame-Options, etc.) |
| **Rate Limiting** | Global (100/15min), Auth (50/15min), Vehicles (50/15min), Requests (20/15min) |
| **JWT Authentication** | Access token (15m) + Refresh token (7d) in httpOnly cookie |
| **Password Hashing** | bcrypt with configurable salt rounds (default 10) |
| **OTP Security** | OTPs hashed with bcrypt before storage, 10 min expiry |
| **Body Size Limit** | 10KB request body limit |
| **Ownership Validation** | Vehicles and requests protected — only owner can modify |
| **Profile Completion Guard** | Blocks vehicle creation and rental requests for incomplete profiles |
| **Date Conflict Detection** | Prevents overlapping accepted bookings |
| **Input Validation** | Zod schemas on both frontend and backend |
| **Environment Validation** | Server exits on startup if required env vars are missing |
| **Frontend Security** | XSS protection, clickjacking prevention, HSTS, strict referrer policy |
| **Protected Routes** | Next.js middleware + React ProtectedRoute component |
| **Safe Redirects** | Blocks malicious redirect URLs on login page |

## API Documentation

Full OpenAPI 3.0.3 specification available at `/api-docs` when the server is running.

### API Endpoints

**Auth** (`/api/v1/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register with OTP email |
| POST | `/verify-otp` | No | Verify 6-digit OTP |
| POST | `/login` | No | Login, returns access token |
| POST | `/logout` | Yes | Clear refresh cookie |
| POST | `/refresh` | Cookie | Refresh access token |
| GET | `/me` | Yes | Get profile |
| PUT | `/me` | Yes | Edit profile |

**Vehicles** (`/api/v1/vehicles`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | Browse vehicles (paginated, filtered) |
| GET | `/mine` | Yes | My vehicles |
| GET | `/:id` | Yes | Vehicle details |
| POST | `/` | Yes* | Create vehicle |
| PUT | `/:id` | Yes | Update vehicle (owner) |
| PATCH | `/:id/availability` | Yes | Toggle availability (owner) |
| DELETE | `/:id` | Yes | Delete vehicle (owner) |

**Rental Requests** (`/api/v1/rental-requests`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/sendrequest` | Yes* | Send rental request |
| GET | `/sent` | Yes | My sent requests |
| GET | `/received` | Yes | My received requests |
| GET | `/vehicle/:vehicleId` | Yes | Requests for vehicle (owner) |
| PUT | `/:requestId/status` | Yes | Accept/reject (owner) |
| DELETE | `/:requestId` | Yes | Delete request (sender) |

_* Requires complete profile_

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (local or remote)
- Gmail account with OAuth2 credentials (for email service)

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/krish-wp/rentoX.git
cd rentox
```

2. **Install dependencies**

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

3. **Set up backend environment variables**

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/rentox
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
BCRYPT_SALT_ROUNDS=10
OTP_EXPIRY_MINUTES=10
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
COOKIE_MAX_AGE_DAYS=7
GOOGLE_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

4. **Set up frontend environment variables**

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

5. **Run database migrations**

```bash
cd backend
npx prisma migrate dev
```

6. **Start the development servers**

```bash
# From the root directory — starts both backend and frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- API Docs: http://localhost:5000/api-docs

## Folder Structure

```
rentox/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (3 models)
│   │   └── migrations/            # 4 migration files
│   └── src/
│       ├── config/                # constants, Google OAuth
│       ├── controllers/           # auth, vehicle, request
│       ├── lib/                   # Prisma client, Zod validation
│       ├── middleware/            # JWT, profile gate, rate limits
│       ├── routes/                # Route definitions
│       ├── services/              # Email service (Nodemailer)
│       ├── utils/                 # Error classes, helpers, OTP
│       ├── app.js                 # Express app setup
│       └── server.js              # Entry point
├── docs/
│   └── openapi.json               # OpenAPI 3.0.3 spec
├── frontend/
│   ├── public/                    # Static assets
│   └── src/
│       ├── app/                   # 13 pages (App Router)
│       ├── components/            # Navbar, ProtectedRoute, UI
│       ├── hooks/                 # Auth context + provider
│       ├── lib/                   # API client, constants (Indian data), form utils
│       ├── services/              # Auth, Vehicle, Rental API services
│       └── types/                 # TypeScript definitions
├── package.json                   # Workspace root
└── README.md
```

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userName | String | Display name |
| email | String | Unique, used for login |
| password | String | bcrypt-hashed |
| otp / otpExpiry | String? / DateTime? | OTP verification |
| mobileNumber | String? | Phone |
| state / district / pincode | String? | Indian address |
| verified | Boolean | Email verified |
| isProfileCompleted | Boolean | Profile gate |

### Vehicle
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| plateNumber | String | Unique, Indian format |
| brand / model | String | Indian brands |
| type | String | Car, Bike, SUV, etc. |
| pricePerDay | Int | INR |
| location | String | City |
| imageUrl | String | Vehicle photo |
| isAvailable | Boolean | Toggle for renting |

### RentalRequest
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| startDate / endDate | DateTime | Rental period |
| message | String? | Optional note |
| status | Enum | PENDING, ACCEPTED, REJECTED |

## Roadmap

- [ ] Deploy to production
- [ ] Image upload (Cloudinary)
- [ ] Payment integration (Razorpay)
- [ ] Reviews and ratings
- [ ] In-app messaging
- [ ] Google OAuth login

## License

MIT
