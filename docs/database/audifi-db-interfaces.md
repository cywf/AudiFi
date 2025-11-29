# AudiFi Database Interfaces

**Document Version**: 1.0  
**Last Updated**: 2024-12

---

## Overview

This document describes how the database layer integrates with other AudiFi agents and services. It defines table ownership, transaction boundaries, and API expectations.

---

## 1. BACKEND-AGENT Integration

### 1.1 Service-to-Table Mapping

| Service | Primary Tables | Description |
|---------|---------------|-------------|
| **Auth Service** | `users`, `accounts`, `roles`, `user_roles` | User authentication and authorization |
| **Artist Service** | `artists`, `producers`, `artist_follows` | Artist/producer profile management |
| **Master Service** | `masters`, `master_collaborators` | Master CRUD operations |
| **IPO Service** | `master_ipos`, `master_contracts` | IPO configuration and launch |
| **NFT Service** | `master_nfts`, `nft_transfers` | NFT state (read-heavy, writes from indexer) |
| **Revenue Service** | `revenue_events`, `dividend_events`, `dividend_claims` | Revenue ingestion and tracking |
| **Token Service** | `artist_tokens`, `token_holders` | Artist coin management |
| **V Studio Service** | `vstudio_*` | All V Studio tables |
| **Subscription Service** | `subscriptions`, `invoices`, `payment_*` | Billing and payments |
| **Webhook Service** | `webhooks_log` | External webhook processing |

### 1.2 Transaction Boundaries

#### Creating a Master with IPO

```typescript
// All-or-nothing: Master + IPO config should succeed together
await db.transaction(async (tx) => {
  // 1. Create master
  const [master] = await tx.insert(masters).values({
    artistId,
    title,
    description,
    // ...
  }).returning();
  
  // 2. Create IPO configuration
  await tx.insert(masterIpos).values({
    masterId: master.id,
    totalSupply,
    revenueShareNftHoldersBps,
    // ...
  });
  
  // 3. Create audit log
  await tx.insert(auditLogs).values({
    action: 'create_master_with_ipo',
    targetType: 'master',
    targetId: master.id,
    // ...
  });
  
  return master;
});
```

#### Recording Revenue Event

```typescript
// Transaction: Revenue event + enqueue distribution job
await db.transaction(async (tx) => {
  // 1. Insert revenue event
  const [event] = await tx.insert(revenueEvents).values({
    masterId,
    sourceType,
    amount,
    currency,
    status: 'verified',
  }).returning();
  
  // 2. Audit log
  await tx.insert(auditLogs).values({
    action: 'record_revenue',
    targetType: 'revenue_event',
    targetId: event.id,
  });
  
  return event;
});

// After commit, enqueue distribution job
await jobQueue.add('distribute_revenue', { revenueEventId: event.id });
```

#### V Studio Vote Submission

```typescript
await db.transaction(async (tx) => {
  // 1. Verify eligibility (read)
  const eligibility = await verifyVoteEligibility(tx, userId, decisionPointId);
  if (!eligibility.allowed) throw new Error('Not eligible');
  
  // 2. Insert vote
  const [vote] = await tx.insert(vstudioVotes).values({
    decisionPointId,
    vstudioSessionId,
    userId,
    optionSelected,
    weight: eligibility.weight,
    verifiedNftHolder: eligibility.isNftHolder,
    verifiedCoinHolder: eligibility.isCoinHolder,
  }).returning();
  
  // 3. Update session stats
  await tx.update(vstudioSessions)
    .set({
      totalVotes: sql`${vstudioSessions.totalVotes} + 1`,
    })
    .where(eq(vstudioSessions.id, vstudioSessionId));
  
  // 4. Update participant record
  await tx.update(vstudioParticipants)
    .set({
      votesCount: sql`${vstudioParticipants.votesCount} + 1`,
    })
    .where(and(
      eq(vstudioParticipants.vstudioSessionId, vstudioSessionId),
      eq(vstudioParticipants.userId, userId),
    ));
  
  return vote;
});
```

### 1.3 Query Patterns

#### Optimistic Locking

For concurrent updates, use version columns:

```typescript
// Update IPO with optimistic lock
const result = await db.update(masterIpos)
  .set({
    status: 'live',
    actualStartAt: new Date(),
    updatedAt: new Date(),
  })
  .where(and(
    eq(masterIpos.id, ipoId),
    eq(masterIpos.status, 'scheduled'), // Only if still scheduled
  ))
  .returning();

if (result.length === 0) {
  throw new Error('IPO status has changed - concurrent modification');
}
```

---

## 2. FRONTEND-AGENT Integration

### 2.1 API Field Exposure

#### Public Fields (No Auth Required)

| Endpoint | Fields |
|----------|--------|
| `GET /artists/:slug` | `artistName`, `slug`, `bio`, `profileImageUrl`, `socialLinks`, `isVerified` |
| `GET /masters/:id` | `title`, `description`, `genre`, `coverImageUrl`, `artist.artistName` |
| `GET /marketplace` | Listed NFTs with master info, prices, listing status |

#### Authenticated Fields

| Endpoint | Fields | Notes |
|----------|--------|-------|
| `GET /me` | Full user object | Excludes `two_factor_secret` |
| `GET /me/portfolio` | Owned NFTs, dividend balances | Scoped to user's wallets |
| `GET /me/subscriptions` | Subscription details | Stripe IDs hidden |

#### Role-Gated Fields

| Endpoint | Required Role | Fields |
|----------|---------------|--------|
| `GET /masters/:id/analytics` | Master owner | Revenue events, dividend history |
| `GET /vstudio/:id/results` | Session owner | Detailed vote breakdown |
| `GET /admin/users` | Admin | Full user list with emails |

### 2.2 API Response Shaping

```typescript
// Service layer shapes data for frontend
function toPublicMaster(master: Master, ipo: MasterIpo): PublicMaster {
  return {
    id: master.id,
    title: master.title,
    description: master.description,
    genre: master.genre,
    coverImageUrl: master.coverImageUrl,
    artist: {
      id: master.artist.id,
      name: master.artist.artistName,
      slug: master.artist.slug,
      isVerified: master.artist.isVerified,
    },
    ipo: ipo ? {
      totalSupply: ipo.totalSupply,
      mintedSupply: ipo.mintedSupply,
      status: ipo.status,
      // Exclude internal fields like retainedPlatformBps
    } : null,
  };
}
```

### 2.3 Real-time Subscriptions

For live updates (V Studio, IPO progress):

```typescript
// WebSocket event types
type DatabaseEvent = 
  | { type: 'vstudio.vote'; sessionId: string; totalVotes: number }
  | { type: 'ipo.mint'; masterId: string; mintedSupply: number }
  | { type: 'nft.transfer'; nftId: string; newOwner: string };
```

---

## 3. NETWORKING-AGENT Integration

### 3.1 Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                        VPC / Private Network                 │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────┐ │
│  │   Backend     │────▶│   PostgreSQL  │◀────│  Indexer  │ │
│  │   Services    │     │   Database    │     │  Service  │ │
│  └───────────────┘     └───────────────┘     └───────────┘ │
│         │                     │                     │       │
│         │                     │                     │       │
│  ┌──────┴──────┐       ┌──────┴──────┐       ┌─────┴─────┐ │
│  │   Redis     │       │   Backups   │       │  RPC Node │ │
│  │   Cache     │       │   (S3/GCS)  │       │           │ │
│  └─────────────┘       └─────────────┘       └───────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (No public access)
                              ▼
                    ┌─────────────────┐
                    │   Public API    │
                    │   Gateway       │
                    └─────────────────┘
```

### 3.2 Database Access Rules

- **Only backend services** can connect to PostgreSQL
- Database is on private subnet with no public IP
- Connections use SSL/TLS
- IP allowlisting for database access

### 3.3 Connection Security

```typescript
// Connection with SSL
const sql = postgres(process.env.AUDIFI_DATABASE_URL, {
  ssl: { rejectUnauthorized: true },
  connection: {
    application_name: 'audifi-backend',
  },
});
```

---

## 4. SECURITY-AGENT Integration

### 4.1 Tables Requiring Encryption at Rest

| Table | Columns | Encryption Type |
|-------|---------|-----------------|
| `users` | `two_factor_secret` | AES-256 (app-level) |
| `accounts` | `access_token`, `refresh_token` | AES-256 |
| `identity_providers` | `client_secret` | AES-256 |
| `payment_providers` | `webhook_secret`, `config_json` | AES-256 |

Enable PostgreSQL encryption at rest via cloud provider settings.

### 4.2 Tables Requiring Strict Access Control

| Table | Access Level | Notes |
|-------|--------------|-------|
| `audit_logs` | Admin read-only | Append-only for app |
| `security_events` | Security team | Investigation |
| `revenue_events` | Finance + artist owner | Financial data |
| `invoices` | Finance + user owner | Payment history |
| `webhooks_log` | Backend services | Debugging |

### 4.3 Security Event Integration

```typescript
// Log security-relevant events to security_events table
async function logSecurityEvent(event: SecurityEventInput): Promise<void> {
  await db.insert(securityEvents).values({
    eventType: event.type,
    severity: event.severity,
    userId: event.userId,
    title: event.title,
    description: event.description,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    eventData: event.data,
  });
  
  // Alert if high severity
  if (event.severity === 'high' || event.severity === 'critical') {
    await alertSecurityTeam(event);
  }
}
```

### 4.4 Row-Level Security (Multi-tenant)

If implementing multi-tenant isolation:

```sql
-- Artists can only access their own masters
CREATE POLICY masters_artist_policy ON masters
  FOR ALL
  USING (
    artist_id IN (
      SELECT id FROM artists WHERE user_id = current_setting('app.user_id')::uuid
    )
  );
```

---

## 5. CI-CD-AGENT Integration

### 5.1 Migration Workflow

```yaml
# .github/workflows/database-migrations.yml
name: Database Migrations

on:
  push:
    paths:
      - 'db/migrations/**'
      - 'db/schema/**'

jobs:
  migrate-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Run migrations
        run: npx drizzle-kit migrate
        env:
          AUDIFI_DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
          
  migrate-production:
    needs: migrate-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Run migrations
        run: npx drizzle-kit migrate
        env:
          AUDIFI_DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
```

### 5.2 Migration Best Practices

1. **Always reversible**: Include down migrations
2. **Non-blocking**: Avoid long-running locks
3. **Staged rollout**: Staging → Production with validation
4. **Backup before**: Snapshot database before major migrations

### 5.3 Seed Data for Development

```bash
# CI/CD environment setup
npm run db:seed -- --env=test

# Local development
npm run db:seed -- --env=dev
```

### 5.4 Schema Validation in CI

```yaml
# Validate schema changes don't break types
- name: Validate schema
  run: |
    npx drizzle-kit generate
    npx tsc --noEmit
```

---

## 6. Data Flow Diagrams

### 6.1 Master IPO Launch Flow

```
User Request → API Gateway → IPO Service
                                │
                                ▼
                          ┌─────────────────┐
                          │  Transaction:   │
                          │  1. Update IPO  │
                          │     status      │
                          │  2. Insert      │
                          │     audit log   │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │ Job Queue:      │
                          │ deploy_contract │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │ Contract        │
                          │ Deployment      │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │ Transaction:    │
                          │ 1. Insert       │
                          │    master_      │
                          │    contracts    │
                          │ 2. Update IPO   │
                          │    status       │
                          └─────────────────┘
```

### 6.2 Blockchain Event Indexing Flow

```
Blockchain → RPC Node → Indexer Service
                              │
                              ▼
                        ┌───────────────┐
                        │ Parse Event   │
                        └───────┬───────┘
                                │
           ┌────────────────────┴────────────────────┐
           │                    │                    │
     ┌─────▼─────┐       ┌──────▼──────┐     ┌──────▼──────┐
     │ Mint      │       │ Transfer   │     │ Dividend   │
     │ Event     │       │ Event      │     │ Event      │
     └─────┬─────┘       └──────┬─────┘     └──────┬─────┘
           │                    │                   │
     ┌─────▼─────┐       ┌──────▼──────┐     ┌──────▼──────┐
     │ INSERT    │       │ UPDATE      │     │ INSERT      │
     │ master_   │       │ master_nfts │     │ dividend_   │
     │ nfts      │       │ INSERT      │     │ events      │
     │ UPDATE    │       │ nft_        │     │ UPDATE      │
     │ master_   │       │ transfers   │     │ balances    │
     │ ipos      │       └─────────────┘     └─────────────┘
     └───────────┘
```

---

## 7. API Versioning Impact

When schema changes affect APIs:

1. **Additive changes**: Safe, just add to response
2. **Deprecations**: Keep old fields for 2 API versions
3. **Breaking changes**: New API version required

```typescript
// Version-aware response shaping
function shapeResponse(data: Master, apiVersion: string) {
  if (apiVersion < 'v2') {
    // Legacy format
    return { track: data, nftData: data.ipo };
  }
  // New format
  return { master: data, ipo: data.ipo };
}
```
