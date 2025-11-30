# AudiFi Backend Pipeline

## Overview

The backend pipeline handles continuous integration and deployment for the AudiFi backend services to **Fly.io**. These services power:

- **Master IPO / Master Contract / Dividend Contract APIs** - NFT and revenue distribution
- **V Studio Session & Real-time Services** - Live collaboration features
- **Artist Coin & Liquidity Integrations** - Token economics
- **Auth, Subscriptions, and Analytics** - Platform infrastructure

## Pipeline Location

```
.github/workflows/backend.yml
```

## Deployment Target

The backend is deployed to **Fly.io** (not SSH + Docker Compose on VMs):

| Environment | Fly.io App | URL |
|-------------|-----------|-----|
| Staging | `audifi-api-staging` | https://audifi-api-staging.fly.dev |
| Production | `audifi-api` | https://audifi-api.fly.dev |

## Trigger Conditions

The backend pipeline runs when changes are detected in:

| Path Pattern | Description |
|--------------|-------------|
| `server/**` | Backend source code |
| `.github/workflows/backend.yml` | Pipeline configuration |

## Pipeline Jobs

### 1. Build & Test

**Runs on:** All triggers (PRs and pushes)

**Steps:**
1. Checkout repository
2. Setup Node.js v20
3. Install dependencies (`npm ci`)
4. Run linting (`npm run lint`)
5. Run type check (`npm run type-check`)
6. Run tests (`npm test`)
7. Build (`npm run build`)

### 2. Deploy Staging (Fly.io)

**Runs on:** Push to `develop` branch

**Environment:** `staging`

**Target:** Fly.io app `audifi-api-staging`

**Steps:**
1. Setup Flyctl CLI
2. Deploy to Fly.io staging app
3. Migrations run automatically via `release_command`

### 3. Deploy Production (Fly.io)

**Runs on:** Push to `main` branch

**Environment:** `production`

**Target:** Fly.io app `audifi-api`

**Steps:**
1. Setup Flyctl CLI
2. Deploy to Fly.io production app
3. Migrations run automatically via `release_command`

## Fly.io Configuration

### fly.toml

The Fly.io configuration is in `server/fly.toml`:

```toml
app = "audifi-api"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 1

  [[http_service.checks]]
    path = "/api/v1/health"
    interval = "30s"
    timeout = "10s"

[deploy]
  release_command = "npm run db:migrate"
```

### Database Migrations

Migrations run automatically before each deployment via the `release_command` in `fly.toml`. This ensures:

- Migrations complete before the new app version starts
- Safe, idempotent migration execution
- Automatic rollback if migrations fail

## Required Secrets

Configure these secrets in GitHub repository settings:

### Fly.io Deployment

| Secret Name | Description | How to Get |
|-------------|-------------|-----------|
| `FLY_API_TOKEN` | Fly.io deploy token | `flyctl tokens create deploy` |
| `FLY_APP_STAGING` | Staging app name (optional) | Defaults to `audifi-api-staging` |
| `FLY_APP_PRODUCTION` | Production app name (optional) | Defaults to `audifi-api` |

### Fly.io App Secrets

Set these directly in Fly.io (not in GitHub):

```bash
flyctl secrets set JWT_SECRET="your-jwt-secret-min-32-chars" --app audifi-api
flyctl secrets set MAGIC_LINK_SECRET="your-magic-link-secret" --app audifi-api
flyctl secrets set SENDGRID_API_KEY="your-sendgrid-key" --app audifi-api
# DATABASE_URL is set automatically when attaching Fly Postgres
```

## Initial Setup

### 1. Create Fly.io Apps

```bash
# Production
cd server
flyctl apps create audifi-api

# Staging
flyctl apps create audifi-api-staging
```

### 2. Create Fly Postgres

```bash
# Create database cluster
flyctl postgres create --name audifi-db

# Attach to production app
flyctl postgres attach audifi-db --app audifi-api

# Attach to staging app
flyctl postgres attach audifi-db --app audifi-api-staging
```

### 3. Set Secrets

```bash
# Production
flyctl secrets set JWT_SECRET="..." --app audifi-api
flyctl secrets set MAGIC_LINK_SECRET="..." --app audifi-api

# Staging
flyctl secrets set JWT_SECRET="..." --app audifi-api-staging
flyctl secrets set MAGIC_LINK_SECRET="..." --app audifi-api-staging
```

### 4. Create GitHub Secret

```bash
# Generate deploy token
flyctl tokens create deploy

# Add to GitHub as FLY_API_TOKEN
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Fly.io                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Fly Proxy (anycast)                 │    │
│  │           https://audifi-api.fly.dev             │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │           AudiFi Backend (Node.js)              │    │
│  │              Internal Port: 8080                 │    │
│  │                                                  │    │
│  │  - Express.js API                               │    │
│  │  - JWT Auth                                     │    │
│  │  - Drizzle ORM                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Fly Postgres                        │    │
│  │          PostgreSQL 16 (managed)                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Health Checks

### API Health Endpoint

Expected endpoint: `GET /api/v1/health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T00:00:00Z",
  "version": "0.1.0",
  "dependencies": {
    "database": "connected"
  }
}
```

Fly.io performs health checks every 30 seconds to this endpoint.

## Monitoring

### View Logs

```bash
# Live logs
flyctl logs --app audifi-api

# Recent logs
flyctl logs --app audifi-api -n 100
```

### Check Status

```bash
flyctl status --app audifi-api
```

### SSH Access

```bash
flyctl ssh console --app audifi-api
```

## Rollback Procedure

### Using Fly.io Releases

```bash
# List recent releases
flyctl releases --app audifi-api

# Rollback to previous release
flyctl deploy --image registry.fly.io/audifi-api:v123 --app audifi-api
```

### Manual Redeploy

```bash
# Checkout previous commit
git checkout <previous-sha>

# Deploy
cd server
flyctl deploy --app audifi-api
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Deploy failed | Build error | Check `flyctl logs` |
| Health check failed | App crash | Check container logs |
| Migration failed | DB error | SSH and run manually |
| 502 Bad Gateway | App not ready | Wait for health check |

### Debug Commands

```bash
# Check app status
flyctl status --app audifi-api

# View recent logs
flyctl logs --app audifi-api

# SSH into container
flyctl ssh console --app audifi-api

# Check secrets
flyctl secrets list --app audifi-api

# Check database connection
flyctl postgres connect --app audifi-db
```

---

*This document is part of the AudiFi CI/CD documentation.*
