# SnapLink — Setup Guide

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- PostgreSQL 14+ (local) OR a Supabase account (cloud)
- Git

---

## Option A — Local PostgreSQL Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOURUSERNAME/snaplink.git
cd snaplink
```

### 2. Create local database

```bash
psql -U postgres
CREATE DATABASE snaplink;
\q
```

### 3. Backend setup

```bash
cd snaplink-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/snaplink
JWT_SECRET=any-random-string-here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Run database migrations (creates all tables)
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

Backend runs at: `http://localhost:3000`

### 4. Frontend setup

```bash
cd ../snaplink-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_API_URL=http://localhost:3000
```

```bash
# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Option B — Supabase (Cloud PostgreSQL)

### 1. Create Supabase project

```
1. Go to supabase.com
2. New Project → set name and password
3. Wait for project to provision (2 min)
4. Settings → Database → scroll to "Connect to your project"
5. Select ORM → Prisma
6. Copy both DATABASE_URL and DIRECT_URL
```

### 2. Backend .env with Supabase

```
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-x.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxx:PASSWORD@aws-x.pooler.supabase.com:5432/postgres
JWT_SECRET=any-random-string-here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Add directUrl to prisma/schema.prisma

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 4. Run migration

```bash
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

---

## Verify Everything Works

### Test backend is running

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test"}'
```

Expected response:
```json
{"success":true,"data":{"access_token":"...","user":{...}}}
```

### Test redirect

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# 2. Create a short URL
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"originalUrl":"https://github.com"}'

# 3. Visit the short URL (replace aB3xQ7 with your short code)
curl -I http://localhost:3000/aB3xQ7
# Should return: HTTP/1.1 302 Found
#               Location: https://github.com
```

### View database with Prisma Studio

```bash
cd snaplink-backend
npx prisma studio
# Opens at http://localhost:5555
# Shows all tables: users, urls, visits
```

---

## Production Deployment

### Backend → Railway

```
1. railway.app → New Project → Deploy from GitHub → snaplink-backend
2. Variables tab → add all env vars:
   DATABASE_URL, DIRECT_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT=3000, NODE_ENV=production, FRONTEND_URL
3. Settings → Build Command:
   npm install && npx prisma generate && npm run build
4. Settings → Start Command:
   npx prisma migrate deploy && node dist/main
5. Settings → Networking → Generate Domain
```

### Frontend → Vercel

```
1. vercel.com → New Project → Import snaplink-frontend
2. Framework: Vite
3. Environment Variables:
   VITE_API_URL = https://your-railway-url.up.railway.app
4. Deploy
```

### After both are deployed

```
Railway → SnapLink-backend → Variables
→ FRONTEND_URL = https://your-vercel-url.vercel.app
→ Save → Redeploy
```

---

## Common Issues

### "Table does not exist"
```bash
npx prisma migrate deploy
npx prisma generate
```

### "EADDRINUSE port 3000"
```bash
npx kill-port 3000
npm run start:dev
```

### "Cannot reach database server"
Check DATABASE_URL in .env — make sure it uses port 6543 for Supabase pooler, not 5432.

### "CORS error on live"
Make sure FRONTEND_URL on Railway exactly matches your Vercel URL including `https://` and no trailing slash.

### "NaN% in analytics"
This is a frontend calculation bug. Fixed by guarding division:
```typescript
const pct = total > 0 ? Math.round((count / total) * 100) : 0
```
