# RentoX

RentoX is a vehicle rental marketplace project. The goal is to let users register, list vehicles for rent, browse available vehicles, and send rental requests to vehicle owners.

## Project Status

This project is in the initial setup stage.

Current progress:

- Backend folder created
- Prisma configured
- PostgreSQL datasource configured
- Database models added for users, vehicles, and rental requests
- Frontend folder created, but not built yet

## Tech Stack

Backend:

- Node.js
- Prisma ORM
- PostgreSQL
- dotenv

Frontend:

- Not created yet
- Planned as a separate frontend app inside the `frontend` folder

## Folder Structure

```text
rentoX
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   ├── migrations
│   │   └── generated
│   ├── src
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── prisma.config.ts
├── frontend
├── .gitignore
└── README.md
```

## Database Models

The current Prisma schema includes:

- `User` - stores user account and profile details
- `Vehicle` - stores vehicle listing details
- `RentalRequest` - stores rental requests from users
- `RequestStatus` - tracks request status as `PENDING`, `ACCEPTED`, or `REJECTED`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (local or remote)

### Setup

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Set up PostgreSQL**

- Create a database named `rentox`
- Update `DATABASE_URL` in `.env` if needed

3. **Run Prisma migrations**

```bash
npx prisma migrate dev --name init
```

4. **Start the server**

```bash
npm run dev
```

5. **Open in browser**
   Go to http://localhost:5000

## 📱 Features

- User registration and login (JWT cookies)
- Browse available vehicles
- Send rental requests
- View your sent and received requests
- Approve/reject requests

## 🛠️ Tech Stack

- Backend: Node.js, Express.js
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT with cookies
- Frontend: HTML, CSS, JavaScript (Bootstrap)
- Validation: Zod

## 🔐 Security

- All API endpoints require authentication
- Ownership validation for vehicles and requests
- Environment variables for secrets

## 📌 Next Steps

- Add email notifications
- Implement search and filtering
- Add admin dashboard
- Deploy to production

## 📄 License

MIT

---

Built with ❤️ for the modern rental economy
