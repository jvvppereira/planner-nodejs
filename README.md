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
- **PostgreSQL**: Production database (via Docker locally, managed service on Vercel).

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
Create a `.env` file:
```env
DATABASE_URL="postgresql://planner:planner@localhost:5432/planner?schema=public"
API_BASE_URL="http://localhost:3000"
WEB_BASE_URL="http://localhost:3000"
PORT=3000
```

### 4. Run database migrations
```bash
npx prisma migrate dev --name init
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
Runs: `prisma generate` → `tsc` → `prisma migrate deploy`

### Deploy to Vercel
1. Push to GitHub
2. Import project in Vercel
3. Add Environment Variables (Production):
   - `DATABASE_URL` — PostgreSQL connection string (use connection pooler, port 6543, with `?connection_limit=1&pool_timeout=0&sslmode=require`)
   - `API_BASE_URL` — Your Vercel URL (e.g., `https://your-app.vercel.app`)
   - `WEB_BASE_URL` — Frontend URL
   - `NODE_ENV=production`
4. Deploy

Vercel runs `npm run vercel-build` which executes the full build pipeline including migrations.

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
├── schema.prisma    # Database schema (PostgreSQL)
└── migrations/      # Migration history
```

---

*Developed with 💜 during Rocketseat's NLW*