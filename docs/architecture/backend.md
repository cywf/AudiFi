# Backend Architecture

> Service Architecture for the AudiFi Platform

## Overview

The AudiFi backend is planned as a microservices architecture designed to handle authentication, NFT operations, V Studio sessions, payments, and analytics. This document outlines the service structure and integration patterns.

> **Status:** 🔄 PLANNED - Backend services are in the design phase.

---

## Service Architecture

```
BACKEND SERVICES
════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  • Authentication validation                                        │  │
│   │  • Rate limiting                                                     │  │
│   │  • Request routing                                                   │  │
│   │  • CORS handling                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         │                          │                          │            │
│         ▼                          ▼                          ▼            │
│   ┌───────────┐            ┌───────────┐            ┌───────────┐         │
│   │   AUTH    │            │  NFT/IPO  │            │ V STUDIO  │         │
│   │  SERVICE  │            │  SERVICE  │            │  SERVICE  │         │
│   └───────────┘            └───────────┘            └───────────┘         │
│         │                          │                          │            │
│         │                          │                          │            │
│         ▼                          ▼                          ▼            │
│   ┌───────────┐            ┌───────────┐            ┌───────────┐         │
│   │  ARTIST   │            │  PAYMENT  │            │ ANALYTICS │         │
│   │  COIN     │            │  SERVICE  │            │  SERVICE  │         │
│   │  SERVICE  │            │           │            │           │         │
│   └───────────┘            └───────────┘            └───────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Service Definitions

### Auth & Identity Service

**Purpose:** User authentication, session management, and identity verification.

**Responsibilities:**
- Magic link authentication
- Session token management
- Two-factor authentication (TOTP)
- Wallet address linking
- Password-based auth (fallback)

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/magic-link` | Send magic link email |
| POST | `/auth/verify-magic-link` | Verify magic link token |
| POST | `/auth/refresh` | Refresh session token |
| POST | `/auth/2fa/setup` | Setup 2FA |
| POST | `/auth/2fa/verify` | Verify 2FA code |
| POST | `/auth/wallet/link` | Link wallet address |
| POST | `/auth/logout` | Invalidate session |

**Data Stores:**
- PostgreSQL: User accounts, 2FA secrets
- Redis: Sessions, rate limits

---

### NFT/IPO Service

**Purpose:** Master registration, NFT minting, and IPO management.

**Responsibilities:**
- Master metadata management
- IPFS upload coordination
- Smart contract interaction
- IPO configuration and launch
- Share ownership tracking

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/masters` | Register new master |
| GET | `/masters/:id` | Get master details |
| POST | `/masters/:id/ipo` | Configure IPO |
| POST | `/masters/:id/mint` | Trigger minting |
| GET | `/masters/:id/shares` | List shareholders |
| GET | `/user/holdings` | Get user's holdings |

**Data Stores:**
- PostgreSQL: Master records, IPO configs
- IPFS: Audio files, metadata JSON
- Blockchain: NFT contracts

**Contract Integration:**
```
NFT/IPO SERVICE ←→ BLOCKCHAIN
════════════════════════════════

Service Actions:
├── deployMasterContract(metadata)
├── deployDividendContract(masterAddress)
├── mintShares(masterAddress, count)
├── transferShare(tokenId, to)
└── queryOwnership(tokenId)

Events Monitored:
├── Transfer(from, to, tokenId)
├── MasterRegistered(masterId, artist)
└── DividendDeposited(masterId, amount)
```

---

### V Studio Service

**Purpose:** Real-time collaborative sessions for track finishing.

**Responsibilities:**
- Session management
- Real-time voting
- Decision point tracking
- Producer contributions
- Master lock coordination

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/vstudio/sessions` | Create session |
| GET | `/vstudio/sessions/:id` | Get session details |
| WS | `/vstudio/sessions/:id/ws` | WebSocket connection |
| POST | `/vstudio/sessions/:id/decisions` | Add decision point |
| POST | `/vstudio/sessions/:id/vote` | Cast vote |
| POST | `/vstudio/sessions/:id/lock` | Lock master |

**Data Stores:**
- PostgreSQL: Sessions, decisions, votes
- Redis: Real-time state, presence

**WebSocket Protocol:**
```json
// Client → Server
{ "type": "vote", "decisionId": "d1", "choice": "A" }
{ "type": "join", "userId": "u1" }

// Server → Client
{ "type": "vote_update", "decisionId": "d1", "results": {"A": 50, "B": 30} }
{ "type": "user_joined", "userId": "u1", "displayName": "Fan123" }
{ "type": "decision_closed", "decisionId": "d1", "winner": "A" }
```

---

### Artist Coin & Liquidity Service

**Purpose:** Token creation and liquidity pool management.

**Responsibilities:**
- Artist Coin deployment
- Liquidity pool setup
- Token balance queries
- Staking contract interaction

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/coins/:artistId/deploy` | Deploy Artist Coin |
| GET | `/coins/:artistId` | Get coin details |
| POST | `/coins/:artistId/stake` | Stake tokens |
| GET | `/coins/:artistId/pool` | Get liquidity info |

**Contract Integration:**
```
COIN SERVICE ←→ BLOCKCHAIN
══════════════════════════

Service Actions:
├── deployArtistCoin(artistId, name, symbol)
├── setupLiquidityPool(coinAddress, ethAmount)
├── stake(coinAddress, amount)
└── unstake(coinAddress, amount)
```

---

### Payment & Subscription Service

**Purpose:** Fiat payments and subscription management.

**Responsibilities:**
- Stripe integration
- Subscription lifecycle
- Invoice generation
- Webhook handling

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/payments/checkout` | Create checkout session |
| POST | `/payments/webhook` | Stripe webhook handler |
| GET | `/subscriptions` | Get user subscription |
| POST | `/subscriptions/cancel` | Cancel subscription |

**Stripe Integration:**
- Checkout sessions for one-time and recurring
- Customer portal for self-service
- Webhook handling for status updates

---

### Analytics Service

**Purpose:** Event tracking and metrics.

**Responsibilities:**
- Event ingestion
- Aggregation pipelines
- Dashboard data
- Export APIs

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/events` | Ingest event |
| GET | `/analytics/dashboard` | Dashboard metrics |
| GET | `/analytics/masters/:id` | Master analytics |

**Data Flow:**
```
EVENT INGESTION
═══════════════

Frontend/Backend ──▶ Event Queue ──▶ Analytics Service ──▶ TimescaleDB
                                             │
                                             ▼
                                      Aggregation Jobs
                                             │
                                             ▼
                                      Summary Tables
                                             │
                                             ▼
                                      Dashboard APIs
```

---

## Inter-Service Communication

### Synchronous (REST)

```
Service-to-Service REST
═══════════════════════

NFT Service ──HTTP──▶ Auth Service
   └── Validate user token for minting

Payment Service ──HTTP──▶ NFT Service
   └── Update ownership after purchase
```

### Asynchronous (Message Queue)

```
Event-Driven Communication
══════════════════════════

┌─────────────┐    publish    ┌─────────────┐    consume    ┌─────────────┐
│ NFT Service │──────────────▶│ Message     │──────────────▶│ Analytics   │
│             │               │ Queue       │               │ Service     │
└─────────────┘               │ (Redis)     │               └─────────────┘
                              │             │
                              │             │               ┌─────────────┐
                              │             │──────────────▶│ Notification│
                              │             │               │ Service     │
                              └─────────────┘               └─────────────┘

Events:
├── master.registered
├── ipo.launched
├── share.minted
├── vote.cast
└── session.locked
```

---

## Smart Contract Integration

### Separation of Concerns

```
ON-CHAIN vs OFF-CHAIN
═════════════════════

ON-CHAIN (Smart Contracts)
├── NFT ownership
├── Token balances
├── Royalty configuration
├── Dividend distribution
├── Staking state
└── Governance votes

OFF-CHAIN (Backend)
├── User profiles
├── Master metadata (references IPFS)
├── Session management
├── Analytics
├── Notifications
└── Search and discovery
```

### Contract Interaction Layer

```typescript
// services/blockchain/masterContract.ts
export class MasterContractService {
  private provider: ethers.Provider
  private wallet: ethers.Wallet

  async deployMasterContract(metadata: MasterMetadata): Promise<string> {
    const factory = new ethers.ContractFactory(MasterABI, MasterBytecode, this.wallet)
    const contract = await factory.deploy(metadata.ipfsHash, metadata.artist)
    await contract.waitForDeployment()
    return contract.address
  }

  async mintShares(contractAddress: string, count: number): Promise<string[]> {
    const contract = new ethers.Contract(contractAddress, MasterABI, this.wallet)
    const tx = await contract.batchMint(count)
    const receipt = await tx.wait()
    return extractTokenIds(receipt)
  }
}
```

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Language** | TypeScript (Node.js) |
| **Framework** | Fastify |
| **API Spec** | OpenAPI 3.0 |
| **Database ORM** | Prisma |
| **Queue** | BullMQ (Redis-based) |
| **Blockchain** | ethers.js v6 |
| **WebSocket** | Socket.io |
| **Validation** | Zod |

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/audifi
REDIS_URL=redis://host:6379

# Blockchain
RPC_URL=https://mainnet.infura.io/v3/key
PRIVATE_KEY=0x...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# IPFS
PINATA_API_KEY=...
PINATA_SECRET_KEY=...

# Auth
JWT_SECRET=...
MAGIC_LINK_SECRET=...
```

### Service Discovery

```yaml
# config/services.yaml
services:
  auth:
    url: http://auth-service:3001
    healthcheck: /health
  nft:
    url: http://nft-service:3002
    healthcheck: /health
  vstudio:
    url: http://vstudio-service:3003
    healthcheck: /health
  # ...
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "MASTER_NOT_FOUND",
    "message": "Master with ID xyz not found",
    "details": {
      "masterId": "xyz"
    }
  },
  "requestId": "req_123abc"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request payload |
| `RATE_LIMITED` | 429 | Too many requests |
| `BLOCKCHAIN_ERROR` | 502 | Contract call failed |

---

## Status

| Service | Status | Notes |
|---------|--------|-------|
| Auth Service | 🔄 PLANNED | Design complete |
| NFT/IPO Service | 🔄 PLANNED | Design complete |
| V Studio Service | 🔄 PLANNED | WebSocket design in progress |
| Artist Coin Service | 🔄 PLANNED | Depends on contracts |
| Payment Service | 🔄 PLANNED | Stripe integration ready |
| Analytics Service | 🔄 PLANNED | Basic design |

---

## Related Documents

- [Architecture Overview](./overview.md)
- [Frontend Architecture](./frontend.md)
- [Database Architecture](./database.md)
- [API Overview](../api/overview.md)
- [Security Overview](./security-overview.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
