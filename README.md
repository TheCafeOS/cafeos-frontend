# CafeOS 

CafeOS is a modern SaaS platform built for cafés and restaurants to simplify menu management, QR ordering, and order tracking.

Customers can scan a QR code placed on their table, browse the digital menu, place orders, and track their order status in real time. Restaurant staff can manage menus, tables, categories, and incoming orders through an intuitive dashboard.

---

## Features

### Restaurant Dashboard

- Restaurant Authentication
- Dashboard Overview
- Menu Management
- Category Management
- Table Management
- QR Code Generation
- Order Management
- Settings
- Cloudinary Image Upload
- Responsive Dashboard

### Customer Experience

- QR Code Menu
- Browse Categories
- Search Menu Items
- Shopping Cart
- Place Orders
- Live Order Tracking
- Mobile-Friendly Interface

---

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- Axios
- React Hook Form
- Zod
- Socket.IO Client
- Sonner

### Backend

- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- Socket.IO
- Cloudinary

---

## Project Structure

```text
app/
components/
hooks/
lib/
providers/
public/
schemas/
services/
types/
utils/
```

---

## Getting Started

### Clone the repository

```bash
git clone <repository-url>
```

```bash
cd cafeos-frontend
```

---

### Install dependencies

```bash
npm install
```

---

### Configure Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Run the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Production Build

```bash
npm run build
```

```bash
npm run start
```

---

## Deployment

Frontend deployment is intended for:

- Vercel

Backend deployment can be hosted separately and connected using the production API URL.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | Frontend URL |

---

## Current Status

Current release target:

**CafeOS v1.0**

Completed:

- Authentication
- Dashboard
- Categories
- Menu Management
- Tables
- QR Ordering
- Shopping Cart
- Live Order Tracking
- Cloudinary Upload
- Responsive UI

Upcoming (Post v1.0):

- Inventory
- Reports
- Analytics
- AI Features
- Payments
- Loyalty System

---

## Contributors

### Frontend

**Anshul Bahuguna**

### Backend

**Mayank Sharma**

---

## License

This project is licensed under the MIT License.