# AudiFi Database Migrations

## Overview

This document describes the database migration strategy for the AudiFi platform, including how migrations are executed in CI/CD for staging and production environments.

## Database Scope

The AudiFi database manages data for:

- **Master IPO Tables** - NFT masters, IPO offerings, ownership records
- **V Studio Tables** - Sessions, decisions, real-time collaboration data
- **Artist Coin Tables** - Token balances, transactions, liquidity pools
- **User & Auth Tables** - Accounts, subscriptions, 2FA settings
- **Analytics Tables** - Performance metrics, engagement data

## Migration Tooling

### Recommended Tools

| Tool | Use Case | Language |
|------|----------|----------|
| **Prisma Migrate** | TypeScript/Node.js backends | TypeScript |
| **Drizzle** | TypeScript ORM alternative | TypeScript |
| **Flyway** | Database-agnostic migrations | SQL/Java |
| **golang-migrate** | Go backends | Go |

### Current Status

⚠️ **Note:** Migration tooling is not yet configured. This document provides the framework for when backend services are added.

## Migration Strategy

### Design Principles

1. **Forward-only migrations** - No down migrations in production
2. **Backward-compatible changes** - New code works with old schema
3. **Atomic transactions** - Each migration is transactional
4. **Idempotent operations** - Safe to run multiple times
5. **Separate from deployment** - Migrations run before code deployment

### Schema Change Guidelines

| Change Type | Backward Compatible | Strategy |
|------------|---------------------|----------|
| Add column (nullable) | ✅ Yes | Deploy directly |
| Add column (required) | ❌ No | Add as nullable → backfill → add constraint |
| Remove column | ❌ No | Stop using → deploy → remove in next release |
| Rename column | ❌ No | Add new → migrate data → remove old |
| Add table | ✅ Yes | Deploy directly |
| Remove table | ❌ No | Stop using → deploy → remove in next release |
| Add index | ✅ Yes | Deploy directly (use CONCURRENTLY) |

## CI/CD Integration

### Migration Workflow

```yaml
# .github/workflows/db-migrations.yml

name: Database Migrations

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'backend/prisma/**'
      - 'backend/migrations/**'
      - 'db/migrations/**'

jobs:
  migrate-staging:
    name: Migrate Staging DB
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: cd backend && npm ci
        
      - name: Run migrations
        run: cd backend && npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}

  migrate-production:
    name: Migrate Production DB
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: cd backend && npm ci
        
      - name: Run migrations
        run: cd backend && npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
```

### Integration with Backend Pipeline

Migrations run as part of the backend deployment:

```yaml
# In .github/workflows/backend.yml

deploy-staging:
  steps:
    # ... SSH to server ...
    - name: Deploy to Staging Server
      uses: appleboy/ssh-action@v1.0.3
      with:
        script: |
          cd /opt/audifi/staging
          
          # Run migrations BEFORE updating containers
          docker compose run --rm api npm run db:migrate
          
          # Then deploy new code
          docker compose pull
          docker compose up -d
```

## Migration Commands

### Local Development

```bash
# Generate a new migration
npx prisma migrate dev --name add_users_table

# Apply migrations to local database
npx prisma migrate dev

# Reset database (DESTRUCTIVE)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Staging/Production

```bash
# Deploy migrations (non-interactive)
npx prisma migrate deploy

# View pending migrations
npx prisma migrate status
```

## Rollback Strategy

### Types of Rollback

#### 1. Application Rollback (Preferred)

If new code has issues, rollback the application while keeping schema:

```bash
# Rollback to previous container image
docker compose pull ghcr.io/cywf/audifi:<previous-sha>
docker compose up -d
```

#### 2. Schema Rollback (Emergency Only)

For critical schema issues:

```sql
-- Option A: Manual revert
-- Create a new migration that undoes changes

-- Option B: Database restore
-- Restore from backup (loses data since backup)
```

### Backup Before Migration

```bash
# Automated backup in CI/CD
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Store backup
aws s3 cp backup-*.sql s3://audifi-backups/migrations/
```

## Database Environments

### Connection Strings

| Environment | Variable | Example |
|-------------|----------|---------|
| Local | `DATABASE_URL` | `postgresql://localhost:5432/audifi_dev` |
| Staging | `STAGING_DATABASE_URL` | `postgresql://staging-db.audifi.io:5432/audifi_staging` |
| Production | `PRODUCTION_DATABASE_URL` | `postgresql://prod-db.audifi.io:5432/audifi_prod` |

### Environment Isolation

```
┌─────────────────────────────────────────────────────────┐
│                    Local Development                     │
│        PostgreSQL (Docker / Local Install)              │
│        Database: audifi_dev                              │
└─────────────────────────────────────────────────────────┘
                          ↓ (PR Branch)
┌─────────────────────────────────────────────────────────┐
│                    Staging Environment                   │
│        PostgreSQL (Managed / RDS)                       │
│        Database: audifi_staging                         │
│        Migrations: Auto-run on develop push             │
└─────────────────────────────────────────────────────────┘
                          ↓ (Main Branch)
┌─────────────────────────────────────────────────────────┐
│                  Production Environment                  │
│        PostgreSQL (Managed / RDS with Read Replicas)    │
│        Database: audifi_prod                            │
│        Migrations: Auto-run on main push                │
│        Backups: Automated daily + pre-migration         │
└─────────────────────────────────────────────────────────┘
```

## Schema Design Considerations

### Master IPO Tables

```sql
-- Example schema structure
CREATE TABLE masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist_id UUID NOT NULL REFERENCES users(id),
  ipfs_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES masters(id),
  total_shares INTEGER NOT NULL,
  share_price DECIMAL(18, 8) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipo_id UUID NOT NULL REFERENCES ipos(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  shares INTEGER NOT NULL,
  purchase_price DECIMAL(18, 8) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);
```

### V Studio Tables

```sql
CREATE TABLE v_studio_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE session_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES v_studio_sessions(id),
  decision_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  decided_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Failure Handling

### Migration Failure in CI

```yaml
# Migration step with failure handling
- name: Run migrations
  id: migrate
  run: |
    cd backend
    npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  continue-on-error: false

# If migration fails, deployment is blocked
- name: Handle migration failure
  if: failure()
  run: |
    echo "❌ Migration failed! Deployment blocked."
    echo "Check migration logs and fix before retrying."
    exit 1
```

### Automatic Rollback

If deployment fails after migration:

1. New code fails health check
2. Previous container version remains active
3. Schema changes persist (backward compatible)
4. Manual intervention for schema rollback if needed

## Best Practices

### DO

- ✅ Test migrations locally first
- ✅ Use transactions for all changes
- ✅ Add columns as nullable initially
- ✅ Use `CREATE INDEX CONCURRENTLY`
- ✅ Backup before production migrations
- ✅ Run migrations in staging first

### DON'T

- ❌ Remove columns immediately
- ❌ Rename columns directly
- ❌ Run untested migrations in production
- ❌ Use `DROP CASCADE` in production
- ❌ Skip staging environment

## Monitoring

### Migration Metrics

Track these metrics:

| Metric | Description |
|--------|-------------|
| Migration duration | Time to complete migration |
| Locked tables | Tables with exclusive locks |
| Rows affected | Number of rows modified |
| Index size | Size of new indexes |

### Alerts

Set up alerts for:

- Migration failures
- Long-running migrations (> 5 minutes)
- Database connection issues during migration

---

*This document is part of the AudiFi CI/CD documentation.*
