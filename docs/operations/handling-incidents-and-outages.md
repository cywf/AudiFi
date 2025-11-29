# Handling Incidents and Outages

> Incident response procedures for AudiFi

## Overview

This runbook provides guidance for responding to production incidents, from initial triage through resolution and post-mortem.

---

## Severity Classification

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| **P0** | Critical - Major outage or security breach | 15 minutes | Site down, funds at risk |
| **P1** | High - Major feature broken | 1 hour | Auth broken, trades failing |
| **P2** | Medium - Significant degradation | 4 hours | Slow performance, feature partial |
| **P3** | Low - Minor issues | 24 hours | UI bugs, edge cases |

---

## Incident Response Flow

```
INCIDENT RESPONSE
═════════════════

1. DETECT
   ├── Monitoring alert
   ├── User report
   └── Team observation
          │
          ▼
2. ACKNOWLEDGE
   ├── Claim incident
   ├── Assess severity
   └── Notify stakeholders
          │
          ▼
3. TRIAGE
   ├── Identify scope
   ├── Determine root cause
   └── Decide: Rollback or fix
          │
          ▼
4. RESPOND
   ├── Execute remediation
   ├── Verify fix
   └── Monitor recovery
          │
          ▼
5. RESOLVE
   ├── Confirm stable
   ├── Update status
   └── Stand down
          │
          ▼
6. REVIEW
   ├── Document timeline
   ├── Conduct post-mortem
   └── Create follow-ups
```

---

## Step 1: Detect

### Monitoring Alerts

Alerts may come from:
- Uptime monitoring (site unreachable)
- Error rate spikes
- Response time degradation
- Resource exhaustion (CPU, memory, disk)
- Custom business metrics

### User Reports

Sources:
- Support tickets
- Social media
- Direct messages

### Action

1. Note the time of first detection
2. Gather initial symptoms
3. Move to acknowledgment

---

## Step 2: Acknowledge

### Claim the Incident

```
# In incident channel
@here I'm taking lead on this incident
```

### Assess Severity

Ask:
- Is the site accessible?
- Is authentication working?
- Are financial transactions affected?
- How many users impacted?

### Notify

| Severity | Notify |
|----------|--------|
| P0 | @here in incident channel, page on-call |
| P1 | @here in incident channel |
| P2 | Post in incident channel |
| P3 | Create ticket, assign |

---

## Step 3: Triage

### Quick Diagnosis

```bash
# Check site accessibility
curl -I https://app.audifi.io
curl -I https://api.audifi.io/health

# Check recent deployments
vercel ls --limit 5

# Check error logs (when available)
kubectl logs -f deployment/auth-service --tail=100
```

### Common Causes

| Symptom | Likely Cause | Quick Check |
|---------|--------------|-------------|
| Site 500s | Backend crash | Check pod status |
| Site unreachable | DNS/CDN issue | Check Cloudflare |
| Slow responses | Database load | Check DB connections |
| Auth failures | Token service | Check auth-service logs |
| Blockchain errors | RPC issues | Check Alchemy status |

### Decision Point

- **Rollback:** If recent deploy is suspected
- **Fix Forward:** If issue is in data or config
- **External:** If third-party service is down

---

## Step 4: Respond

### If Rolling Back

See: [Rolling Back a Bad Deploy](./rolling-back-a-bad-deploy.md)

### If Fixing Forward

1. Create hotfix branch
2. Minimal change only
3. Expedited review
4. Deploy directly

### If External Dependency

1. Document the dependency
2. Enable fallback if available
3. Monitor external status page
4. Communicate to users

---

## Step 5: Resolve

### Verify Recovery

- [ ] All services healthy
- [ ] Error rates normalized
- [ ] Key user flows working
- [ ] No new errors in logs

### Update Status

```
✅ RESOLVED

Time: [TIME UTC]
Duration: [X minutes/hours]
Impact: [What users experienced]
Root cause: [Brief description]
Resolution: [What fixed it]

Full post-mortem to follow.
```

### Stand Down

- Notify stakeholders
- Update status page
- Return to normal operations

---

## Step 6: Review

### Document Timeline

```
INCIDENT TIMELINE
═════════════════

[TIME] - First alert received
[TIME] - Incident acknowledged by @person
[TIME] - Root cause identified
[TIME] - Remediation started
[TIME] - Fix deployed
[TIME] - Service recovered
[TIME] - Incident resolved
```

### Post-Mortem

Within 48 hours, conduct post-mortem covering:

1. **What happened?**
2. **What was the impact?**
3. **What was the root cause?**
4. **What went well?**
5. **What could be improved?**
6. **Action items**

### Follow-Ups

Create tickets for:
- [ ] Technical improvements
- [ ] Process improvements
- [ ] Documentation updates
- [ ] Monitoring improvements

---

## Log Locations

| Component | Location |
|-----------|----------|
| Frontend | Vercel Dashboard → Logs |
| API Gateway | Kubernetes logs |
| Auth Service | `kubectl logs deployment/auth-service` |
| NFT Service | `kubectl logs deployment/nft-service` |
| Database | Cloud provider console |
| CDN | Cloudflare Dashboard |

---

## Useful Commands

```bash
# Check all pod status
kubectl get pods -A

# Check recent events
kubectl get events --sort-by=.metadata.creationTimestamp

# Port forward for debugging
kubectl port-forward deployment/auth-service 3001:3001

# Check resource usage
kubectl top pods

# Database connection check
psql $DATABASE_URL -c "SELECT 1"
```

---

## Communication Templates

### Initial Acknowledgment

```
🚨 INCIDENT IN PROGRESS

Time: [TIME UTC]
Severity: [P0/P1/P2]
Status: Investigating

We're aware of [brief description] and are investigating.
Updates to follow.
```

### Update

```
🔄 INCIDENT UPDATE

Time: [TIME UTC]
Status: [Investigating/Identified/Fixing]

[What we know now]
[What we're doing]

Next update in [X] minutes.
```

### Resolution

```
✅ INCIDENT RESOLVED

Time: [TIME UTC]
Duration: [X minutes]
Impact: [Description]

[What was fixed]

Post-mortem to follow within 48 hours.
```

---

## Related Documents

- [Deploying a New Version](./deploying-a-new-version.md)
- [Rolling Back a Bad Deploy](./rolling-back-a-bad-deploy.md)
- [Security Overview](../architecture/security-overview.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
