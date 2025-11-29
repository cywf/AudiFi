# AudiFi CI/CD Agent Interfaces

## Overview

This document describes how the CI/CD pipeline integrates with other AudiFi agents and systems, providing clear interface boundaries and expectations.

## Agent Integration Map

```
┌────────────────────────────────────────────────────────────────┐
│                        CI/CD Agent                              │
│                  (Orchestration Layer)                          │
└────────────────────────┬───────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Frontend   │  │  Backend    │  │  Database   │
│   Agent     │  │   Agent     │  │   Agent     │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       │                │                │
       ▼                ▼                ▼
┌────────────────────────────────────────────────────────────────┐
│                     Shared Services                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Networking │  │  Security  │  │Documentation│               │
│  │   Agent    │  │   Agent    │  │   Agent     │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└────────────────────────────────────────────────────────────────┘
```

---

## FRONTEND-AGENT Interface

### Build Triggers

| Event | Workflow | Action |
|-------|----------|--------|
| PR created/updated | `frontend.yml` | Build, lint, preview deploy |
| Push to `develop` | `frontend.yml` | Deploy to staging |
| Push to `main` | `frontend.yml` | Deploy to production |

### CI/CD Expectations

**From Frontend-Agent:**
- Source code in `src/` directory
- Valid `package.json` with build scripts
- TypeScript compilation without errors
- ESLint configuration (`eslint.config.js`)

**From CI/CD:**
- Automatic preview deployments for PRs
- Environment-specific builds
- Build artifact caching
- Deployment URL feedback in PRs

### Interface Contract

```yaml
# Frontend build interface
inputs:
  - package.json scripts:
      - build: "npm run build"
      - lint: "npm run lint"
      - test: "npm run test" (optional)
  - Node.js version: 20.x
  - Output directory: dist/

outputs:
  - Preview URL (PR)
  - Staging URL (develop)
  - Production URL (main)
```

### Handoff Points

1. **PR Creation** → CI/CD runs build validation
2. **PR Review** → Preview URL provided for testing
3. **Merge to develop** → Staging deployment triggered
4. **Merge to main** → Production deployment triggered

---

## BACKEND-AGENT Interface

### Build Triggers

| Event | Workflow | Action |
|-------|----------|--------|
| PR created/updated | `backend.yml` | Build, test, Docker build |
| Push to `develop` | `backend.yml` | Deploy to staging server |
| Push to `main` | `backend.yml` | Deploy to production server |

### CI/CD Expectations

**From Backend-Agent:**
- Dockerfile in repository root or service directory
- Health check endpoint (`GET /health`)
- Proper exit codes (0 = success, non-0 = failure)
- Environment variable configuration via `.env`

**From CI/CD:**
- Container image builds and pushes
- SSH deployment to Ubuntu server
- Zero-downtime rolling updates
- Health check verification

### Interface Contract

```yaml
# Backend service interface
requirements:
  dockerfile:
    location: "Dockerfile" or "backend/Dockerfile"
    health_check: 
      endpoint: "GET /health"
      port: 3000
      expected_status: 200
    
  runtime:
    node_version: 20.x
    graceful_shutdown: true
    
  environment:
    DATABASE_URL: required
    REDIS_URL: optional
    PORT: optional (default: 3000)

outputs:
  - Container image: ghcr.io/cywf/audifi:<tag>
  - Tags: sha-<commit>, branch name, latest
```

### New Service Integration

When adding new backend services:

1. Create Dockerfile following existing patterns
2. Implement `/health` endpoint
3. Add service to `docker-compose.yml`
4. Update CI/CD paths if in new directory
5. Document service in backend pipeline docs

---

## DATABASE-AGENT Interface

### Migration Triggers

| Event | Workflow | Action |
|-------|----------|--------|
| Push to `develop` | `backend.yml` | Run staging migrations |
| Push to `main` | `backend.yml` | Run production migrations |

### CI/CD Expectations

**From Database-Agent:**
- Migration files in standard location (`prisma/migrations/`)
- Backward-compatible schema changes
- Idempotent migration commands
- Rollback procedures documented

**From CI/CD:**
- Migration execution before code deployment
- Deployment failure on migration failure
- Connection string injection via secrets

### Interface Contract

```yaml
# Database migration interface
migration_tool: prisma | drizzle | flyway

commands:
  apply: "npx prisma migrate deploy"
  status: "npx prisma migrate status"
  generate: "npx prisma migrate dev --name <name>"

requirements:
  - Migrations must be backward compatible
  - Each migration in single transaction
  - No data loss without explicit approval

secrets_required:
  - STAGING_DATABASE_URL
  - PRODUCTION_DATABASE_URL
```

### Migration Lifecycle

```
Code Push → CI Build → Migration Check → Migration Apply → Container Deploy → Health Check
                             │                  │
                             ▼                  ▼
                      [Schema Valid?]    [Apply Success?]
                             │                  │
                          No ─┘              No ─┘
                             │                  │
                             ▼                  ▼
                      [Block Deploy]     [Block Deploy]
```

---

## NETWORKING-AGENT Interface

### Domain Configuration

| Environment | Frontend Domain | API Domain |
|-------------|-----------------|------------|
| Production | `audifi.io` | `api.audifi.io` |
| Staging | `staging.audifi.io` | `api-staging.audifi.io` |
| Preview | `*.vercel.app` | N/A (uses staging) |

### CI/CD Dependencies

**From Networking-Agent:**
- DNS records configured for domains
- SSL certificates provisioned (Vercel/Let's Encrypt)
- Load balancer configuration (if applicable)
- Firewall rules for deployment access

**From CI/CD:**
- Deployment to configured endpoints
- Health check verification
- SSL validation

### Interface Contract

```yaml
# Networking requirements
dns:
  production:
    - audifi.io → Vercel
    - api.audifi.io → Ubuntu server
  staging:
    - staging.audifi.io → Vercel
    - api-staging.audifi.io → Ubuntu server

ssl:
  provider: vercel (frontend) | letsencrypt (backend)
  auto_renewal: true

ports:
  frontend: 443 (HTTPS)
  backend_api: 443 (HTTPS)
  backend_internal: 3000, 3001

firewall:
  allow:
    - GitHub Actions IP ranges (deployment)
    - Vercel Edge (frontend)
```

---

## SECURITY-AGENT Interface

### Security Check Triggers

| Event | Workflow | Checks Run |
|-------|----------|------------|
| All PRs | `security.yml` | All scans |
| All pushes | `security.yml` | All scans |
| Nightly (2 AM UTC) | `security.yml` | Dependency scan |

### CI/CD Integration

**From Security-Agent:**
- Security policy guidelines
- Vulnerability thresholds
- Approved dependency list
- Secret patterns to detect

**From CI/CD:**
- `npm audit` results
- CodeQL scan results
- Secret detection results
- License compliance report

### Interface Contract

```yaml
# Security integration
scans:
  - name: dependency_scan
    tool: npm audit
    threshold: high  # Fail on high/critical
    
  - name: static_analysis
    tool: eslint
    threshold: error  # Fail on errors only
    
  - name: code_scanning
    tool: codeql
    queries: security-extended
    
  - name: secret_detection
    patterns:
      - AWS keys
      - Private keys
      - Hardcoded passwords

outputs:
  - Artifact: npm-audit-results.json
  - Artifact: eslint-results.json
  - GitHub Security tab: CodeQL alerts
```

### Security Gate Behavior

| Check | Failure Impact |
|-------|----------------|
| Critical vulnerability | ❌ Block merge |
| High vulnerability | ❌ Block merge |
| Moderate vulnerability | ⚠️ Warning |
| ESLint error | ❌ Block merge |
| CodeQL alert (critical) | ❌ Block merge |
| Secret detected | ❌ Block merge |

---

## DOCUMENTATION-AGENT Interface

### Documentation Triggers

| Event | Action |
|-------|--------|
| Workflow file changes | Update CI/CD docs |
| New pipeline added | Add pipeline docs |
| Configuration changes | Update secrets docs |

### CI/CD Documentation

**Required Documentation:**

| Document | Purpose | Update Trigger |
|----------|---------|----------------|
| `audifi-cicd-audit.md` | Current state assessment | Major changes |
| `audifi-cicd-strategy.md` | Overall strategy | Strategy changes |
| `audifi-frontend-pipeline.md` | Frontend details | Frontend workflow changes |
| `audifi-backend-pipeline.md` | Backend details | Backend workflow changes |
| `audifi-db-migrations.md` | Migration process | DB changes |
| `audifi-security-checks.md` | Security scanning | Security workflow changes |
| `audifi-release-management.md` | Release process | Release process changes |
| `audifi-secrets-and-config.md` | Configuration | New secrets/config |
| `audifi-cicd-interfaces.md` | Agent integration | Any interface changes |
| `README.md` | Overview & quick start | Any changes |

### Documentation Standards

```markdown
# Document Structure

## Overview
Brief description of what this document covers

## [Main Content]
Detailed information

## Best Practices
DO/DON'T guidelines

## Troubleshooting
Common issues and solutions

---
*This document is part of the AudiFi CI/CD documentation.*
```

---

## Integration Checklist

When making changes that affect multiple agents:

```markdown
### Cross-Agent Impact Checklist

- [ ] Frontend changes require CI/CD update?
- [ ] Backend changes require CI/CD update?
- [ ] Database schema changes planned?
- [ ] New domains or endpoints needed?
- [ ] Security policy changes required?
- [ ] Documentation updates needed?

### Notification Requirements

- [ ] Notify affected agents of interface changes
- [ ] Update relevant documentation
- [ ] Test integration in staging
- [ ] Verify production deployment
```

---

*This document is part of the AudiFi CI/CD documentation.*
