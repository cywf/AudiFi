# AudiFi Deployment Configuration

This directory contains deployment configuration files for the AudiFi platform.

## Contents

| File | Purpose |
|------|---------|
| `docker-compose.yml.example` | Local development and production-ready Docker Compose setup |
| `Caddyfile.example` | Caddy reverse proxy configuration (recommended) |
| `nginx.conf.example` | Nginx reverse proxy configuration (alternative) |
| `.env.example` | Environment variable template |

## Quick Start (Local Development)

### 1. Copy Configuration Files

```bash
cp docker-compose.yml.example docker-compose.yml
cp Caddyfile.example Caddyfile
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your configuration:

```bash
nano .env
```

At minimum, set:
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - Secret for JWT signing
- `STRIPE_SECRET_KEY` - Stripe API key
- Blockchain RPC URLs

### 3. Start Services

```bash
docker compose up -d
```

### 4. Verify Services

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# Test API health
curl http://localhost:3000/health
```

## Production Deployment

### Prerequisites

- Ubuntu 24.04 LTS server (16GB RAM, 4 vCPU, 200GB disk)
- Docker and Docker Compose installed
- Domain DNS configured pointing to server
- Ports 80 and 443 open in firewall

### Steps

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
   curl -I https://api.audifi.io/health
   
   # Test WebSocket (requires wscat)
   wscat -c wss://api.audifi.io/ws/
   ```

## Frontend Deployment (Vercel)

The frontend is deployed to Vercel. Configuration is in `../vercel.json`.

### Manual Deployment

```bash
cd ..
npx vercel --prod
```

### Automatic Deployment

Push to the `main` branch triggers automatic deployment via Vercel GitHub integration.

## Architecture

```
Internet
    │
    ├─▶ Vercel (audifi.io, app.audifi.io)
    │       └── Frontend (React + Vite)
    │
    └─▶ Ubuntu Server (api.audifi.io, studio.audifi.io)
            │
            ├── Caddy/Nginx (Reverse Proxy, TLS)
            │       │
            │       ├── API Server (:3000)
            │       ├── WebSocket Server (:3001)
            │       └── Worker (:3002)
            │
            ├── PostgreSQL (:5432)
            └── Redis (:6379)
```

## Scaling

### Horizontal Scaling

Add more API/WebSocket server replicas:

```yaml
# In docker-compose.yml
api-server:
  deploy:
    replicas: 3
```

### Database Scaling

For production, consider:
- Managed PostgreSQL (Supabase, Neon, RDS)
- Managed Redis (Upstash, ElastiCache)

## Monitoring

### Health Checks

- API: `https://api.audifi.io/health`
- WebSocket: `wss://api.audifi.io/ws/`

### Logs

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f api-server
```

### Metrics

Prometheus and Grafana are included in the Docker Compose setup.

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` (admin / password from .env)

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs <service-name>

# Check container status
docker compose ps

# Restart service
docker compose restart <service-name>
```

### SSL Certificate Issues

```bash
# For Caddy, check logs
docker compose logs caddy

# For Nginx with Certbot
sudo certbot certificates
sudo certbot renew --dry-run
```

### Database Connection Issues

```bash
# Check if Postgres is running
docker compose ps postgres

# Connect to database
docker compose exec postgres psql -U audifi -d audifi
```

## Security Notes

- Never commit `.env` file to version control
- Rotate secrets regularly
- Keep Docker images updated
- Review firewall rules periodically

## Related Documentation

- [Network Topology](../docs/networking/audifi-network-topology.md)
- [Security Alignment](../docs/networking/audifi-security-alignment.md)
- [Observability](../docs/networking/audifi-observability.md)
