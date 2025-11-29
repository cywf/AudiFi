# AudiFi Database Documentation

Welcome to the AudiFi database documentation. This directory contains all documentation related to the data layer for the AudiFi platform.

---

## Quick Start

### Prerequisites

- PostgreSQL 15+ (or use Docker)
- Node.js 18+
- npm or yarn

### Local Development Setup

1. **Start PostgreSQL with Docker:**

```bash
docker run --name audifi-postgres \
  -e POSTGRES_USER=audifi \
  -e POSTGRES_PASSWORD=audifi_dev_password \
  -e POSTGRES_DB=audifi_dev \
  -p 5432:5432 \
  -d postgres:15
```

2. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your database URL
```

3. **Install dependencies:**

```bash
npm install
```

4. **Run migrations:**

```bash
npx drizzle-kit migrate
```

5. **Seed development data:**

```bash
npx tsx db/seed.ts
```

### Inspecting the Schema

**Using Drizzle Studio (recommended):**

```bash
npx drizzle-kit studio
```

This opens a web UI at `http://localhost:4983` to browse tables and data.

**Using psql:**

```bash
psql postgresql://audifi:audifi_dev_password@localhost:5432/audifi_dev

# List tables
\dt

# Describe a table
\d users

# Run a query
SELECT * FROM users LIMIT 5;
```

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [audifi-db-audit.md](./audifi-db-audit.md) | Initial audit findings and gap analysis |
| [audifi-db-stack.md](./audifi-db-stack.md) | Technology selection and rationale |
| [audifi-db-summary.md](./audifi-db-summary.md) | Schema summary and entity overview |
| [audifi-analytics-schema.md](./audifi-analytics-schema.md) | Analytics structures and query patterns |
| [blockchain-indexing-strategy.md](./blockchain-indexing-strategy.md) | On-chain data mirroring approach |
| [audifi-data-governance.md](./audifi-data-governance.md) | Retention, privacy, and security policies |
| [audifi-db-interfaces.md](./audifi-db-interfaces.md) | Integration with other agents/services |

---

## Schema Modules

The database schema is organized into logical modules:

```
db/
├── schema/
│   ├── index.ts              # Main export
│   ├── identity.ts           # Users, accounts, roles
│   ├── artists.ts            # Artist/producer profiles
│   ├── masters.ts            # Masters, IPOs, contracts
│   ├── nfts.ts               # NFTs, transfers, ownership
│   ├── revenue.ts            # Revenue, dividends
│   ├── artistCoin.ts         # Tokens, liquidity
│   ├── vstudio.ts            # V Studio sessions
│   ├── subscriptions.ts      # Billing, payments
│   └── observability.ts      # Audit, security logs
├── migrations/               # Generated migrations
├── client.ts                 # Database connection
└── seed.ts                   # Development data
```

### Entity Relationship Overview

```
                    ┌─────────────┐
                    │    users    │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │   artists   │ │  producers  │ │subscriptions│
    └──────┬──────┘ └──────┬──────┘ └─────────────┘
           │               │
           └───────┬───────┘
                   │
            ┌──────▼──────┐
            │   masters   │──────────────┐
            └──────┬──────┘              │
                   │                     │
    ┌──────────────┼──────────────┐      │
    │              │              │      │
┌───▼───┐   ┌──────▼──────┐  ┌────▼────┐ │
│master │   │   master    │  │vstudio  │ │
│ ipos  │   │  contracts  │  │sessions │ │
└───┬───┘   └──────┬──────┘  └────┬────┘ │
    │              │              │      │
    │       ┌──────▼──────┐  ┌────▼────┐ │
    │       │ master_nfts │  │vstudio  │ │
    │       └──────┬──────┘  │ votes   │ │
    │              │         └─────────┘ │
    │       ┌──────▼──────┐              │
    │       │nft_transfers│              │
    │       └─────────────┘              │
    │                                    │
    └────────────┬───────────────────────┘
                 │
          ┌──────▼──────┐
          │  revenue    │
          │  events     │
          └──────┬──────┘
                 │
          ┌──────▼──────┐
          │  dividend   │
          │  events     │
          └─────────────┘
```

---

## Common Operations

### Generate a New Migration

After modifying schema files:

```bash
npx drizzle-kit generate
```

### Apply Migrations

```bash
# Development
npx drizzle-kit migrate

# With specific database
AUDIFI_DATABASE_URL=postgresql://... npx drizzle-kit migrate
```

### Reset Database (Development Only)

```bash
# Drop and recreate
npx drizzle-kit drop
npx drizzle-kit migrate
npx tsx db/seed.ts
```

### Push Schema (Quick Development)

For rapid development without migrations:

```bash
npx drizzle-kit push
```

⚠️ **Warning**: Don't use `push` in production. Always use migrations.

---

## Type Safety

All tables are fully typed with TypeScript. Import types from the schema:

```typescript
import { users, masters, type User, type Master } from '@/db/schema';
import { db } from '@/db/client';
import { eq } from 'drizzle-orm';

// Query with full type safety
const user: User = await db.query.users.findFirst({
  where: eq(users.email, 'alex@example.com'),
});

// Insert with type checking
await db.insert(masters).values({
  artistId: artist.id,
  title: 'New Track',  // Required field
  masterType: 'track', // Enum enforced
  status: 'draft',
  // ...
});
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUDIFI_DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUDIFI_DB_POOL_MIN` | No | Min connection pool size (default: 2) |
| `AUDIFI_DB_POOL_MAX` | No | Max connection pool size (default: 10) |
| `AUDIFI_DATABASE_REPLICA_URL` | No | Read replica for analytics |

---

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql $AUDIFI_DATABASE_URL -c "SELECT 1"

# Check if PostgreSQL is running
docker ps | grep postgres
```

### Migration Failures

```bash
# Check current migration status
npx drizzle-kit status

# Force regenerate migrations
rm -rf db/migrations/*
npx drizzle-kit generate
```

### Type Errors

If types don't match after schema changes:

```bash
# Regenerate types
npx drizzle-kit generate
npx tsc --noEmit
```

---

## Contributing

When modifying the database schema:

1. Create/modify schema files in `db/schema/`
2. Run `npx drizzle-kit generate` to create migrations
3. Test migrations locally
4. Update relevant documentation
5. Submit PR with schema changes + migrations + docs

---

## Related Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AudiFi GLOBAL CONTEXT](../GLOBAL_CONTEXT.md) (if available)
