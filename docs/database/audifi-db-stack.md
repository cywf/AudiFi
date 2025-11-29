# AudiFi Database Stack

**Document Version**: 1.0  
**Last Updated**: 2024-12

---

## Overview

This document describes the database technology stack chosen for AudiFi, including the rationale, configuration, and operational considerations.

---

## 1. Technology Selection

### 1.1 Primary OLTP Database: PostgreSQL

**Selected Version**: PostgreSQL 15+

**Rationale**:
- **Production-ready**: Battle-tested at scale with excellent reliability
- **Feature-rich**: Supports JSON/JSONB, array types, full-text search
- **Blockchain compatibility**: Handles large numbers (NUMERIC/DECIMAL) for token amounts
- **Analytics-friendly**: Window functions, CTEs, materialized views
- **Ecosystem**: Excellent tooling, hosting options (Supabase, Neon, RDS)

**Alternatives Considered**:
| Database | Reason for Rejection |
|----------|---------------------|
| SQLite | Not suitable for production multi-user scenarios |
| MySQL | Less powerful analytical capabilities |
| MongoDB | Relational model better suits Master IPO relationships |

### 1.2 ORM / Query Layer: Drizzle ORM

**Selected Version**: Drizzle ORM 0.30+

**Rationale**:
- **TypeScript-first**: Schema-as-code with full type inference
- **Lightweight**: Minimal runtime overhead
- **SQL-like syntax**: Intuitive for developers familiar with SQL
- **Migration support**: Built-in migration generation via Drizzle Kit
- **Performance**: No heavy abstractions, close-to-metal queries

**Alternatives Considered**:
| ORM | Reason for Rejection |
|-----|---------------------|
| Prisma | Heavier runtime, less control over query generation |
| TypeORM | Decorator-based, more verbose |
| Kysely | Query builder only, no schema definitions |
| Raw SQL | Less type safety, harder to maintain |

### 1.3 Optional: Redis Cache Layer

**Use Cases**:
- Session management
- Rate limiting
- Real-time analytics caching
- Blockchain event queue processing

**Status**: Planned for future implementation

### 1.4 Optional: Analytics / OLAP

**Approach**: PostgreSQL + Materialized Views for MVP

**Future Considerations**:
- ClickHouse for high-volume event analytics
- TimescaleDB extension for time-series data
- Data warehouse export (BigQuery, Snowflake) for BI

---

## 2. Configuration

### 2.1 Environment Variables

All database configuration uses environment variables. **Never commit credentials.**

```bash
# Primary database connection
AUDIFI_DATABASE_URL=postgresql://user:password@host:5432/audifi

# Connection pool settings
AUDIFI_DB_POOL_MIN=2
AUDIFI_DB_POOL_MAX=10

# Optional: Read replica for analytics
AUDIFI_DATABASE_REPLICA_URL=

# Optional: Redis for caching
AUDIFI_REDIS_URL=redis://localhost:6379
```

### 2.2 Drizzle Configuration

See `drizzle.config.ts` in the repository root for the Drizzle Kit configuration.

### 2.3 Local Development

For local development, use Docker Compose:

```bash
docker-compose up -d db
```

Or connect to a local PostgreSQL instance with the default configuration.

---

## 3. Trade-off Analysis

### 3.1 High Read Volume (Dashboards)

**Challenge**: Dashboards require aggregated views of:
- Artist performance metrics
- Master IPO statistics
- V Studio engagement

**Solution**:
- Create materialized views for pre-aggregated data
- Implement refresh strategies (on-demand, scheduled)
- Add appropriate indexes on filter/sort columns
- Consider read replicas for heavy analytics workloads

### 3.2 Event-Style Ingestion (Blockchain + V Studio)

**Challenge**: 
- High-frequency blockchain events (mints, transfers, dividends)
- V Studio voting events during active sessions

**Solution**:
- Batch inserts for blockchain indexing
- Append-only design for event tables
- Separate tables for raw events vs processed state
- Idempotent event processing (using tx_hash + log_index as unique key)

### 3.3 Historical vs Operational Data

**Challenge**: Balance between:
- Hot operational data (active IPOs, current balances)
- Historical archives (all transfers, old sessions)

**Solution**:
- Partitioning for large tables (by date or master_id)
- Archive strategies for cold data
- Separate indexes for recent vs historical queries
- Retention policies documented in data governance

---

## 4. Schema Organization

```
db/
├── schema/
│   ├── index.ts              # Main export (all tables)
│   ├── identity.ts           # Users, accounts, roles
│   ├── artists.ts            # Artist and producer profiles
│   ├── masters.ts            # Masters, IPOs, contracts
│   ├── nfts.ts               # Master NFTs, transfers, ownership
│   ├── revenue.ts            # Revenue events, dividends
│   ├── artistCoin.ts         # Artist tokens, liquidity
│   ├── vstudio.ts            # V Studio sessions, votes
│   ├── subscriptions.ts      # Billing and payments
│   └── observability.ts      # Audit logs, security events
├── migrations/               # Generated migration files
├── seed.ts                   # Development seed data
└── client.ts                 # Database client configuration
```

---

## 5. Connection Management

### 5.1 Connection Pooling

Drizzle uses the `postgres` package with built-in connection pooling:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.AUDIFI_DATABASE_URL!;
const sql = postgres(connectionString, { max: 10 });
export const db = drizzle(sql);
```

### 5.2 Connection Best Practices

- Use connection pooling in production
- Set reasonable pool limits (10-20 connections typical)
- Implement connection timeouts
- Monitor connection usage

---

## 6. Security Considerations

- **Encryption at rest**: Enable on managed PostgreSQL services
- **Encryption in transit**: Always use SSL/TLS connections
- **Access control**: Use database roles with minimal privileges
- **Secrets management**: Use environment variables or secret managers
- **Audit logging**: Enable PostgreSQL audit logging for sensitive tables

See `docs/database/audifi-data-governance.md` for detailed policies.

---

## 7. Monitoring & Observability

### Recommended Metrics

- Connection pool utilization
- Query latency (p50, p95, p99)
- Slow query logging
- Table/index sizes
- Replication lag (if using replicas)

### Tools

- PostgreSQL `pg_stat_statements` extension
- Drizzle query logging
- Application-level instrumentation

---

## 8. Backup & Recovery

### Production Requirements

- **Automated backups**: Daily full + WAL archiving
- **Point-in-time recovery**: Retain 7-30 days
- **Cross-region replication**: For disaster recovery
- **Recovery testing**: Monthly restore drills

### Development

- Use ephemeral databases (Docker)
- Seed scripts for reproducible state
