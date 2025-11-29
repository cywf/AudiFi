# AudiFi Secrets and Configuration

## Overview

This document describes all secrets and environment-specific configuration required for the AudiFi CI/CD pipelines and runtime environments.

## Secret Categories

### 1. Deployment Secrets

Required for deploying applications to various environments.

| Secret Name | Used By | Description |
|-------------|---------|-------------|
| `VERCEL_TOKEN` | Frontend | Vercel API authentication token |
| `VERCEL_ORG_ID` | Frontend | Vercel organization identifier |
| `VERCEL_PROJECT_ID` | Frontend | Vercel project identifier |
| `FLY_API_TOKEN` | Frontend (alt) | Fly.io API token (alternative) |
| `DEPLOY_SSH_KEY` | Backend | SSH private key for server access |
| `DEPLOY_USER` | Backend | SSH username for deployment |
| `STAGING_HOST` | Backend | Staging server hostname/IP |
| `PRODUCTION_HOST` | Backend | Production server hostname/IP |

### 2. Registry Secrets

For Docker image storage and retrieval.

| Secret Name | Used By | Description |
|-------------|---------|-------------|
| `GITHUB_TOKEN` | Backend | Auto-provided for GHCR access |
| `REGISTRY_URL` | Backend | Custom registry URL (optional) |
| `REGISTRY_USERNAME` | Backend | Registry login username |
| `REGISTRY_TOKEN` | Backend | Registry authentication token |

### 3. Database Secrets

Database connection and migration credentials.

| Secret Name | Used By | Description |
|-------------|---------|-------------|
| `STAGING_DATABASE_URL` | DB Migrations | Staging PostgreSQL connection |
| `PRODUCTION_DATABASE_URL` | DB Migrations | Production PostgreSQL connection |
| `DB_ENCRYPTION_KEY` | Backend | Database field encryption key |

### 4. API & Service Secrets

Third-party service integrations.

| Secret Name | Used By | Description |
|-------------|---------|-------------|
| `STRIPE_SECRET_KEY` | Backend | Stripe payment processing |
| `STRIPE_WEBHOOK_SECRET` | Backend | Stripe webhook verification |
| `SENDGRID_API_KEY` | Backend | Email service |
| `TWILIO_AUTH_TOKEN` | Backend | SMS/2FA service |
| `BLOCKCHAIN_RPC_URL` | Backend | Ethereum/Polygon RPC endpoint |
| `BLOCKCHAIN_PRIVATE_KEY` | Backend | Contract deployment key |
| `IPFS_API_KEY` | Backend | IPFS pinning service |

### 5. OAuth & Auth Secrets

Authentication provider credentials.

| Secret Name | Used By | Description |
|-------------|---------|-------------|
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth |
| `GITHUB_CLIENT_ID` | Backend | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Backend | GitHub OAuth |
| `JWT_SECRET` | Backend | JWT signing key |

## Environment Configuration

### Frontend Environment Variables

These are **public** variables exposed to the frontend:

| Variable | Type | Description |
|----------|------|-------------|
| `VITE_API_URL` | URL | Backend API base URL |
| `VITE_APP_ENV` | String | Environment name (dev/staging/prod) |
| `VITE_ENABLE_ANALYTICS` | Boolean | Enable analytics tracking |
| `VITE_CHAIN_ID` | Number | Blockchain network ID |
| `VITE_CONTRACT_ADDRESS` | Address | Master contract address |
| `VITE_SENTRY_DSN` | URL | Sentry error tracking (public) |

### Backend Environment Variables

These are **private** variables for backend services:

| Variable | Type | Description |
|----------|------|-------------|
| `NODE_ENV` | String | Runtime environment |
| `PORT` | Number | Server listen port |
| `DATABASE_URL` | URL | Database connection string |
| `REDIS_URL` | URL | Redis connection string |
| `CORS_ORIGINS` | String | Allowed CORS origins |
| `LOG_LEVEL` | String | Logging verbosity |

## Configuration Files

### `.env.example`

Template for local development:

```env
# ================================
# AudiFi Environment Configuration
# ================================
# Copy this file to .env and fill in your values
# NEVER commit .env to source control

# ===== Application =====
NODE_ENV=development
PORT=3000

# ===== Frontend (VITE_* are public) =====
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_ENABLE_ANALYTICS=false
VITE_CHAIN_ID=1
VITE_CONTRACT_ADDRESS=0x...

# ===== Database =====
DATABASE_URL=postgresql://localhost:5432/audifi_dev
REDIS_URL=redis://localhost:6379

# ===== Authentication =====
JWT_SECRET=your-jwt-secret-key-here
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ===== Payments =====
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ===== Blockchain =====
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
BLOCKCHAIN_PRIVATE_KEY=

# ===== External Services =====
SENDGRID_API_KEY=
IPFS_API_KEY=
```

## GitHub Secrets Configuration

### Repository Secrets

Configure at: `Settings → Secrets and variables → Actions`

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
DEPLOY_SSH_KEY
DEPLOY_USER
```

### Environment Secrets

Configure at: `Settings → Environments → [env] → Environment secrets`

**Staging Environment:**
```
STAGING_HOST
STAGING_DATABASE_URL
STAGING_API_URL
```

**Production Environment:**
```
PRODUCTION_HOST
PRODUCTION_DATABASE_URL
PRODUCTION_API_URL
```

## Workflow Usage

### Accessing Secrets in Workflows

```yaml
jobs:
  deploy:
    steps:
      - name: Deploy
        run: deploy.sh
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

### Environment-Specific Secrets

```yaml
jobs:
  deploy-staging:
    environment: staging
    steps:
      - name: Deploy
        run: deploy.sh
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}

  deploy-production:
    environment: production
    steps:
      - name: Deploy
        run: deploy.sh
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
```

## Secret Rotation

### Rotation Schedule

| Secret Type | Rotation Frequency | Method |
|-------------|-------------------|--------|
| Deployment tokens | Annually | Regenerate in provider |
| SSH keys | Annually | Generate new keypair |
| Database credentials | Quarterly | Update connection string |
| API keys | When compromised | Regenerate immediately |
| JWT secret | Annually | Coordinate with session invalidation |

### Rotation Procedure

1. **Generate new secret** in source system
2. **Update GitHub Secrets** with new value
3. **Deploy to staging** to verify
4. **Deploy to production**
5. **Revoke old secret** in source system
6. **Document rotation** in security log

## Security Best Practices

### DO

- ✅ Use separate secrets per environment
- ✅ Use GitHub Environments for isolation
- ✅ Rotate secrets regularly
- ✅ Audit secret access in GitHub logs
- ✅ Use least-privilege access tokens

### DON'T

- ❌ Share secrets between environments
- ❌ Log secrets in workflow output
- ❌ Commit secrets to repository
- ❌ Use personal tokens for CI/CD
- ❌ Store secrets in code comments

## Verification

### Checking Secret Configuration

Before first deployment, verify all required secrets are set:

```bash
# List required secrets (template)
cat << 'EOF'
Required Repository Secrets:
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
- DEPLOY_SSH_KEY
- DEPLOY_USER

Required Staging Secrets:
- STAGING_HOST
- STAGING_DATABASE_URL

Required Production Secrets:
- PRODUCTION_HOST
- PRODUCTION_DATABASE_URL
EOF
```

### Testing Secret Access

```yaml
- name: Verify secrets
  run: |
    if [ -z "${{ secrets.VERCEL_TOKEN }}" ]; then
      echo "ERROR: VERCEL_TOKEN not set"
      exit 1
    fi
    echo "✅ VERCEL_TOKEN is configured"
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Secret not found" | Not configured | Add to GitHub Secrets |
| "Permission denied" | Wrong scope | Regenerate with correct scope |
| "Invalid token" | Expired/revoked | Regenerate token |
| "Environment not found" | Typo in name | Verify environment name |

### Debug Workflow

```yaml
- name: Debug (REMOVE BEFORE MERGE)
  run: |
    echo "Token length: ${#VERCEL_TOKEN}"
    echo "Has token: ${{ secrets.VERCEL_TOKEN != '' }}"
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

⚠️ **Never log the actual secret value!**

---

*This document is part of the AudiFi CI/CD documentation.*
