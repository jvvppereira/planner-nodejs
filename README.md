# Plann.er - Travel Planner Manager

**Plann.er** is a travel management API designed to help users plan trips with friends, organize activities, and keep important links in one place.

This project was developed using a modern and efficient stack focused on performance and strong typing.

## 🚀 Technologies and Libraries

The project uses the following technologies:

### **Core Stack**
- **[Node.js](https://nodejs.org/)**: JavaScript/TypeScript runtime environment.
- **[TypeScript](https://www.typescriptlang.org/)**: Adds static typing to the code, increasing predictability and safety.
- **[Fastify](https://www.fastify.io/)**: Web framework focused on performance and low overhead.

### **Data Persistence**
- **[Prisma](https://www.prisma.io/)**: Modern ORM (Object-Relational Mapping) for Node.js and TypeScript.
- **SQLite**: Lightweight relational database used for development.

### **Validation and Typing**
- **[Zod](https://zod.dev/)**: Schema declaration and validation library with a focus on TypeScript.
- **[fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod)**: Integration to ensure Fastify routes are typed and validated via Zod.

### **Other Libraries**
- **[Nodemailer](https://nodemailer.com/)**: Email sending service for trip and participant confirmation.
- **[tsx](https://tsx.is/)**: Fast TypeScript runner (used via `tsx watch` during development).

## 🛠️ Features

- **Trips**: Create, update, and list trip details.
- **Participants**: Manage invitations and presence confirmation.
- **Activities**: Schedule activities within a trip's timeframe.
- **Links**: Store useful links (reservations, maps, etc.) linked to the trip.

## 📋 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file based on `.env.example` (if available) or configure:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3333`.

---
*Developed with 💜 during Rocketseat's NLW*