# Deploying a New Version

> Step-by-step guide for deploying AudiFi updates

## Overview

This runbook covers the process of deploying new code to the AudiFi platform, from PR approval to production deployment.

> **Status:** 🔄 PLANNED - Current frontend uses Vercel auto-deploy. Backend deployment procedures TBD.

---

## Pre-Deployment Checklist

Before deploying, verify:

- [ ] All tests pass in CI
- [ ] PR has been reviewed and approved
- [ ] No critical security vulnerabilities
- [ ] Documentation updated (if needed)
- [ ] Changelog updated (if needed)
- [ ] Database migrations reviewed (if any)
- [ ] Feature flags configured (if needed)

---

## Current Deployment (Frontend)

### Vercel Auto-Deploy

Currently, the frontend auto-deploys via Vercel:

```
CURRENT FLOW
════════════

PR Merged to main
       │
       ▼
GitHub triggers webhook
       │
       ▼
Vercel builds project
       │
       ▼
Vercel runs checks
       │
       ▼
Vercel deploys to production
       │
       ▼
DNS updates (instant)
```

### Manual Steps

1. **Merge PR**
   - Ensure all checks pass
   - Get required approvals
   - Merge to `main`

2. **Verify Deployment**
   - Check Vercel dashboard for build status
   - Verify production site loads
   - Spot-check key functionality

3. **Monitor**
   - Watch error tracking (when enabled)
   - Check analytics for anomalies

---

## Future Deployment (Backend)

> **Status:** 🔄 PLANNED

### Pipeline Overview

```
PLANNED BACKEND FLOW
════════════════════

PR Merged to main
       │
       ▼
GitHub Actions triggered
       │
       ├── Run tests
       ├── Build Docker images
       ├── Run security scans
       └── Push to registry
              │
              ▼
       Deploy to staging
              │
              ▼
       Smoke tests
              │
              ▼
       Manual approval
              │
              ▼
       Deploy to production
              │
              ▼
       Health checks
              │
              ▼
       Monitor
```

### Staging Deployment

```bash
# Triggered automatically on merge
# Deployed to: api.staging.audifi.io

# Verify staging
curl https://api.staging.audifi.io/health
```

### Production Deployment

```bash
# After staging verification, approve in GitHub Actions

# Or manually (if needed):
kubectl set image deployment/auth-service \
  auth-service=ghcr.io/audifi/auth-service:v1.2.3

# Verify rollout
kubectl rollout status deployment/auth-service
```

---

## Database Migrations

### Before Deploying

1. **Review migration files**
   ```bash
   # List pending migrations
   npx prisma migrate status
   ```

2. **Test on staging**
   ```bash
   # Run migrations on staging first
   DATABASE_URL=$STAGING_DB npx prisma migrate deploy
   ```

3. **Verify data integrity**
   - Check that existing data is preserved
   - Verify new columns have correct defaults

### During Deployment

Migrations run automatically as part of the deployment:

```yaml
# In deployment config
initContainers:
  - name: migrations
    command: ["npx", "prisma", "migrate", "deploy"]
```

### Rollback Considerations

If migration causes issues:
1. Do NOT roll back destructive migrations
2. Deploy a fix-forward migration instead
3. Contact database admin for manual intervention if needed

---

## Smart Contract Deployment

> **Status:** 🔄 PLANNED

### Pre-Deployment

- [ ] Contract audited
- [ ] Testnet deployment verified
- [ ] Multi-sig proposal created
- [ ] Gas estimates reviewed

### Mainnet Deployment

```
CONTRACT DEPLOYMENT FLOW
════════════════════════

1. Multi-sig creates proposal
           │
           ▼
2. Required signers approve
           │
           ▼
3. Timelock period (48h)
           │
           ▼
4. Proposal executed
           │
           ▼
5. Contract verified on Etherscan
           │
           ▼
6. Frontend config updated
```

---

## Rollback Procedures

### Frontend Rollback

```bash
# Vercel instant rollback
# Go to Vercel dashboard → Deployments → Previous → Promote to Production

# Or via CLI
vercel rollback
```

### Backend Rollback

```bash
# Kubernetes rollback
kubectl rollout undo deployment/auth-service

# Verify
kubectl rollout status deployment/auth-service
```

### When to Rollback

- Critical functionality broken
- Security vulnerability exposed
- Data corruption detected
- Performance severely degraded

> **See also:** [Rolling Back a Bad Deploy](./rolling-back-a-bad-deploy.md)

---

## Post-Deployment

### Verification Steps

1. **Health checks**
   ```bash
   curl https://api.audifi.io/health
   curl https://app.audifi.io
   ```

2. **Smoke tests**
   - Login/logout works
   - Dashboard loads
   - Key features functional

3. **Monitoring**
   - Error rates normal
   - Response times normal
   - No unusual traffic patterns

### Communication

- Update #deployments channel
- Notify stakeholders of major changes
- Update status page if needed

---

## Emergency Deployment

For critical fixes outside normal hours:

1. **Create hotfix branch**
   ```bash
   git checkout -b hotfix/critical-fix main
   ```

2. **Minimal change**
   - Fix only the critical issue
   - No unrelated changes

3. **Expedited review**
   - Tag on-call reviewer
   - Document urgency

4. **Deploy and monitor**
   - Deploy immediately after approval
   - Stay online to monitor

5. **Follow up**
   - Create post-mortem
   - Backport to other branches if needed

---

## Related Documents

- [Rolling Back a Bad Deploy](./rolling-back-a-bad-deploy.md)
- [Handling Incidents](./handling-incidents-and-outages.md)
- [CI/CD Overview](../cicd/overview.md)
- [Architecture Overview](../architecture/overview.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
