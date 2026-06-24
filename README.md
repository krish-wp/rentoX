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

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd rentoX
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create environment file

Create a `.env` file inside the `backend` folder.

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rentox"
```

Replace `username`, `password`, and database name with your own PostgreSQL details.

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

## Useful Commands

Run Prisma Studio:

```bash
npx prisma studio
```

Create a new migration after editing `schema.prisma`:

```bash
npx prisma migrate dev --name migration_name
```

## Git Notes

Files that should not be pushed to GitHub are ignored using `.gitignore`, including:

- `node_modules/`
- `.env`
- generated Prisma files
- logs and build output

Do not commit real database passwords or secret keys.

## Next Steps

Planned work:

- Build backend API routes
- Add authentication
- Add vehicle listing APIs
- Add rental request APIs
- Build frontend UI
- Connect frontend with backend
