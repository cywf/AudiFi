# AudiFi Security Alignment

## Overview

This document defines security requirements, firewall rules, and access controls for AudiFi's network infrastructure. It serves as a reference for the Security Agent and provides alignment between networking and security practices.

---

## Security Zones

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      INTERNET                                           │
│                                    (Untrusted)                                          │
└─────────────────────────────────────────┬───────────────────────────────────────────────┘
                                          │
                                          │ HTTPS (443)
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DMZ / EDGE ZONE                                       │
│  ┌─────────────────┐         ┌─────────────────────────────────────────────────────┐   │
│  │  Vercel CDN     │         │  Backend Server - Reverse Proxy (Caddy)             │   │
│  │  (Frontend)     │         │  • TLS Termination                                  │   │
│  │                 │         │  • Rate Limiting                                     │   │
│  │                 │         │  • WAF Rules (Optional)                              │   │
│  └─────────────────┘         └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────────────────────────────────┼──────────────────────────────┘
                                                           │
                                                           │ Internal HTTP (3000, 3001, 3002)
                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   APPLICATION ZONE                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                              │
│  │  API Server  │    │  WS Server   │    │   Worker     │                              │
│  │   (3000)     │    │   (3001)     │    │   (3002)     │                              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                              │
│         │                   │                   │                                       │
│         └───────────────────┼───────────────────┘                                       │
│                             │                                                           │
└─────────────────────────────┼───────────────────────────────────────────────────────────┘
                              │
                              │ Internal Only (5432, 6379)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                     DATA ZONE                                           │
│  ┌──────────────────────────┐         ┌──────────────────────────┐                     │
│  │     PostgreSQL           │         │        Redis             │                     │
│  │        (5432)            │         │       (6379)             │                     │
│  │   Internal Access Only   │         │   Internal Access Only   │                     │
│  └──────────────────────────┘         └──────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Firewall Rules

### Inbound Rules (Internet → Server)

| Port | Protocol | Source | Destination | Purpose | Action |
|------|----------|--------|-------------|---------|--------|
| 443 | TCP | 0.0.0.0/0 | Caddy | HTTPS traffic | ALLOW |
| 80 | TCP | 0.0.0.0/0 | Caddy | HTTP → HTTPS redirect | ALLOW |
| 22 | TCP | VPN/Bastion IP | Server | SSH Admin | ALLOW |
| * | * | 0.0.0.0/0 | * | All other | DENY |

### Internal Rules (Container → Container)

| Source | Destination | Port | Purpose | Action |
|--------|-------------|------|---------|--------|
| Caddy | API Server | 3000 | API requests | ALLOW |
| Caddy | WS Server | 3001 | WebSocket | ALLOW |
| API Server | PostgreSQL | 5432 | Database | ALLOW |
| API Server | Redis | 6379 | Cache/Pub-Sub | ALLOW |
| WS Server | Redis | 6379 | Pub-Sub | ALLOW |
| Worker | PostgreSQL | 5432 | Database | ALLOW |
| Worker | Redis | 6379 | Job queue | ALLOW |
| * | * | * | All other internal | DENY |

### Outbound Rules (Server → Internet)

| Destination | Port | Purpose | Action |
|-------------|------|---------|--------|
| *.stripe.com | 443 | Payment API | ALLOW |
| *.alchemy.com | 443 | Blockchain RPC | ALLOW |
| *.infura.io | 443 | Blockchain RPC | ALLOW |
| *.helius-rpc.com | 443 | Solana RPC | ALLOW |
| *.googleapis.com | 443 | Google APIs | ALLOW |
| api.twitch.tv | 443 | Twitch API | ALLOW |
| irc-ws.chat.twitch.tv | 443 | Twitch Chat | ALLOW |
| discord.com | 443 | Discord API | ALLOW |
| gateway.discord.gg | 443 | Discord Gateway | ALLOW |
| api.resend.com | 443 | Email API | ALLOW |
| 0.0.0.0/0 | * | All other | DENY |

---

## Endpoint Security Classification

### Public Endpoints (No Auth)

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| `/health` | GET | Health check | 100/min |
| `/v1/auth/login` | POST | Magic link request | 5/min/IP |
| `/v1/auth/magic-link` | GET | Verify magic link | 10/min/IP |
| `/v1/marketplace` | GET | Browse listings | 60/min |
| `/webhooks/stripe` | POST | Payment events | Unlimited |

### Authenticated Endpoints

| Endpoint | Method | Required Role | Rate Limit |
|----------|--------|---------------|------------|
| `/v1/user/profile` | GET, PATCH | Any authenticated | 30/min |
| `/v1/tracks` | GET | Any authenticated | 60/min |
| `/v1/tracks` | POST | Artist | 10/min |
| `/v1/vstudio/session` | POST | Artist | 5/min |
| `/v1/vstudio/ws` | WSS | Any authenticated | N/A |

### Admin Endpoints (Restricted)

| Endpoint | Method | Required Role | Access Control |
|----------|--------|---------------|----------------|
| `/admin/*` | * | Admin | IP + Auth |
| `/v1/admin/users` | * | Admin | IP + Auth |
| `/v1/admin/analytics` | GET | Admin | IP + Auth |

**Admin Access Requirements:**
- Must connect from VPN/whitelisted IP
- Requires admin role authentication
- All actions logged with user ID

---

## Authentication Security

### JWT Configuration

```typescript
const jwtConfig = {
  algorithm: 'RS256',           // Asymmetric for better security
  accessTokenExpiry: '15m',     // Short-lived access tokens
  refreshTokenExpiry: '7d',     // Longer refresh tokens
  issuer: 'https://api.audifi.io',
  audience: 'https://audifi.io'
};
```

### Token Security Best Practices

- ✅ Use HTTP-only cookies for refresh tokens
- ✅ Store access tokens in memory only
- ✅ Implement token rotation on refresh
- ✅ Invalidate tokens on password change
- ✅ Include `jti` (JWT ID) for revocation
- ✅ Verify `iss`, `aud`, `exp` claims

### Session Security

| Setting | Value | Rationale |
|---------|-------|-----------|
| Cookie `Secure` | true | HTTPS only |
| Cookie `HttpOnly` | true | Prevent XSS access |
| Cookie `SameSite` | Strict | Prevent CSRF |
| Session TTL | 30 days | Balance UX and security |

---

## Rate Limiting Strategy

### Global Limits (Caddy/WAF Level)

```
# Per IP address
Global: 1000 requests/minute
Burst: 100 requests/second

# Specific paths
/v1/auth/*: 20 requests/minute
/webhooks/*: Unlimited (signature verified)
```

### Application-Level Limits

```typescript
const rateLimits = {
  // Authentication
  login: { window: 60, max: 5 },
  magicLink: { window: 60, max: 3 },
  
  // API
  default: { window: 60, max: 100 },
  search: { window: 60, max: 30 },
  
  // V Studio
  chatMessage: { window: 10, max: 5 },
  pollVote: { window: 60, max: 1 }, // per poll
  reactions: { window: 10, max: 10 },
  
  // Heavy operations
  createTrack: { window: 60, max: 5 },
  mint: { window: 3600, max: 10 }
};
```

---

## Input Validation & Sanitization

### API Input Validation

```typescript
// Using Zod for runtime validation
import { z } from 'zod';

const createTrackSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  genre: z.enum(VALID_GENRES),
  price: z.number().positive().max(1000000),
  royaltyPercent: z.number().min(0).max(25)
});
```

### Content Security

| Input Type | Validation | Sanitization |
|------------|------------|--------------|
| Text fields | Length limits | HTML escape |
| Numeric | Min/Max, type | None needed |
| URLs | Format validation | Protocol whitelist |
| Files | Type, size | Virus scan |
| Wallet addresses | Checksum validation | Lowercase normalization |

### SQL Injection Prevention

- ✅ Use parameterized queries only
- ✅ ORM with built-in escaping (Prisma, Drizzle)
- ✅ No raw SQL concatenation
- ✅ Input validation before queries

---

## Webhook Security

### Stripe Webhooks

```typescript
import Stripe from 'stripe';

app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    // Process event
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed');
    return res.status(400).send('Webhook Error');
  }
});
```

**Security Measures:**
- ✅ Verify cryptographic signature
- ✅ Check event timestamp (reject old events)
- ✅ Log all webhook events
- ✅ Idempotent processing (use event ID)

### External Webhooks (If Accepting)

| Check | Implementation |
|-------|----------------|
| Signature | HMAC-SHA256 verification |
| Timestamp | Reject if > 5 minutes old |
| IP (optional) | Allow-list if provider offers |
| Replay | Store processed event IDs |

---

## WAF / API Gateway Recommendations

### Recommended WAF Rules

| Rule | Purpose | Action |
|------|---------|--------|
| SQL Injection | Detect SQLi patterns | Block |
| XSS | Detect script injection | Block |
| Path Traversal | Detect `../` patterns | Block |
| Request Size | Limit body size | Block > 10MB |
| Content Type | Validate expected types | Block |
| Bot Detection | Filter known bad bots | Challenge/Block |

### WAF Options

| Option | Pros | Cons |
|--------|------|------|
| Cloudflare WAF | Easy setup, free tier | Additional hop |
| AWS WAF | Deep AWS integration | Requires AWS |
| Caddy + coraza | Self-hosted, free | More maintenance |

### Recommended Configuration

```
# Cloudflare WAF (if using Cloudflare DNS with proxy)
- Enable OWASP Core Ruleset
- Set sensitivity to Medium
- Create custom rules for:
  - Rate limiting on auth endpoints
  - Block known bad actors
  - Geographic restrictions (if needed)
```

---

## TLS Security

### Certificate Requirements

| Setting | Value |
|---------|-------|
| Minimum TLS | 1.2 |
| Preferred TLS | 1.3 |
| Certificate Type | EV or DV |
| Key Size | RSA 2048+ or ECDSA P-256+ |
| HSTS | Enabled, 1 year |

### Caddyfile TLS Settings

```caddyfile
{
    # Automatic HTTPS
    email admin@audifi.io
}

api.audifi.io {
    # TLS is automatic with Caddy
    
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Content-Security-Policy "default-src 'self'"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

---

## Database Security

### Access Control

```sql
-- Read-only user for analytics
CREATE USER audifi_readonly WITH PASSWORD '...';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO audifi_readonly;

-- Application user
CREATE USER audifi_app WITH PASSWORD '...';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO audifi_app;

-- Never use superuser from application
```

### Connection Security

| Setting | Value |
|---------|-------|
| SSL Mode | `require` (minimum) |
| Connection Limit | 100 (per pool) |
| Idle Timeout | 10 minutes |
| Network | Internal only (no public IP) |

### Data Encryption

| Layer | Implementation |
|-------|----------------|
| At Rest | Volume encryption (provider) |
| In Transit | TLS for all connections |
| Application | Encrypt sensitive fields (PII) |

---

## Secrets Management

### Storage

| Environment | Method |
|-------------|--------|
| Development | `.env` file (gitignored) |
| CI/CD | GitHub Secrets |
| Production | Doppler / AWS Secrets Manager / Vault |

### Rotation Policy

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| Database passwords | 90 days |
| API keys | 180 days |
| JWT signing keys | 365 days |
| Webhook secrets | 180 days |

### Access Audit

- ✅ Log all secret access
- ✅ Limit access to specific services/roles
- ✅ Alert on unusual access patterns
- ✅ Revoke immediately on compromise

---

## Incident Response

### Detection Points

| Monitor | Alert Threshold |
|---------|-----------------|
| Failed logins | > 10/minute from same IP |
| 401/403 responses | > 5% of traffic |
| Webhook failures | > 10% failure rate |
| Rate limit hits | > 100/minute |
| Database errors | Any increase |

### Response Runbook

1. **Credential Leak**
   - Revoke affected credentials immediately
   - Rotate all related secrets
   - Review access logs
   - Notify affected users

2. **DDoS Attack**
   - Enable additional rate limiting
   - Activate Cloudflare "Under Attack" mode
   - Block attacking IPs/ranges
   - Scale infrastructure if needed

3. **Data Breach**
   - Isolate affected systems
   - Preserve logs for forensics
   - Assess scope of breach
   - Notify users per GDPR/CCPA requirements

---

## Compliance Considerations

### Data Protection (GDPR/CCPA)

| Requirement | Implementation |
|-------------|----------------|
| Data minimization | Collect only necessary data |
| Right to erasure | Implement user deletion |
| Data portability | Export user data endpoint |
| Consent | Clear opt-in for marketing |
| Breach notification | 72-hour notification process |

### Financial (PCI-DSS)

**Note:** By using Stripe, AudiFi offloads most PCI requirements.

| Requirement | Implementation |
|-------------|----------------|
| No card storage | Use Stripe for all payment data |
| HTTPS only | Enforced everywhere |
| Access logging | All admin actions logged |

---

## Security Handoff Notes

### For SECURITY-AGENT

1. Review and approve firewall rules before deployment
2. Conduct penetration testing on staging environment
3. Set up security monitoring and alerting
4. Create incident response runbooks
5. Schedule quarterly security reviews

### For BACKEND-AGENT

1. Implement rate limiting middleware
2. Set up input validation with Zod schemas
3. Configure JWT with RS256 algorithm
4. Implement webhook signature verification
5. Use parameterized queries only

### For CI-CD-AGENT

1. Add security scanning to pipeline (SAST/DAST)
2. Scan dependencies for vulnerabilities
3. Secret scanning for committed credentials
4. Container image scanning

---

## Summary Checklist

### Pre-Launch Security

- [ ] Firewall rules configured and tested
- [ ] TLS certificates provisioned
- [ ] WAF/rate limiting enabled
- [ ] Authentication implemented with secure defaults
- [ ] Webhook signature verification active
- [ ] Database access restricted to internal only
- [ ] Secrets properly managed (not in code)
- [ ] Input validation on all endpoints
- [ ] Security headers configured
- [ ] Logging and monitoring active

### Ongoing Security

- [ ] Regular dependency updates
- [ ] Quarterly security reviews
- [ ] Annual penetration testing
- [ ] Secret rotation on schedule
- [ ] Incident response drills

---

## Related Documents

- [Network Topology](./audifi-network-topology.md)
- [External Integrations](./audifi-external-integrations.md)
- [Observability](./audifi-observability.md)
