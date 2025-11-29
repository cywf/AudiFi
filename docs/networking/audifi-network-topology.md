# AudiFi Network Topology

## Overview

This document defines the target network topology for AudiFi, designed to support the platform's requirements:

- Web frontend(s) under `audifi.io`
- Backend containers on Ubuntu 24.04 LTS server (16GB RAM, 4 vCPU, 200GB disk)
- Blockchain RPC/indexer connectivity
- Third-party API integrations
- Real-time V Studio connectivity

---

## High-Level Architecture

```
                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                      INTERNET                               │
                                    └─────────────────────────────────────────────────────────────┘
                                                              │
                          ┌───────────────────────────────────┼───────────────────────────────────┐
                          │                                   │                                   │
                          ▼                                   ▼                                   ▼
                   ┌─────────────┐                     ┌─────────────┐                     ┌─────────────┐
                   │   CDN/Edge  │                     │   CDN/Edge  │                     │    DNS      │
                   │   (Vercel)  │                     │  (Fly Edge) │                     │ (Cloudflare)│
                   └──────┬──────┘                     └──────┬──────┘                     └─────────────┘
                          │                                   │
                          │ audifi.io                         │ api.audifi.io
                          │ app.audifi.io                     │ studio.audifi.io
                          ▼                                   ▼
                   ┌─────────────┐                     ┌─────────────────────────────────────────────────┐
                   │  Frontend   │                     │              BACKEND SERVER                     │
                   │   (React)   │                     │           Ubuntu 24.04 LTS                      │
                   │   Static    │                     │    16GB RAM | 4 vCPU | 200GB Disk               │
                   │    Build    │                     │                                                 │
                   └─────────────┘                     │  ┌───────────────────────────────────────────┐  │
                                                       │  │           Reverse Proxy (Caddy)           │  │
                                                       │  │         TLS Termination + Routing         │  │
                                                       │  │              :80, :443                    │  │
                                                       │  └────────────────┬──────────────────────────┘  │
                                                       │                   │                             │
                                                       │     ┌─────────────┼─────────────┐               │
                                                       │     │             │             │               │
                                                       │     ▼             ▼             ▼               │
                                                       │  ┌──────┐    ┌──────┐    ┌──────────┐          │
                                                       │  │ API  │    │  WS  │    │  Worker  │          │
                                                       │  │Server│    │Server│    │ Service  │          │
                                                       │  │:3000 │    │:3001 │    │  :3002   │          │
                                                       │  └──┬───┘    └──┬───┘    └────┬─────┘          │
                                                       │     │           │             │                 │
                                                       │     └─────────┬─┴─────────────┘                 │
                                                       │               │                                 │
                                                       │               ▼                                 │
                                                       │  ┌─────────────────────────────┐               │
                                                       │  │        Redis                │               │
                                                       │  │   (Pub/Sub + Cache)         │               │
                                                       │  │        :6379                │               │
                                                       │  └─────────────────────────────┘               │
                                                       │               │                                 │
                                                       │               ▼                                 │
                                                       │  ┌─────────────────────────────┐               │
                                                       │  │      PostgreSQL             │               │
                                                       │  │       Database              │               │
                                                       │  │        :5432                │               │
                                                       │  └─────────────────────────────┘               │
                                                       │                                                 │
                                                       └─────────────────────────────────────────────────┘
                                                                           │
                              ┌────────────────────────────────────────────┴────────────────────────────────────────────┐
                              │                                                                                         │
                              ▼                                                                                         ▼
          ┌─────────────────────────────────────────────────────┐               ┌─────────────────────────────────────────────────────┐
          │                  EXTERNAL APIS                      │               │                 BLOCKCHAIN                          │
          │  • Stripe (Payments)                                │               │  • Ethereum RPC (Alchemy/Infura)                    │
          │  • Email (SendGrid/Resend)                          │               │  • Base/Polygon RPC (L2)                            │
          │  • OAuth (Google, Microsoft)                        │               │  • Blockchain Indexer (The Graph/Custom)            │
          │  • Streaming (Twitch, YouTube, TikTok, Discord)     │               │  • Solana RPC (QuickNode/Helius)                    │
          └─────────────────────────────────────────────────────┘               └─────────────────────────────────────────────────────┘
```

---

## Component Descriptions

### 1. Frontend Layer

#### Primary Web App
- **Hosts:** `audifi.io`, `app.audifi.io`
- **Platform:** Vercel (primary) or Fly.io (alternative)
- **Technology:** React + Vite static build
- **Purpose:**
  - Marketing/landing pages
  - Artist and fan dashboards
  - Master IPO interface
  - V Studio web UI

#### Key Characteristics
- Globally distributed via CDN edge nodes
- Automatic SSL/TLS via platform
- Environment-based deployments (staging, production)
- Zero-downtime deployments

---

### 2. Backend Layer (Ubuntu 24.04 LTS Server)

#### Reverse Proxy (Caddy)
- **Ports:** 80 (HTTP → HTTPS redirect), 443 (HTTPS)
- **Responsibilities:**
  - TLS termination with automatic Let's Encrypt
  - Request routing to internal services
  - Rate limiting at edge
  - HTTP/2 and HTTP/3 support
  - WebSocket upgrade handling

#### API Server
- **Internal Port:** 3000
- **External Path:** `api.audifi.io/*`
- **Purpose:**
  - RESTful API endpoints
  - GraphQL API (if applicable)
  - Master IPO APIs
  - Auth, subscriptions & payments
  - Analytics read endpoints

#### WebSocket Server
- **Internal Port:** 3001
- **External Path:** `api.audifi.io/ws/*` or `studio.audifi.io/*`
- **Purpose:**
  - V Studio real-time sessions
  - Live fan interactions
  - Producer/artist dashboards
  - Chat aggregation broadcast

#### Worker Service
- **Internal Port:** 3002
- **Purpose:**
  - Background job processing
  - Chat platform ingestion
  - Blockchain event listeners
  - Scheduled tasks (analytics, reports)

---

### 3. Data Layer

#### PostgreSQL Database
- **Port:** 5432 (internal only)
- **Access:** Backend services only
- **Data:**
  - User accounts and profiles
  - Track metadata
  - Subscription records
  - V Studio session data
  - Analytics aggregates

#### Redis
- **Port:** 6379 (internal only)
- **Use Cases:**
  - Pub/Sub for real-time events
  - Session cache
  - Rate limiting counters
  - Background job queues

---

### 4. External Connectivity

#### Blockchain RPC Providers
| Network | Provider Options | Purpose |
|---------|-----------------|---------|
| Ethereum Mainnet | Alchemy, Infura, QuickNode | Master Contract reads |
| Base / Polygon | Alchemy, Infura | Primary deployment (lower fees) |
| Solana | QuickNode, Helius | Alternative chain support |

#### Third-Party APIs (Outbound)
| Service | Protocol | Purpose |
|---------|----------|---------|
| Stripe | HTTPS | Payment processing |
| SendGrid/Resend | HTTPS | Transactional email |
| Google OAuth | HTTPS | SSO authentication |
| Twitch/YouTube/TikTok | HTTPS/WSS | Chat & stream data |
| Discord | HTTPS/WSS | Community integration |

#### Inbound Webhooks
| Endpoint | Source | Purpose |
|----------|--------|---------|
| `/webhooks/stripe` | Stripe | Payment events |
| `/webhooks/twitch` | Twitch | Stream events (if enabled) |

---

## Network Zones

### Public Zone (Internet-Facing)
```
Entry Points:
├── audifi.io (Vercel CDN)
├── app.audifi.io (Vercel CDN)
├── api.audifi.io (Backend Server :443)
└── studio.audifi.io (Backend Server :443, optional)
```

### Private Zone (Internal Only)
```
Internal Services (Docker Network):
├── api-server:3000
├── ws-server:3001
├── worker:3002
├── postgres:5432
└── redis:6379
```

### DMZ / Semi-Private
```
Reverse Proxy:
└── caddy:80,443 → Internal services
```

---

## Traffic Flow Patterns

### 1. Web App Request Flow
```
User Browser
    │
    ▼ HTTPS
[Vercel CDN] ──→ Static Assets (JS, CSS, Images)
    │
    ▼ API Calls
[api.audifi.io]
    │
    ▼ HTTPS :443
[Caddy Reverse Proxy]
    │
    ▼ HTTP :3000
[API Server Container]
    │
    ▼
[PostgreSQL / Redis]
```

### 2. V Studio Real-Time Flow
```
Artist/Producer/Viewer Browser
    │
    ▼ WSS (WebSocket Secure)
[api.audifi.io/ws OR studio.audifi.io]
    │
    ▼ WSS → WS upgrade
[Caddy Reverse Proxy]
    │
    ▼ WS :3001
[WebSocket Server Container]
    │
    ▼ Pub/Sub
[Redis]
    │
    ▼ Broadcast
[Connected Clients]
```

### 3. Blockchain Interaction Flow
```
[API/Worker Container]
    │
    ▼ HTTPS (RPC)
[Alchemy/Infura/QuickNode]
    │
    ▼
[Ethereum/Base/Polygon/Solana Networks]
```

### 4. Stripe Webhook Flow
```
Stripe Servers
    │
    ▼ POST HTTPS
[api.audifi.io/webhooks/stripe]
    │
    ▼
[Caddy] → [API Server]
    │
    ▼ Signature Verification
[Process Event]
    │
    ▼
[PostgreSQL Update]
```

---

## Resource Allocation (16GB RAM, 4 vCPU)

### Container Resource Limits

| Service | Memory | CPU | Replicas |
|---------|--------|-----|----------|
| Caddy | 256MB | 0.25 | 1 |
| API Server | 2GB | 1.0 | 2 |
| WebSocket Server | 2GB | 0.75 | 2 |
| Worker Service | 1GB | 0.5 | 1 |
| PostgreSQL | 4GB | 1.0 | 1 |
| Redis | 512MB | 0.25 | 1 |
| **System Reserve** | 2GB | 0.25 | - |
| **Total** | ~14GB | ~4 | - |

---

## Scaling Considerations

### Horizontal Scaling (Future)

1. **API/WebSocket Servers:** Add replicas with load balancing
2. **Database:** Move to managed PostgreSQL (RDS, Supabase, Neon)
3. **Redis:** Managed Redis (ElastiCache, Upstash)
4. **CDN:** Already globally distributed via Vercel

### Vertical Scaling Path
- Current: 16GB RAM, 4 vCPU
- Next tier: 32GB RAM, 8 vCPU
- Beyond: Kubernetes cluster or managed container platform

---

## Environment Segregation

### Production
- `audifi.io`, `app.audifi.io`, `api.audifi.io`
- Production database
- Production blockchain networks (mainnet)

### Staging
- `staging.audifi.io`, `staging-api.audifi.io`
- Separate staging database
- Testnet blockchain connections

### Development
- `localhost:5173` (frontend)
- `localhost:3000` (API)
- Docker Compose for local services

---

## Summary

This topology provides:

✅ **Separation of Concerns** - Frontend (CDN), Backend (Server), Data (Internal)  
✅ **Security** - TLS everywhere, internal-only data layer  
✅ **Scalability** - Containerized services, horizontal scaling ready  
✅ **Real-Time Support** - Dedicated WebSocket infrastructure  
✅ **Blockchain Ready** - External RPC connectivity patterns  
✅ **Observability** - Centralized entry point for logging/metrics

---

## Related Documents

- [Network Audit](./audifi-network-audit.md)
- [Domains and TLS](./audifi-domains-and-tls.md)
- [V Studio Real-Time](./audifi-vstudio-realtime.md)
- [External Integrations](./audifi-external-integrations.md)
- [Security Alignment](./audifi-security-alignment.md)
- [Observability](./audifi-observability.md)
