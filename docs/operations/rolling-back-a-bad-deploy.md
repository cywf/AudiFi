# Rolling Back a Bad Deploy

> When and how to roll back a failed deployment

## Overview

This runbook covers the decision criteria and procedures for rolling back a deployment that has caused issues in production.

---

## When to Roll Back

### Roll Back Immediately (P0)

- [ ] Site is down or unreachable
- [ ] Authentication is broken
- [ ] Data is being corrupted
- [ ] Security vulnerability exposed
- [ ] Financial transactions failing

### Consider Rolling Back (P1)

- [ ] Major feature broken
- [ ] Significant performance degradation
- [ ] Error rates spiked above threshold
- [ ] Critical user flows affected

### Fix Forward Instead

- [ ] Minor UI issues
- [ ] Non-critical feature bugs
- [ ] Performance slightly degraded
- [ ] Localized issues affecting few users

---

## Frontend Rollback (Vercel)

### Via Dashboard

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the `audifi` project
3. Click **Deployments**
4. Find the last known good deployment
5. Click **...** → **Promote to Production**
6. Confirm

### Via CLI

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or rollback to previous
vercel rollback
```

### Verification

```bash
# Check production site
curl -I https://app.audifi.io

# Verify content hash changed
curl -s https://app.audifi.io | head -20
```

---

## Backend Rollback (Kubernetes)

### Quick Rollback

```bash
# Rollback all affected deployments
kubectl rollout undo deployment/auth-service
kubectl rollout undo deployment/nft-service

# Verify
kubectl rollout status deployment/auth-service
```

### Specific Version Rollback

```bash
# List revision history
kubectl rollout history deployment/auth-service

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=3
```

### Check Pod Status

```bash
# Watch pods
kubectl get pods -w

# Check logs
kubectl logs -f deployment/auth-service
```

---

## Database Rollback

> **⚠️ CAUTION:** Database rollbacks are dangerous and should be a last resort.

### Non-Destructive Migrations

If the migration only added columns/tables:
1. Deploy previous application version
2. Application ignores new columns
3. Clean up new columns later

### Destructive Migrations

If the migration modified/deleted data:
1. **Do NOT** attempt automatic rollback
2. Contact database administrator
3. Restore from backup if necessary
4. Create incident report

### Restore from Backup

```bash
# Managed PostgreSQL (example)
# Use cloud provider console to restore point-in-time

# Or restore from dump
pg_restore -h $HOST -U $USER -d audifi backup.dump
```

---

## Smart Contract Rollback

> **Note:** Smart contracts cannot be "rolled back" in the traditional sense.

### Options

1. **Pause contract** (if pausable)
   ```
   # Via multi-sig
   Contract.pause()
   ```

2. **Deploy new contract**
   - Deploy fixed version
   - Migrate state if needed
   - Update frontend config

3. **Upgrade proxy** (if upgradeable)
   - Deploy new implementation
   - Multi-sig approves upgrade
   - Execute after timelock

---

## Post-Rollback Actions

### Immediate

- [ ] Verify rollback successful
- [ ] Check all services healthy
- [ ] Notify stakeholders
- [ ] Update status page

### Within 1 Hour

- [ ] Identify root cause
- [ ] Document what went wrong
- [ ] Create follow-up ticket

### Within 24 Hours

- [ ] Complete incident report
- [ ] Schedule post-mortem
- [ ] Plan fix for next deployment

---

## Rollback Communication Template

```
🔙 ROLLBACK NOTICE

Time: [TIME UTC]
Component: [Frontend/Backend/Both]
Rollback from: v1.2.3
Rollback to: v1.2.2

Reason: [Brief description]

Impact: [What users experienced]

Status: Rollback complete, services restored

Next steps: [Investigation plan]

Questions: Contact @on-call
```

---

## Decision Matrix

| Issue | Severity | Action | Owner |
|-------|----------|--------|-------|
| Site down | P0 | Immediate rollback | On-call |
| Auth broken | P0 | Immediate rollback | On-call |
| Data corruption | P0 | Rollback + investigate | On-call + DB admin |
| Feature broken | P1 | Rollback or hotfix | Dev lead |
| Performance issue | P2 | Monitor, likely fix forward | Dev lead |
| Minor bug | P3 | Fix forward | Dev team |

---

## Related Documents

- [Deploying a New Version](./deploying-a-new-version.md)
- [Handling Incidents](./handling-incidents-and-outages.md)
- [CI/CD Overview](../cicd/overview.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
