# RentoX

RentoX is a vehicle rental marketplace project. The goal is to let users register, list vehicles for rent, browse available vehicles, and send rental requests to vehicle owners.

## Project Status

This project is in active development.

Current progress:

- Backend API fully built with Express.js
- Prisma ORM configured with PostgreSQL
- JWT authentication with access/refresh tokens
- OTP-based email verification on registration
- Vehicle CRUD operations with ownership validation
- Rental request system (send, accept, reject)
- Email service via Gmail OAuth2

## Tech Stack

- Runtime: Node.js (v18+)
- Framework: Express.js
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT (access + refresh tokens) with httpOnly cookies
- Password Hashing: bcrypt
- Email: Nodemailer (Gmail OAuth2)
- Validation: Zod
- Cookie Handling: cookie-parser
- CORS: cors
- Logging: morgan
- API Docs: Swagger (swagger-jsdoc + swagger-ui-express)
- Linting: ESLint + Prettier

## Folder Structure

```text
rentoX
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── migrations
│   ├── src
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend
├── docs/
├── package.json
├── .gitignore
└── README.md
```

## Database Models

- `User` - stores user account, profile, and OTP verification fields
- `Vehicle` - stores vehicle listing details with owner reference
- `RentalRequest` - stores rental requests with status tracking
- `RequestStatus` - enum: `PENDING`, `ACCEPTED`, `REJECTED`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (local or remote)
- Gmail account with OAuth2 credentials (for email service)

### Setup

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Set up environment variables**

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rentox
JWT_SECRET=your-secret-key
GOOGLE_USER=your-gmail@gmail.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

3. **Run Prisma migrations**

```bash
npx prisma migrate dev
```

4. **Start the server**

```bash
npm run dev
```

5. **Open in browser**
   Go to http://localhost:5000

## 📱 Features

- User registration with OTP email verification
- Login with JWT (access + refresh tokens)
- Browse available vehicles
- Add/edit/delete your own vehicles
- Send rental requests to vehicle owners
- Accept/reject rental requests
- User profile management

## 🔐 Security

- OTP-based email verification on registration
- JWT with httpOnly cookies for refresh tokens
- Password hashing with bcrypt
- Ownership validation for vehicles and requests
- Environment variables for secrets

## 📌 Next Steps

- Implement search and filtering
- Add admin dashboard
- Add rate limiting on auth endpoints
- Deploy to production

## 📄 License

MIT
