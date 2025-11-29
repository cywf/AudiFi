# AudiFi Backend Pipeline

## Overview

The backend pipeline handles continuous integration and deployment for the AudiFi backend services to the Ubuntu 24.04 server. These services power:

- **Master IPO / Master Contract / Dividend Contract APIs** - NFT and revenue distribution
- **V Studio Session & Real-time Services** - Live collaboration features
- **Artist Coin & Liquidity Integrations** - Token economics
- **Auth, Subscriptions, and Analytics** - Platform infrastructure

## Pipeline Location

```
.github/workflows/backend.yml
```

## Current Status

⚠️ **Note:** This workflow is a template. The backend codebase is not yet present in the repository. When backend services are added to the `backend/`, `api/`, or `server/` directories, this workflow will be activated automatically.

## Trigger Conditions

The backend pipeline runs when changes are detected in:

| Path Pattern | Description |
|--------------|-------------|
| `backend/**` | Backend source code |
| `api/**` | API service code |
| `server/**` | Server code |
| `services/**` | Microservices |
| `Dockerfile*` | Container definitions |
| `docker-compose*.yml` | Container orchestration |

## Pipeline Jobs

### 1. Build & Test

**Runs on:** All triggers (PRs and pushes)

**Steps:**
1. Checkout repository
2. Setup Node.js v20
3. Install dependencies
4. Run linting
5. Run tests

**Notes:**
- Automatically detects backend directory location
- Gracefully handles missing lint/test scripts

### 2. Docker Build

**Runs on:** After successful build & test

**Steps:**
1. Check for Dockerfile existence
2. Set up Docker Buildx
3. Log in to GitHub Container Registry (GHCR)
4. Extract metadata and generate tags
5. Build and push Docker image

**Image Tags:**
- `sha-<commit>` - Commit-specific tag
- `develop` / `main` - Branch tags
- `latest` - For main branch
- `pr-<number>` - For pull requests

### 3. Deploy Staging

**Runs on:** Push to `develop` branch

**Environment:** `staging`

**Target:** Ubuntu 24.04 server at `api-staging.audifi.io`

**Steps:**
1. SSH to staging server
2. Pull latest Docker images
3. Run database migrations (if configured)
4. Restart services with docker-compose
5. Health check
6. Cleanup old images

### 4. Deploy Production

**Runs on:** Push to `main` branch

**Environment:** `production`

**Target:** Ubuntu 24.04 server at `api.audifi.io`

**Steps:**
1. SSH to production server
2. Pull latest Docker images
3. Run database migrations (if configured)
4. Rolling update with zero-downtime
5. Health check
6. Cleanup old images

## Server Requirements

### Ubuntu 24.04 Server Setup

The deployment server must have:

```bash
# Required software
- Docker Engine (24.0+)
- Docker Compose v2 (2.20+)
- curl (for health checks)

# Directory structure
/opt/audifi/
├── staging/
│   ├── docker-compose.yml
│   ├── .env
│   └── data/
└── production/
    ├── docker-compose.yml
    ├── .env
    └── data/
```

### Server Installation

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker deploy

# Create directories
sudo mkdir -p /opt/audifi/{staging,production}/data
sudo chown -R deploy:deploy /opt/audifi
```

## Required Secrets

Configure these secrets in GitHub repository settings:

### Container Registry

| Secret Name | Description |
|-------------|-------------|
| `GITHUB_TOKEN` | Automatically provided for GHCR |

### SSH Deployment

| Secret Name | Description |
|-------------|-------------|
| `DEPLOY_USER` | SSH username for server access |
| `DEPLOY_SSH_KEY` | SSH private key for authentication |
| `STAGING_HOST` | Staging server hostname/IP |
| `PRODUCTION_HOST` | Production server hostname/IP |

### Generating SSH Keys

```bash
# Generate deployment key
ssh-keygen -t ed25519 -C "audifi-deploy" -f audifi-deploy

# Add public key to server
ssh-copy-id -i audifi-deploy.pub deploy@staging.audifi.io
ssh-copy-id -i audifi-deploy.pub deploy@production.audifi.io

# Add private key to GitHub Secrets as DEPLOY_SSH_KEY
cat audifi-deploy
```

## Deployment Architecture

### Container Layout

```
┌─────────────────────────────────────────────────────────┐
│                   Ubuntu 24.04 Server                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐     ┌─────────────────┐            │
│  │   API Service   │     │  Session Service │            │
│  │   (Node.js)     │     │  (WebSocket)     │            │
│  │   Port: 3000    │     │   Port: 3001     │            │
│  └────────┬────────┘     └────────┬─────────┘            │
│           │                       │                       │
│           └───────────┬───────────┘                       │
│                       │                                   │
│  ┌────────────────────┴────────────────────┐             │
│  │           Reverse Proxy (Nginx)          │             │
│  │          Ports: 80, 443 (SSL)            │             │
│  └──────────────────────────────────────────┘             │
│                                                          │
│  ┌─────────────────┐     ┌─────────────────┐            │
│  │   PostgreSQL    │     │     Redis       │            │
│  │   Port: 5432    │     │   Port: 6379    │            │
│  └─────────────────┘     └─────────────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Docker Compose Template

```yaml
# /opt/audifi/production/docker-compose.yml

version: '3.8'

services:
  api:
    image: ghcr.io/cywf/audifi:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - postgres
      - redis

  session:
    image: ghcr.io/cywf/audifi-session:latest
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis

  postgres:
    image: postgres:16
    restart: unless-stopped
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=audifi
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - ./data/redis:/data

networks:
  default:
    name: audifi
```

## Graceful Restart Strategy

### Handling V Studio Sessions

For zero-downtime deployments that preserve in-flight V Studio sessions:

```bash
# Rolling update strategy (in production deploy script)

# 1. Scale up new instances
docker compose up -d --scale api=2

# 2. Wait for new instances to be healthy
sleep 15

# 3. Scale back down (old instances terminate)
docker compose up -d --scale api=1
```

### Session Persistence

- WebSocket sessions should be backed by Redis
- Session state survives container restarts
- Clients auto-reconnect on connection loss

## Health Checks

### API Health Endpoint

Expected endpoint: `GET /health`

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-29T00:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "blockchain": "connected"
  }
}
```

### Deployment Health Check

```bash
# In deployment script
curl -f http://localhost:3000/health || exit 1
```

## Rollback Procedure

### Automatic Rollback

If health check fails, previous deployment remains active.

### Manual Rollback

```bash
# SSH to server
ssh deploy@api.audifi.io

# Navigate to deployment directory
cd /opt/audifi/production

# Rollback to previous image tag
docker compose down
docker compose pull ghcr.io/cywf/audifi:<previous-sha>
docker compose up -d
```

### Using Git SHA Tags

```bash
# Find previous working deployment
docker images ghcr.io/cywf/audifi --format "{{.Tag}}"

# Deploy specific version
docker compose pull ghcr.io/cywf/audifi:abc123
docker compose up -d
```

## Monitoring

### Container Logs

```bash
# View API logs
docker compose logs -f api

# View all service logs
docker compose logs -f
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| SSH connection failed | Key not authorized | Verify `DEPLOY_SSH_KEY` secret |
| Health check failed | App not starting | Check container logs |
| Image pull failed | Auth issues | Verify GHCR access |
| Port already in use | Previous container | Run `docker compose down` |

### Debug Commands

```bash
# Check running containers
docker ps

# Check container logs
docker logs <container-id>

# Check docker-compose config
docker compose config

# Test health endpoint
curl -v http://localhost:3000/health
```

---

*This document is part of the AudiFi CI/CD documentation.*
