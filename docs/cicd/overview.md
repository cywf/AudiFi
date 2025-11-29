# CI/CD Overview

> Continuous Integration and Deployment for AudiFi

## Overview

This document describes the CI/CD pipelines and workflows for the AudiFi platform.

> **Status:** 🔄 PLANNED - Basic GitHub Actions in place. Full pipeline TBD.

---

## Current State

### GitHub Actions

Currently configured:
- Dependabot for dependency updates

### Vercel Integration

Frontend deployment is handled by Vercel:
- Automatic deploys on push to `main`
- Preview deploys on pull requests
- Instant rollback capability

---

## Planned Pipeline

```
CI/CD PIPELINE (PLANNED)
════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                              PULL REQUEST                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. LINT & FORMAT                                                          │
│      ├── ESLint                                                             │
│      ├── Prettier                                                           │
│      └── TypeScript check                                                   │
│                                                                             │
│   2. TEST                                                                   │
│      ├── Unit tests                                                         │
│      ├── Integration tests                                                  │
│      └── Coverage report                                                    │
│                                                                             │
│   3. BUILD                                                                  │
│      ├── Frontend build                                                     │
│      └── Backend build (Docker)                                             │
│                                                                             │
│   4. SECURITY                                                               │
│      ├── Dependency audit                                                   │
│      ├── SAST scanning                                                      │
│      └── Container scanning                                                 │
│                                                                             │
│   5. PREVIEW                                                                │
│      └── Deploy to preview environment                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              MERGE TO MAIN                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   6. STAGING DEPLOY                                                         │
│      ├── Deploy frontend to staging                                         │
│      ├── Deploy backend to staging                                          │
│      ├── Run migrations                                                     │
│      └── Run smoke tests                                                    │
│                                                                             │
│   7. PRODUCTION DEPLOY                                                      │
│      ├── Manual approval gate                                               │
│      ├── Deploy frontend to production                                      │
│      ├── Deploy backend to production                                       │
│      ├── Run health checks                                                  │
│      └── Monitor for errors                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Workflow Files

### Pull Request Checks

```yaml
# .github/workflows/pr-checks.yml (planned)
name: PR Checks

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### Staging Deploy

```yaml
# .github/workflows/deploy-staging.yml (planned)
name: Deploy Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push Docker images
        run: |
          docker build -t ghcr.io/audifi/auth-service:${{ github.sha }} .
          docker push ghcr.io/audifi/auth-service:${{ github.sha }}
      
      - name: Deploy to staging
        run: |
          kubectl set image deployment/auth-service \
            auth-service=ghcr.io/audifi/auth-service:${{ github.sha }}
      
      - name: Smoke tests
        run: npm run test:e2e:staging
```

### Production Deploy

```yaml
# .github/workflows/deploy-production.yml (planned)
name: Deploy Production

on:
  workflow_dispatch:
  workflow_run:
    workflows: [Deploy Staging]
    types: [completed]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: |
          kubectl set image deployment/auth-service \
            auth-service=ghcr.io/audifi/auth-service:${{ github.sha }}
      
      - name: Health check
        run: |
          curl --fail https://api.audifi.io/health
```

---

## Environments

| Environment | URL | Branch | Auto-Deploy |
|-------------|-----|--------|-------------|
| Development | localhost:5173 | any | N/A |
| Preview | *.vercel.app | PR | Yes |
| Staging | staging.audifi.io | main | Yes |
| Production | audifi.io | main | After approval |

---

## Branch Strategy

```
BRANCH FLOW
═══════════

main
│
├── feature/xyz   ──────────────▶ PR ──▶ main
│                                        │
├── fix/abc       ──────────────▶ PR ──▶ main
│                                        │
└── hotfix/urgent ──────────────▶ PR ──▶ main (expedited)
```

### Protection Rules

`main` branch:
- Require pull request reviews (1)
- Require status checks to pass
- Require linear history
- Include administrators

---

## Secret Management

### GitHub Secrets

| Secret | Purpose | Environment |
|--------|---------|-------------|
| `VERCEL_TOKEN` | Frontend deploy | All |
| `KUBE_CONFIG` | Kubernetes access | Staging, Prod |
| `DATABASE_URL` | Database connection | Staging, Prod |
| `RPC_URL` | Blockchain RPC | Staging, Prod |

### Environment Variables

Set per-environment in GitHub repository settings.

---

## Quality Gates

### Required to Merge

- [ ] All CI checks pass
- [ ] At least 1 approval
- [ ] No merge conflicts
- [ ] Branch up to date with main

### Required for Production

- [ ] Staging deploy successful
- [ ] Smoke tests pass
- [ ] Manual approval from team lead

---

## Monitoring

### Deploy Notifications

Sent to #deployments Slack channel:
- Deploy started
- Deploy completed
- Deploy failed

### Metrics

Track in CI dashboard:
- Build duration
- Test coverage trend
- Deploy frequency
- Failure rate

---

## Status

| Component | Status |
|-----------|--------|
| Dependabot | ✅ CURRENT |
| PR checks | 🔄 PLANNED |
| Staging deploy | 🔄 PLANNED |
| Production deploy | 🔄 PLANNED |
| Slack notifications | 🔄 PLANNED |

---

## Related Documents

- [Deploying a New Version](../operations/deploying-a-new-version.md)
- [Rolling Back a Bad Deploy](../operations/rolling-back-a-bad-deploy.md)
- [Architecture Overview](../architecture/overview.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
