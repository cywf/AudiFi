# AudiFi (NFT Tracks)

**AudiFi** is a Web3 platform for independent music artists to mint their tracks as NFTs, retain full ownership, and earn perpetual royalties through the innovative "Mover Advantage" system.

## 🎵 Overview

AudiFi empowers artists to:
- Upload music tracks and artwork
- Configure release metadata (genre, BPM, mood, description)
- Mint tracks as NFTs with fractional ownership (Master IPO)
- Earn automatic royalties on all secondary market resales
- Engage fans through V Studio interactive sessions

This repository contains:
- **Frontend:** React + TypeScript SPA in `/src` (deployed to Vercel)
- **Backend:** Node.js/Express API in `/server` (deployed to Fly.io)
- **Database:** Drizzle ORM schemas in `/db` (Neon PostgreSQL)
- **Infrastructure:** Docker/Kubernetes configs in `/deploy`

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                    │
└─────────────────────────────────────────────────────────────────────────┘
                    │                               │
                    ▼                               ▼
    ┌───────────────────────────┐   ┌───────────────────────────────────┐
    │     Vercel (Frontend)      │   │       Fly.io (Backend API)        │
    │     https://audifi.io      │   │   https://audifi-api.fly.dev      │
    │                            │   │                                   │
    │  • React + Vite            │   │  • Node.js + Express              │
    │  • Static assets           │   │  • REST API                       │
    │  • Client-side only        │──▶│  • Authentication                 │
    │  • NO database access      │   │  • Business logic                 │
    └───────────────────────────┘   └───────────────────────────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────────────┐
                                    │      Neon (PostgreSQL)            │
                                    │   host.neon.tech:5432             │
                                    │                                   │
                                    │  • Serverless Postgres            │
                                    │  • Auto-scaling                   │
                                    │  • SSL required                   │
                                    │  • Drizzle ORM                    │
                                    └───────────────────────────────────┘
```

### Key Separation Points

1. **Frontend (Vercel)**: Static React app, no database access
2. **Backend (Fly.io)**: Express API, sole database accessor
3. **Database (Neon)**: PostgreSQL with SSL, accessed only by backend

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Neon PostgreSQL database (https://neon.tech)
- Docker (optional, for containerized deployment)

### Frontend Setup

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Backend Setup

```bash
cd server
npm install
npm run dev
```

The API will be available at `http://localhost:3001`.

### Environment Variables

Copy the example env files and configure:

```bash
# Root (frontend)
cp .env.example .env

# Server (backend)
cp server/.env.example server/.env
```

**Frontend environment variables:** (`.env`)
- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:3001`)
- `VITE_WS_URL` - WebSocket URL for real-time features

**Backend environment variables:** (`server/.env`)
- `DATABASE_URL` - Neon PostgreSQL connection string (required)
- `JWT_SECRET` - Secret for JWT token signing (min 32 chars)
- `SENDGRID_API_KEY` - For magic link emails (optional in development)

> ⚠️ **Important**: `DATABASE_URL` should NEVER be set in the frontend environment.

### Database Setup (Neon)

1. Create a free database at [Neon](https://neon.tech)
2. Copy your connection string from the Neon dashboard
3. Set `DATABASE_URL` in `server/.env`

```bash
cd server

# Generate migrations from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

## 📁 Project Structure

```
├── src/                       # Frontend React application (Vercel)
│   ├── api/                   # API client layer (calls Fly.io backend)
│   ├── components/            # React components
│   ├── pages/                 # Route pages
│   └── types/                 # TypeScript types
├── server/                    # Backend Node.js/Express API (Fly.io)
│   ├── src/
│   │   ├── config/            # Configuration + env validation
│   │   │   ├── index.ts       # Main config
│   │   │   └── env.ts         # Environment variable handling
│   │   ├── db/                # Database client (Neon) & schema
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   └── services/          # Business logic
│   ├── Dockerfile             # Backend container image
│   ├── fly.toml               # Fly.io deployment config
│   └── drizzle.config.ts      # Drizzle Kit configuration
├── db/                        # Shared database schemas (Neon)
│   └── schema/                # Drizzle ORM table definitions
├── deploy/                    # Infrastructure configs
│   ├── docker-compose.yml.example
│   └── Caddyfile.example
├── .github/workflows/         # CI/CD pipelines
│   ├── backend.yml            # Backend tests + Fly.io deployment
│   └── frontend.yml           # Frontend tests + Vercel deployment
└── docs/                      # Documentation
```

## 🔐 Authentication

AudiFi uses JWT-based authentication with magic link passwordless login:

1. User requests magic link via email
2. Token is stored in database with 15-minute expiry
3. User clicks link, token is verified and consumed
4. JWT access token (short-lived) + refresh token (30 days) issued
5. Optional 2FA via TOTP (Google Authenticator compatible)

### Wallet Linking

Users can link Web3 wallets with signature verification:
```
POST /api/v1/auth/wallet
{
  "address": "0x...",
  "chain": "ethereum",
  "signature": "0x...",
  "message": "Sign this message to link your wallet"
}
```

## 🎯 Key Features

### Master IPO
- Artists can create "Masters" (tracks/albums) and launch IPOs
- Configurable supply (1 to 1,000,000 NFTs)
- "Mover Advantage" system rewards early minters with perpetual royalties

### V Studio
- Interactive fan sessions during creative process
- Decision points where fans vote on creative choices
- Eligibility rules (NFT holders, coin holders, subscribers)

### Multi-Chain Support
- Ethereum, Polygon, Base networks supported
- Chain selection per IPO
- Wallet linking per chain

## 🧪 Development

### Running Tests

```bash
# Frontend
npm test

# Backend
cd server
npm test
```

### Type Checking

```bash
# Frontend
npm run type-check

# Backend
cd server
npm run type-check
```

### Linting

```bash
# Frontend
npm run lint

# Backend
cd server
npm run lint
```

## 🚀 Deployment

### Production Architecture

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://audifi.io |
| Backend API | Fly.io | https://audifi-api.fly.dev |
| Database | Neon | (internal connection) |

### Backend Deployment (Fly.io)

The backend API is deployed to Fly.io via GitHub Actions.

**Required GitHub Secrets:**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `FLY_API_TOKEN` - Fly.io API token
- `FLY_APP_STAGING` - Staging app name
- `FLY_APP_PRODUCTION` - Production app name

**Manual deployment:**
```bash
cd server
flyctl deploy
```

**Required Fly.io secrets:**
```bash
flyctl secrets set DATABASE_URL=postgresql://...@host.neon.tech:5432/db
flyctl secrets set JWT_SECRET=your-jwt-secret
flyctl secrets set SENDGRID_API_KEY=your-sendgrid-key
```

### Frontend Deployment (Vercel)

The frontend is automatically deployed via Vercel Git integration.

**Environment Variables (Vercel Dashboard):**
- `VITE_API_URL` - Backend API URL (e.g., `https://api.audifi.io`)
- `VITE_WS_URL` - WebSocket URL

### Local Development (Docker Compose)

For local development with Docker:

```bash
cp deploy/docker-compose.yml.example deploy/docker-compose.yml
cp deploy/.env.example deploy/.env
cd deploy
docker compose up -d
```

## 📝 API Documentation

See [docs/api/overview.md](docs/api/overview.md) for full API reference.

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check with dependency status |
| `/api/v1/auth/magic-link` | POST | Request magic link |
| `/api/v1/auth/verify-magic-link` | POST | Verify and get tokens |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/masters` | GET/POST | List/create masters |
| `/api/v1/masters/:id/ipo` | POST | Create IPO for master |

## 🔮 Tech Stack

### Frontend
- React 19 + TypeScript
- React Router v7
- Tailwind CSS v4
- shadcn/ui components

### Backend
- Node.js 20 + TypeScript
- Express.js
- Drizzle ORM + Neon PostgreSQL
- JWT authentication
- ethers.js for Web3

### Infrastructure
- **Frontend:** Vercel
- **Backend API:** Fly.io
- **Database:** Neon (PostgreSQL)
- **Local Dev:** Docker Compose

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
