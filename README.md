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
- **Frontend:** React + TypeScript SPA in `/src`
- **Backend:** Node.js/Express API in `/server`
- **Database:** Drizzle ORM schemas in `/db`
- **Infrastructure:** Docker/Kubernetes configs in `/deploy`

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
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

Required backend environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing (min 32 chars)
- `SENDGRID_API_KEY` - For magic link emails (optional in development)

### Database Setup

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
├── src/                       # Frontend React application
│   ├── api/                   # API client layer
│   ├── components/            # React components
│   ├── pages/                 # Route pages
│   └── types/                 # TypeScript types
├── server/                    # Backend Node.js/Express API
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── db/                # Database client & schema
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   └── services/          # Business logic
│   ├── Dockerfile             # Backend container image
│   └── drizzle.config.ts      # Drizzle Kit configuration
├── db/                        # Shared database schemas
│   └── schema/                # Drizzle ORM table definitions
├── deploy/                    # Infrastructure configs
│   ├── docker-compose.yml.example
│   └── Caddyfile.example
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

```
Internet
    │
    ├─▶ Vercel (audifi.io)
    │       └── Frontend (React + Vite)
    │
    └─▶ Fly.io (audifi-api.fly.dev)
            ├── Backend API (Express.js)
            └── Fly Postgres (PostgreSQL 16)
```

### Backend Deployment (Fly.io)

The backend API is deployed to Fly.io. See [deploy/README.md](deploy/README.md) for full setup instructions.

```bash
cd server
flyctl deploy
```

Required secrets (set via `flyctl secrets set`):
- `DATABASE_URL` - Auto-set when attaching Fly Postgres
- `JWT_SECRET` - JWT signing key (min 32 chars)
- `SENDGRID_API_KEY` - For magic link emails

### Frontend Deployment (Vercel)

The frontend is automatically deployed via Vercel on pushes to `main`.

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
- Drizzle ORM + PostgreSQL
- JWT authentication
- ethers.js for Web3

### Infrastructure
- **Frontend:** Vercel
- **Backend API:** Fly.io
- **Database:** Fly Postgres
- **Local Dev:** Docker Compose

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
