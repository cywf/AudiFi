# AudiFi Deployment Configuration

This directory contains deployment configuration files for the AudiFi platform.

## Architecture Overview

```
Internet
    │
    ├─▶ Vercel (audifi.io, app.audifi.io)
    │       └── Frontend (React + Vite)
    │
    └─▶ Fly.io (audifi-api.fly.dev)
            │
            ├── Backend API Server
            │       └── Express.js on Node.js
            │
            └── Fly Postgres
                    └── PostgreSQL 16
```

### Primary Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | `audifi.io`, `app.audifi.io` |
| Backend API | Fly.io | `audifi-api.fly.dev` |
| Database | Fly Postgres | Internal connection |

### Staging Environment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel Preview | `*.vercel.app` |
| Backend API | Fly.io | `audifi-api-staging.fly.dev` |
| Database | Fly Postgres | Internal connection |

## Fly.io Deployment (Production)

The backend API is deployed to Fly.io. Configuration is in `server/fly.toml`.

### Prerequisites

1. Install Flyctl CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Authenticate with Fly.io:
   ```bash
   flyctl auth login
   ```

### Initial Setup

1. **Create Fly.io App** (first time only):
   ```bash
   cd server
   flyctl apps create audifi-api
   ```

2. **Create Fly Postgres Database**:
   ```bash
   flyctl postgres create --name audifi-db
   flyctl postgres attach audifi-db --app audifi-api
   ```
   This automatically sets the `DATABASE_URL` secret.

3. **Set Required Secrets**:
   ```bash
   flyctl secrets set JWT_SECRET="your-production-jwt-secret-min-32-chars" --app audifi-api
   flyctl secrets set MAGIC_LINK_SECRET="your-magic-link-secret" --app audifi-api
   flyctl secrets set SENDGRID_API_KEY="your-sendgrid-key" --app audifi-api
   # Add other required secrets
   ```

4. **Deploy**:
   ```bash
   flyctl deploy --app audifi-api
   ```

### CI/CD Deployment

Deployment is automated via GitHub Actions (`.github/workflows/backend.yml`):

- **Staging**: Push to `develop` branch → deploys to `audifi-api-staging`
- **Production**: Push to `main` branch → deploys to `audifi-api`

Required GitHub Secrets:
- `FLY_API_TOKEN` - Fly.io API token (create with `flyctl tokens create deploy`)
- `FLY_APP_STAGING` - Staging app name (optional, defaults to `audifi-api-staging`)
- `FLY_APP_PRODUCTION` - Production app name (optional, defaults to `audifi-api`)

### Database Migrations

Migrations run automatically during deployment via the `release_command` in `fly.toml`:
```toml
[deploy]
  release_command = "npm run db:migrate"
```

For manual migrations:
```bash
flyctl ssh console --app audifi-api
npm run db:migrate
```

### Monitoring

```bash
# View logs
flyctl logs --app audifi-api

# Check app status
flyctl status --app audifi-api

# SSH into container
flyctl ssh console --app audifi-api
```

### Health Check

```bash
curl https://audifi-api.fly.dev/api/v1/health
```

---

## Alternative: Self-Hosted Deployment (Docker Compose)

For self-hosted deployments on a VPS or bare-metal server, use the Docker Compose configuration below. This is **not the primary deployment method** but is available for specific use cases.

### Contents

| File | Purpose |
|------|---------|
| `docker-compose.yml.example` | Local development and self-hosted setup |
| `Caddyfile.example` | Caddy reverse proxy configuration |
| `nginx.conf.example` | Nginx reverse proxy configuration (alternative) |
| `.env.example` | Environment variable template |

### Quick Start (Local Development)

#### 1. Copy Configuration Files

```bash
cp docker-compose.yml.example docker-compose.yml
cp Caddyfile.example Caddyfile
cp .env.example .env
```

#### 2. Configure Environment Variables

Edit `.env` with your configuration:

```bash
nano .env
```

At minimum, set:
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - Secret for JWT signing
- `STRIPE_SECRET_KEY` - Stripe API key
- Blockchain RPC URLs

#### 3. Start Services

```bash
docker compose up -d
```

#### 4. Verify Services

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# Test API health
curl http://localhost:3001/api/v1/health
```

### Self-Hosted Production Deployment

#### Prerequisites

- Ubuntu 24.04 LTS server (16GB RAM, 4 vCPU, 200GB disk)
- Docker and Docker Compose installed
- Domain DNS configured pointing to server
- Ports 80 and 443 open in firewall

#### Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/cywf/AudiFi.git
   cd AudiFi/deploy
   ```

2. **Configure Production Environment**
   ```bash
   cp .env.example .env
   # Edit with production values
   nano .env
   ```

3. **Configure Reverse Proxy**
   
   For Caddy (recommended):
   ```bash
   cp Caddyfile.example Caddyfile
   # Update domain names in Caddyfile
   nano Caddyfile
   ```

   For Nginx (alternative):
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/audifi
   sudo ln -s /etc/nginx/sites-available/audifi /etc/nginx/sites-enabled/
   sudo certbot --nginx -d api.audifi.io -d studio.audifi.io
   ```

4. **Start Services**
   ```bash
   docker compose -f docker-compose.yml up -d
   ```

5. **Verify Deployment**
   ```bash
   # Check SSL certificate
   curl -I https://api.audifi.io/api/v1/health
   ```

---

## Frontend Deployment (Vercel)

The frontend is deployed to Vercel. Configuration is in `../vercel.json`.

### Automatic Deployment

Push to the `main` branch triggers automatic deployment via Vercel GitHub integration.

### Manual Deployment

```bash
cd ..
npx vercel --prod
```

---

## Troubleshooting

### Fly.io Issues

```bash
# Check deployment logs
flyctl logs --app audifi-api

# Check VM status
flyctl status --app audifi-api

# Restart app
flyctl apps restart audifi-api

# Check secrets
flyctl secrets list --app audifi-api
```

### Docker Compose Issues

```bash
# Check logs
docker compose logs <service-name>

# Check container status
docker compose ps

# Restart service
docker compose restart <service-name>
```

### Database Connection Issues

For Fly.io:
```bash
flyctl postgres connect --app audifi-db
```

For Docker Compose:
```bash
docker compose exec postgres psql -U audifi -d audifi
```

## Security Notes

- Never commit `.env` file or secrets to version control
- Use `fly secrets set` for Fly.io secrets
- Rotate secrets regularly
- Keep Docker images updated
- Review firewall rules periodically

## Related Documentation

- [Network Topology](../docs/networking/audifi-network-topology.md)
- [Security Alignment](../docs/networking/audifi-security-alignment.md)
- [CI/CD Strategy](../docs/cicd/audifi-cicd-strategy.md)
- [Backend Pipeline](../docs/cicd/audifi-backend-pipeline.md)
