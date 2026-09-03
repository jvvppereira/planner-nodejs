# Plann.er - Travel Planner Manager

**Plann.er** is a travel management API designed to help users plan trips with friends, organize activities, and keep important links in one place.

This project was developed using a modern and efficient stack focused on performance and strong typing.

## 🚀 Technologies and Libraries

The project uses the following technologies:

### **Core Stack**
- **[Node.js](https://nodejs.org/)**: JavaScript/TypeScript runtime environment.
- **[TypeScript](https://www.typescriptlang.org/)**: Adds static typing to the code, increasing predictability and safety.
- **[Fastify](https://www.fastify.io/)**: Web framework focused on performance and low overhead (v5).

### **Data Persistence**
- **[Prisma](https://www.prisma.io/)**: Modern ORM (Object-Relational Mapping) for Node.js and TypeScript.
- **PostgreSQL**: Production database (via Docker locally, managed service on Vercel/Supabase).

### **Validation and Typing**
- **[Zod](https://zod.dev/)**: Schema declaration and validation library with a focus on TypeScript (v4).
- **[fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod)**: Integration to ensure Fastify routes are typed and validated via Zod (v7).

### **Other Libraries**
- **[@fastify/cors](https://github.com/fastify/fastify-cors)**: CORS support for Fastify.
- **[Nodemailer](https://nodemailer.com/)**: Email sending service for trip and participant confirmation.
- **[tsx](https://tsx.is/)**: Fast TypeScript runner (used via `tsx watch` during development).

## 🛠️ Features

- **Trips**: Create, update, and list trip details.
- **Participants**: Manage invitations and presence confirmation.
- **Activities**: Schedule activities within a trip's timeframe.
- **Links**: Store useful links (reservations, maps, etc.) linked to the trip.

## 📋 How to Run

### Prerequisites
- Node.js 20+
- Docker (for local PostgreSQL)

### 1. Install dependencies
```bash
npm install
```

### 2. Start local PostgreSQL (Docker)
```bash
docker run -d --name planner-db \
  -e POSTGRES_USER=planner \
  -e POSTGRES_PASSWORD=planner \
  -e POSTGRES_DB=planner \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

### 3. Configure environment variables
Create a `.env` file with **two database URLs**:

```env
# Pooled connection (PgBouncer, port 6543) - used for runtime
DATABASE_URL="postgresql://postgres.gmlipfddxutviyjiinrv:<PASSWORD>@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# Direct connection (port 5432) - used for migrations
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.gmlipfddxutviyjiinrv.supabase.co:5432/postgres?sslmode=require"

API_BASE_URL="http://localhost:3000"
WEB_BASE_URL="http://localhost:3000"
PORT=3000
```

> **Local development**: You can use the direct connection for both by setting `DATABASE_URL` to the direct URL.

### 4. Run database migrations
```bash
# For development (creates new migration)
npx prisma migrate dev --name init

# For production/CI (applies pending migrations)
npm run db:migrate
```

### 5. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## 🏗️ Build & Deploy

### Production Build
```bash
npm run build
```
Runs: `prisma generate` → `tsc` (TypeScript compilation)

> **Note**: Migrations are **not** run during build. They run in the CI pipeline before deployment.

### Available Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Generate Prisma Client + compile TypeScript |
| `npm run vercel-build` | Alias for `build` (used by Vercel) |
| `npm run db:migrate` | Run `prisma migrate deploy` |
| `npm start` | Run production build from `dist/` |

---

## 🚀 CI/CD Pipeline (GitHub Actions → Vercel)

### Workflow Overview
```
Push to main → GitHub Actions → (1) npm ci
                              → (2) prisma generate
                              → (3) prisma migrate deploy (via pooled connection)
                              → (4) npm run build
                              → (5) Deploy to Vercel
```

### Required GitHub Secrets
| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | **Pooled** connection string (PgBouncer, port 6543) with `pgbouncer=true` |
| `DIRECT_URL` | **Direct** connection string (port 5432) — optional, not used in current CI |
| `VERCEL_TOKEN` | Vercel access token |
| `VERCEL_ORG_ID` | Vercel organization/team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

### Why Migrations Run in CI (Not Vercel Build)
- **Timeout**: Vercel build max 45 min (Pro) / 5 min (Hobby); migrations can exceed this
- **Network**: Vercel build IPs are dynamic; Supabase direct connection requires allow-listed IPs
- **Reliability**: Separate CI step provides better logs, retry capability, and rollback control
- **Pooled connection**: CI uses the PgBouncer URL (port 6543) which accepts any IP

### Vercel Configuration
`vercel.json` uses `vercel-build` script and rewrites all requests to the serverless entry point:

```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }]
}
```

### Deploy Steps
1. Push to GitHub (triggers workflow)
2. GitHub Actions runs migrations + build + deploys to Vercel
3. Vercel runs `npm run vercel-build` (compile only) and serves from `dist/`

---

## 📁 Project Structure
```
src/
├── routes/          # Route handlers (Fastify plugins)
├── lib/             # Shared utilities (prisma, mail, date helpers)
├── errors/          # Custom error classes
├── server.ts        # App factory (buildApp) + dev entry point
├── env.ts           # Zod-validated environment config
└── error-handlers.ts# Global error handler

api/
└── index.ts         # Vercel serverless entry point

prisma/
├── schema.prisma    # Database schema (PostgreSQL, uses url + directUrl)
└── migrations/      # Migration history

.github/workflows/
└── deploy.yml       # CI/CD pipeline
```

---

## 🔧 Database Connection Details

The Prisma schema uses both pooled and direct URLs:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled (PgBouncer) - runtime
  directUrl = env("DIRECT_URL")        // Direct - migrations
}
```

| Connection | Port | Use Case | IP Restrictions |
|------------|------|----------|-----------------|
| **Pooled (DATABASE_URL)** | 6543 | Runtime (Vercel, CI) | None (works from any IP) |
| **Direct (DIRECT_URL)** | 5432 | Migrations (local, CI) | Requires allow-list in Supabase |

---

*Developed with 💜 during Rocketseat's NLW*