# Database Architecture

> Data Model and Storage Strategy for AudiFi

## Overview

AudiFi uses a combination of relational database (PostgreSQL), cache (Redis), and decentralized storage (IPFS) to manage application data. This document outlines the data model and storage strategies.

> **Status:** 🔄 PLANNED - Database schema is in the design phase.

---

## Storage Strategy

```
DATA STORAGE LAYERS
═══════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        POSTGRESQL                                   │  │
│   │                                                                     │  │
│   │   Transactional Data                    Reference Data              │  │
│   │   ─────────────────                    ──────────────              │  │
│   │   • Users & Auth                       • Genres                    │  │
│   │   • Masters & IPOs                     • Subscription Tiers        │  │
│   │   • V Studio Sessions                  • Platform Config           │  │
│   │   • Subscriptions                                                   │  │
│   │   • Transactions                                                    │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                           REDIS                                     │  │
│   │                                                                     │  │
│   │   Session Cache            Rate Limiting          Real-time State   │  │
│   │   ─────────────            ────────────           ──────────────   │  │
│   │   • Auth sessions          • API limits           • V Studio state  │  │
│   │   • User preferences       • IP blocks            • Presence        │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                           IPFS                                      │  │
│   │                                                                     │  │
│   │   Immutable Content                                                 │  │
│   │   ─────────────────                                                 │  │
│   │   • Master audio files                                              │  │
│   │   • Cover artwork                                                   │  │
│   │   • NFT metadata JSON                                               │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        BLOCKCHAIN                                   │  │
│   │                                                                     │  │
│   │   On-chain State                                                    │  │
│   │   ──────────────                                                    │  │
│   │   • NFT ownership                                                   │  │
│   │   • Token balances                                                  │  │
│   │   • Contract state                                                  │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Diagram

```
CORE ENTITIES
═════════════

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   USERS     │       │  MASTERS    │       │ NFT_SHARES  │
│             │       │             │       │             │
│ id          │◀──────│ artist_id   │       │ id          │
│ email       │       │ id          │◀──────│ master_id   │
│ wallet_addr │       │ title       │       │ token_id    │
│ created_at  │       │ ipfs_hash   │       │ owner_id    │
└──────┬──────┘       │ status      │       │ tier        │
       │              └──────┬──────┘       │ minted_at   │
       │                     │              └─────────────┘
       │                     │
       │              ┌──────┴──────┐
       │              │             │
       │              ▼             ▼
       │        ┌───────────┐ ┌───────────┐
       │        │  IPO_     │ │ VSTUDIO_  │
       │        │  CONFIGS  │ │ SESSIONS  │
       │        │           │ │           │
       │        │ master_id │ │ master_id │
       │        │ price     │ │ status    │
       │        │ supply    │ │ created_at│
       │        └───────────┘ └─────┬─────┘
       │                            │
       │                            ▼
       │                      ┌───────────┐
       │                      │ DECISIONS │
       │                      │           │
       │                      │ session_id│
       │                      │ type      │
       │                      │ options   │
       │                      └─────┬─────┘
       │                            │
       │                            ▼
       │                      ┌───────────┐
       │                      │  VOTES    │
       └─────────────────────▶│           │
                              │ user_id   │
                              │ decision_ │
                              │ choice    │
                              └───────────┘
```

---

## Table Schemas

### Users

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  display_name    VARCHAR(100),
  wallet_address  VARCHAR(42) UNIQUE,
  avatar_url      TEXT,
  bio             TEXT,
  
  -- Authentication
  password_hash   VARCHAR(255),
  totp_secret     VARCHAR(255),
  totp_enabled    BOOLEAN DEFAULT FALSE,
  
  -- Subscription
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- Metadata
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at   TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

### Masters

```sql
CREATE TABLE masters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       UUID NOT NULL REFERENCES users(id),
  
  -- Metadata
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  genre           VARCHAR(50),
  bpm             INTEGER,
  mood_tags       TEXT[],
  
  -- Storage
  audio_ipfs_hash VARCHAR(100),
  cover_ipfs_hash VARCHAR(100),
  metadata_ipfs_hash VARCHAR(100),
  
  -- Status
  status          master_status NOT NULL DEFAULT 'DRAFT',
  
  -- Contract references
  contract_address VARCHAR(42),
  dividend_contract VARCHAR(42),
  
  -- Timestamps
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at    TIMESTAMP WITH TIME ZONE
);

CREATE TYPE master_status AS ENUM (
  'DRAFT',
  'IN_VSTUDIO',
  'LOCKED',
  'MINTED',
  'LISTED',
  'SOLD'
);

CREATE INDEX idx_masters_artist ON masters(artist_id);
CREATE INDEX idx_masters_status ON masters(status);
```

### IPO Configurations

```sql
CREATE TABLE ipo_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id       UUID NOT NULL REFERENCES masters(id),
  
  -- Pricing
  initial_price   DECIMAL(18, 8) NOT NULL,
  currency        VARCHAR(10) DEFAULT 'ETH',
  
  -- Supply
  total_supply    INTEGER NOT NULL,
  artist_reserve  INTEGER DEFAULT 0,
  public_supply   INTEGER GENERATED ALWAYS AS (total_supply - artist_reserve) STORED,
  
  -- Mover Advantage
  tier1_count     INTEGER DEFAULT 10,
  tier1_royalty   DECIMAL(5, 2) DEFAULT 10.00,
  tier2_count     INTEGER DEFAULT 40,
  tier2_royalty   DECIMAL(5, 2) DEFAULT 5.00,
  tier3_count     INTEGER DEFAULT 50,
  tier3_royalty   DECIMAL(5, 2) DEFAULT 3.00,
  tier4_royalty   DECIMAL(5, 2) DEFAULT 1.00,
  
  -- Dates
  start_date      TIMESTAMP WITH TIME ZONE,
  end_date        TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ipo_master ON ipo_configs(master_id);
```

### NFT Shares

```sql
CREATE TABLE nft_shares (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id       UUID NOT NULL REFERENCES masters(id),
  
  -- On-chain reference
  token_id        INTEGER NOT NULL,
  owner_id        UUID REFERENCES users(id),
  owner_wallet    VARCHAR(42),
  
  -- Mover Advantage
  tier            INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 4),
  royalty_percent DECIMAL(5, 2) NOT NULL,
  
  -- Timestamps
  minted_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_transfer   TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_shares_token ON nft_shares(master_id, token_id);
CREATE INDEX idx_shares_owner ON nft_shares(owner_id);
CREATE INDEX idx_shares_wallet ON nft_shares(owner_wallet);
```

### V Studio Sessions

```sql
CREATE TABLE vstudio_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id       UUID NOT NULL REFERENCES masters(id),
  
  -- Access
  access_type     access_type NOT NULL DEFAULT 'PUBLIC',
  required_nft    UUID REFERENCES masters(id),
  required_coin   VARCHAR(42),
  
  -- Status
  status          session_status NOT NULL DEFAULT 'DRAFT',
  
  -- Timestamps
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end   TIMESTAMP WITH TIME ZONE,
  actual_start    TIMESTAMP WITH TIME ZONE,
  actual_end      TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE access_type AS ENUM ('PUBLIC', 'NFT_GATED', 'COIN_GATED', 'SUBSCRIPTION');
CREATE TYPE session_status AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'VOTING', 'LOCKED', 'COMPLETE');
```

### Decisions

```sql
CREATE TABLE decisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES vstudio_sessions(id),
  
  -- Decision details
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  decision_type   VARCHAR(50) NOT NULL,
  options         JSONB NOT NULL,
  
  -- Status
  status          decision_status DEFAULT 'PENDING',
  winning_option  VARCHAR(100),
  
  -- Timestamps
  opens_at        TIMESTAMP WITH TIME ZONE,
  closes_at       TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE decision_status AS ENUM ('PENDING', 'OPEN', 'CLOSED', 'FINALIZED');
CREATE INDEX idx_decisions_session ON decisions(session_id);
```

### Votes

```sql
CREATE TABLE votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id     UUID NOT NULL REFERENCES decisions(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  
  -- Vote
  choice          VARCHAR(100) NOT NULL,
  weight          DECIMAL(10, 4) DEFAULT 1.0,
  
  -- Timestamps
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_votes_unique ON votes(decision_id, user_id);
CREATE INDEX idx_votes_decision ON votes(decision_id);
```

### Subscriptions

```sql
CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  
  -- Stripe reference
  stripe_customer_id    VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  
  -- Plan
  plan              subscription_plan NOT NULL,
  status            subscription_status NOT NULL,
  
  -- Dates
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end   TIMESTAMP WITH TIME ZONE,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at         TIMESTAMP WITH TIME ZONE
);

CREATE TYPE subscription_plan AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'INCOMPLETE');
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
```

### Artist Coins

```sql
CREATE TABLE artist_coins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id       UUID NOT NULL REFERENCES users(id),
  
  -- Token details
  name            VARCHAR(100) NOT NULL,
  symbol          VARCHAR(10) NOT NULL,
  contract_address VARCHAR(42) UNIQUE,
  
  -- Supply
  total_supply    DECIMAL(28, 18) NOT NULL,
  
  -- Pool
  pool_address    VARCHAR(42),
  initial_liquidity DECIMAL(28, 18),
  
  -- Timestamps
  deployed_at     TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_coins_artist ON artist_coins(artist_id);
```

---

## On-Chain vs Off-Chain

### Data Distribution

| Data | Storage | Reason |
|------|---------|--------|
| User profile | Off-chain (PG) | Mutable, private |
| NFT ownership | On-chain | Source of truth |
| Master metadata | Off-chain + IPFS | Efficient queries |
| Audio files | IPFS | Immutable, decentralized |
| Vote records | Off-chain | Performance |
| Token balances | On-chain | Financial accuracy |
| Analytics | Off-chain | Aggregation needs |

### Synchronization

```
BLOCKCHAIN ←→ DATABASE SYNC
════════════════════════════

Events Monitored:
├── Transfer(from, to, tokenId)
│   └── Update nft_shares.owner_wallet
│
├── MasterRegistered(masterId, contractAddress)
│   └── Update masters.contract_address
│
├── DividendDeposited(masterId, amount)
│   └── Insert into dividend_events
│
└── ArtistCoinDeployed(artistId, contractAddress)
    └── Update artist_coins.contract_address
```

---

## Indexing Strategy

### Primary Indexes

- All primary keys (UUID)
- Foreign key references
- Unique constraints (email, wallet_address)

### Query-Optimized Indexes

```sql
-- Marketplace queries
CREATE INDEX idx_masters_status_published ON masters(status, published_at DESC)
  WHERE status IN ('LISTED', 'MINTED');

-- User dashboard
CREATE INDEX idx_shares_owner_master ON nft_shares(owner_id, master_id);

-- V Studio active sessions
CREATE INDEX idx_sessions_active ON vstudio_sessions(status)
  WHERE status IN ('ACTIVE', 'VOTING');

-- Analytics time-series
CREATE INDEX idx_events_time ON analytics_events(created_at DESC);
```

---

## Analytics Schema

### Events Table

```sql
CREATE TABLE analytics_events (
  id              BIGSERIAL PRIMARY KEY,
  event_type      VARCHAR(50) NOT NULL,
  user_id         UUID,
  master_id       UUID,
  session_id      UUID,
  
  -- Event data
  properties      JSONB,
  
  -- Context
  ip_address      INET,
  user_agent      TEXT,
  
  -- Timestamp
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partition by month for performance
CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Summary Views

```sql
-- Daily master stats
CREATE MATERIALIZED VIEW mv_daily_master_stats AS
SELECT 
  date_trunc('day', created_at) as date,
  master_id,
  COUNT(*) FILTER (WHERE event_type = 'view') as views,
  COUNT(*) FILTER (WHERE event_type = 'play') as plays,
  COUNT(*) FILTER (WHERE event_type = 'purchase') as purchases
FROM analytics_events
GROUP BY date_trunc('day', created_at), master_id;

-- Refresh hourly
CREATE INDEX idx_mv_daily_stats ON mv_daily_master_stats(date, master_id);
```

---

## Redis Usage

### Session Storage

```
# Session key pattern
session:{session_id} → {user_id, created_at, expires_at}
TTL: 24 hours
```

### Rate Limiting

```
# Rate limit key pattern
ratelimit:{ip}:{endpoint} → {count}
TTL: Window size (e.g., 60 seconds)
```

### V Studio State

```
# Real-time session state
vstudio:{session_id}:state → {current_decision, participants, vote_counts}
vstudio:{session_id}:presence → {user_ids}
```

---

## IPFS Integration

### Content Types

| Content | Pinning Strategy | CID Stored |
|---------|-----------------|------------|
| Audio files | Permanent (Pinata) | masters.audio_ipfs_hash |
| Cover art | Permanent (Pinata) | masters.cover_ipfs_hash |
| Metadata JSON | Permanent (Pinata) | masters.metadata_ipfs_hash |

### Metadata Structure

```json
{
  "name": "Electric Dreams",
  "description": "A journey through sound...",
  "image": "ipfs://QmCoverArt...",
  "animation_url": "ipfs://QmAudio...",
  "attributes": [
    {"trait_type": "Genre", "value": "Electronic"},
    {"trait_type": "BPM", "value": 128}
  ]
}
```

---

## Status

| Component | Status |
|-----------|--------|
| Schema Design | 🔄 PLANNED |
| PostgreSQL Setup | 🔄 PLANNED |
| Redis Setup | 🔄 PLANNED |
| IPFS Integration | 🔄 PLANNED |
| Migrations | 🔄 PLANNED |

---

## Related Documents

- [Architecture Overview](./overview.md)
- [Backend Architecture](./backend.md)
- [Token Model](../concepts/token-model.md)
- [Security Overview](./security-overview.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
