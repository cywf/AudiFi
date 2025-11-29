# AudiFi CI/CD Strategy

## Overview

This document defines the CI/CD strategy for the AudiFi platform, covering the branching model, environment configuration, and deployment workflows.

## Branching Model

AudiFi follows a **trunk-based development** approach with the following branch structure:

```
main              →  Production deployments (audifi.io)
  │
  ├── develop     →  Staging deployments (staging.audifi.io)
  │
  └── feature/*   →  Feature branches (PR previews)
      hotfix/*    →  Hotfix branches (emergency fixes)
```

### Branch Rules

| Branch Pattern | Protection | Merge Requirements | Deploy Target |
|----------------|------------|-------------------|---------------|
| `main` | ✅ Protected | PR required, reviews required, CI pass | Production |
| `develop` | ✅ Protected | PR required, CI pass | Staging |
| `feature/*` | ❌ Not protected | None | Preview (optional) |
| `hotfix/*` | ❌ Not protected | None | Preview (optional) |

### Workflow

1. **Feature Development**
   ```
   develop → feature/my-feature → PR → develop
   ```

2. **Staging Release**
   ```
   develop → (auto-deploy) → staging.audifi.io
   ```

3. **Production Release**
   ```
   develop → PR → main → (auto-deploy) → audifi.io
   ```

4. **Hotfix Flow**
   ```
   main → hotfix/urgent-fix → PR → main → cherry-pick → develop
   ```

## Environments

### Development (Preview)

- **Purpose**: Review changes before merging
- **Trigger**: Pull request creation/update
- **URL Pattern**: `pr-{number}.preview.audifi.io` (Vercel) or auto-generated
- **Lifecycle**: Destroyed when PR is closed
- **Backend**: None (uses staging APIs or mocks)
- **Database**: None (mocks/stubs)

### Staging

- **Purpose**: Pre-production testing and integration
- **Trigger**: Push to `develop` branch
- **URL**: `staging.audifi.io` or `app-staging.audifi.io`
- **Backend**: Staging backend services on Ubuntu server
- **Database**: Staging database with test data

### Production

- **Purpose**: Live user-facing environment
- **Trigger**: Push to `main` branch (after approval)
- **URL**: `audifi.io` / `app.audifi.io`
- **Backend**: Production backend services on Ubuntu server
- **Database**: Production database

## Deployment Pipeline

### Frontend Pipeline

```yaml
Trigger: PR / Push to develop / Push to main
  │
  ├── Checkout code
  ├── Setup Node.js (v20)
  ├── Install dependencies (with cache)
  ├── Run linting
  ├── Run tests (when available)
  ├── Build application
  │
  ├── [PR] Deploy preview → Vercel/Fly.io
  ├── [develop] Deploy staging → staging.audifi.io
  └── [main] Deploy production → audifi.io
```

### Backend Pipeline (Future)

```yaml
Trigger: PR / Push to develop / Push to main
  │
  ├── Checkout code
  ├── Setup runtime (Node.js/TypeScript)
  ├── Install dependencies
  ├── Run linting
  ├── Run tests
  ├── Build Docker image(s)
  │
  ├── [PR] Build only (no push)
  ├── [develop]
  │   ├── Push image to registry (staging tag)
  │   ├── Run database migrations
  │   └── Deploy to staging server via SSH
  │
  └── [main]
      ├── Push image to registry (prod tag)
      ├── Run database migrations
      └── Deploy to production server via SSH
```

## Approval Workflow

### Production Deployments

Production deployments to `main` require:

1. **Pull Request** from `develop` to `main`
2. **Code Review** - At least 1 approval required
3. **CI Checks** - All workflows must pass:
   - Lint check
   - Test check
   - Build check
   - Security scan
4. **Manual Approval** (optional) - For critical releases

### GitHub Environment Protection

```yaml
Environments:
  preview:
    protection_rules: none
    
  staging:
    protection_rules:
      - required_reviewers: 0
      - wait_timer: 0
    
  production:
    protection_rules:
      - required_reviewers: 1
      - wait_timer: 5  # minutes
```

## Secrets & Configuration

### Repository Secrets

| Secret Name | Environment | Purpose |
|-------------|-------------|---------|
| `VERCEL_TOKEN` | All | Vercel deployment authentication |
| `VERCEL_ORG_ID` | All | Vercel organization identifier |
| `VERCEL_PROJECT_ID` | All | Vercel project identifier |
| `FLY_API_TOKEN` | All | Fly.io deployment (alternative) |

### Environment-Specific Secrets

| Secret Name | staging | production | Purpose |
|-------------|---------|------------|---------|
| `DATABASE_URL` | ✅ | ✅ | Database connection string |
| `API_SECRET_KEY` | ✅ | ✅ | API authentication |
| `STRIPE_SECRET_KEY` | ✅ | ✅ | Payment processing |
| `DEPLOY_SSH_KEY` | ✅ | ✅ | SSH key for Ubuntu server |
| `DEPLOY_HOST` | ✅ | ✅ | Server hostname/IP |

### Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `VITE_API_URL` | Public | API base URL |
| `VITE_APP_ENV` | Public | Environment identifier |
| `VITE_ENABLE_ANALYTICS` | Public | Analytics toggle |

## Agent Integration Points

### FRONTEND-AGENT
- Triggers: PR creation, push to develop/main
- Responsibilities: Build verification, preview deployments

### BACKEND-AGENT
- Triggers: PR creation, push to develop/main (backend paths)
- Responsibilities: Container builds, API testing

### DATABASE-AGENT
- Triggers: Deploy to staging/production
- Responsibilities: Migration execution, rollback handling

### NETWORKING-AGENT
- Dependencies: Domain configuration, SSL certificates
- Responsibilities: Load balancer updates, DNS management

### SECURITY-AGENT
- Triggers: All PRs, scheduled scans
- Responsibilities: SAST, dependency scanning, secret detection

### DOCUMENTATION-AGENT
- Triggers: Changes to docs/**
- Responsibilities: Documentation validation, link checking

## Pipeline Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/frontend.yml` | Frontend CI/CD |
| `.github/workflows/backend.yml` | Backend CI/CD |
| `.github/workflows/security.yml` | Security scans |
| `.github/workflows/db-migrations.yml` | Database migrations |

## Rollback Strategy

### Frontend Rollback

1. **Automatic**: Vercel maintains deployment history
2. **Manual**: Revert commit and push to main

### Backend Rollback

1. **Container**: Redeploy previous image tag
2. **Database**: Execute down-migrations or restore backup

### Emergency Procedure

```bash
# 1. Identify last working deployment
git log --oneline main

# 2. Revert to last working state
git revert <bad-commit>
git push origin main

# 3. Monitor deployment
# Automatic redeployment triggers
```

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build Success Rate | > 95% | GitHub Actions metrics |
| Deployment Frequency | Daily | Number of production deploys |
| Lead Time | < 1 hour | Time from PR merge to production |
| MTTR | < 30 min | Time to recover from failure |

---

*This strategy document is maintained as part of the AudiFi CI/CD infrastructure.*
