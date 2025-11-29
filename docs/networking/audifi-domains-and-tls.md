# AudiFi Domains, DNS & TLS Configuration

## Overview

This document defines the domain structure, DNS configuration, and TLS/SSL strategy for the AudiFi platform. All services operate under the primary domain `audifi.io`.

---

## Domain Hierarchy

### Production Domains

| Domain | Purpose | Host | Type |
|--------|---------|------|------|
| `audifi.io` | Marketing/landing site | Vercel | Frontend |
| `app.audifi.io` | Main web application | Vercel | Frontend |
| `api.audifi.io` | Public API gateway | Backend Server | API |
| `studio.audifi.io` | V Studio real-time (optional) | Backend Server | WebSocket |
| `status.audifi.io` | Status page (future) | External Service | Monitoring |

### Staging Domains

| Domain | Purpose | Host |
|--------|---------|------|
| `staging.audifi.io` | Staging web app | Vercel Preview |
| `staging-api.audifi.io` | Staging API | Backend Server |

---

## Domain Purpose Details

### `audifi.io`

**Purpose:** Primary landing and marketing  
**Content:**
- Homepage with value proposition
- "How It Works" and educational content
- Pricing information
- Public blog/news
- SEO-optimized landing pages

**Traffic Pattern:** High volume, cacheable static content

---

### `app.audifi.io`

**Purpose:** Authenticated application experience  
**Content:**
- Artist and fan dashboards
- Master IPO creation and management
- V Studio web interface
- Profile and settings
- Marketplace browsing

**Traffic Pattern:** Authenticated users, dynamic content with API calls

---

### `api.audifi.io`

**Purpose:** Backend API gateway  
**Endpoints:**
- REST/GraphQL API (`/v1/*`)
- WebSocket connections (`/ws/*` or `/v1/vstudio/ws`)
- Webhook receivers (`/webhooks/*`)
- Health checks (`/health`)

**Traffic Pattern:** API requests, WebSocket upgrades, webhook POSTs

---

### `studio.audifi.io` (Optional)

**Purpose:** Dedicated V Studio real-time endpoint  
**Rationale:** Separate subdomain allows:
- Independent scaling
- Specialized WebSocket infrastructure
- Isolated monitoring and rate limits

**Alternative:** Route V Studio through `api.audifi.io/ws/vstudio`

---

## DNS Configuration

### DNS Provider Recommendation

**Primary:** Cloudflare  
**Rationale:**
- Fast global DNS propagation
- DDoS protection included
- Easy management UI
- Proxy capabilities (optional)
- Free tier suitable for startup

### DNS Records

#### A/AAAA Records (Backend Server)

```dns
# Replace <SERVER_IP> with actual server IP
# Replace <SERVER_IPV6> with IPv6 if available

api.audifi.io.        A       <SERVER_IP>
api.audifi.io.        AAAA    <SERVER_IPV6>    # Optional

studio.audifi.io.     A       <SERVER_IP>
studio.audifi.io.     AAAA    <SERVER_IPV6>    # Optional
```

#### CNAME Records (Vercel Frontend)

```dns
# Vercel CNAME target: cname.vercel-dns.com

audifi.io.           CNAME    cname.vercel-dns.com.
app.audifi.io.       CNAME    cname.vercel-dns.com.
```

**Note:** For apex domain (`audifi.io`), Vercel may require:
- ALIAS/ANAME record (if DNS provider supports)
- A records pointing to Vercel IPs: `76.76.21.21`

#### Additional Records

```dns
# Email (Example with SendGrid/Gmail)
audifi.io.           MX 10    mx1.sendgrid.net.
audifi.io.           MX 20    mx2.sendgrid.net.

# SPF Record
audifi.io.           TXT      "v=spf1 include:sendgrid.net ~all"

# DKIM (Provider-specific)
# sg._domainkey.audifi.io.  TXT    "<DKIM_KEY>"

# DMARC
_dmarc.audifi.io.    TXT      "v=DMARC1; p=quarantine; rua=mailto:dmarc@audifi.io"

# Domain verification (various services)
# _vercel.audifi.io.  TXT    "<VERCEL_VERIFICATION>"
# _stripe.audifi.io.  TXT    "<STRIPE_VERIFICATION>"
```

### DNS TTL Recommendations

| Record Type | TTL | Rationale |
|-------------|-----|-----------|
| A/AAAA (API) | 300s (5 min) | Allow quick failover |
| CNAME (Frontend) | 3600s (1 hour) | Stable CDN endpoint |
| MX | 3600s | Email routing stability |
| TXT (SPF/DKIM) | 3600s | Rarely changes |

---

## TLS/SSL Strategy

### TLS Termination Points

| Domain | Termination Point | Certificate Provider |
|--------|-------------------|---------------------|
| `audifi.io` | Vercel Edge | Vercel (Let's Encrypt) |
| `app.audifi.io` | Vercel Edge | Vercel (Let's Encrypt) |
| `api.audifi.io` | Caddy (Backend) | Let's Encrypt (auto) |
| `studio.audifi.io` | Caddy (Backend) | Let's Encrypt (auto) |

### Frontend TLS (Vercel)

**Configuration:** Automatic  
- Vercel provisions and renews certificates automatically
- Supports custom domains with zero configuration
- Enforces HTTPS by default

**Setup Steps:**
1. Add domain in Vercel project settings
2. Configure DNS records as specified above
3. Vercel auto-provisions certificate

---

### Backend TLS (Caddy)

**Why Caddy:**
- Automatic HTTPS with Let's Encrypt
- Zero-configuration certificate management
- Automatic renewal (before 30-day expiry)
- HTTP/2 and HTTP/3 support
- Simple configuration syntax

**Certificate Details:**
- Provider: Let's Encrypt
- Type: DV (Domain Validated)
- Renewal: Automatic (60-90 days)
- Storage: `/data/caddy/certificates`

---

### Caddyfile Configuration

```caddyfile
# /etc/caddy/Caddyfile

{
    email admin@audifi.io
    acme_ca https://acme-v02.api.letsencrypt.org/directory
}

# API Gateway
api.audifi.io {
    # Rate limiting
    rate_limit {
        zone api_zone {
            key {remote_host}
            events 100
            window 1m
        }
    }

    # API routes
    handle /v1/* {
        reverse_proxy api-server:3000
    }

    # WebSocket routes
    handle /ws/* {
        reverse_proxy ws-server:3001
    }

    # Webhook routes
    handle /webhooks/* {
        reverse_proxy api-server:3000
    }

    # Health check
    handle /health {
        respond "OK" 200
    }

    # Logging
    log {
        output file /var/log/caddy/api.audifi.io.log
        format json
    }
}

# V Studio dedicated endpoint (optional)
studio.audifi.io {
    # WebSocket-only
    reverse_proxy ws-server:3001

    log {
        output file /var/log/caddy/studio.audifi.io.log
        format json
    }
}

# HTTP to HTTPS redirect (automatic with Caddy)
```

---

## TLS Configuration Best Practices

### Protocol Versions

| Setting | Value |
|---------|-------|
| Minimum TLS Version | 1.2 |
| Preferred TLS Version | 1.3 |
| Cipher Suites | Modern (Caddy defaults) |

### Security Headers (Set by Caddy)

```caddyfile
header {
    # HSTS
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    
    # Prevent MIME sniffing
    X-Content-Type-Options "nosniff"
    
    # XSS Protection
    X-XSS-Protection "1; mode=block"
    
    # Clickjacking protection
    X-Frame-Options "DENY"
    
    # Referrer Policy
    Referrer-Policy "strict-origin-when-cross-origin"
    
    # Remove server identification
    -Server
}
```

### Certificate Monitoring

**Recommended Monitoring:**
1. **External:** Use uptime monitoring (e.g., Better Uptime, Pingdom) with SSL checks
2. **Internal:** Alert if certificate expiry < 14 days
3. **Logging:** Log certificate renewal events

---

## Environment-Specific Domains

### Production

```
audifi.io              → Vercel Production
app.audifi.io          → Vercel Production
api.audifi.io          → Production Server
studio.audifi.io       → Production Server
```

### Staging

```
staging.audifi.io      → Vercel Preview (branch: staging)
staging-api.audifi.io  → Staging Server (or same server, different port)
```

### Development/Preview

```
*.vercel.app           → Vercel Preview Deployments (automatic)
localhost:5173         → Local frontend development
localhost:3000         → Local API development
```

---

## CORS Configuration

### API CORS Headers

```javascript
// Backend CORS configuration
const corsOptions = {
  origin: [
    'https://audifi.io',
    'https://app.audifi.io',
    'https://staging.audifi.io',
    // Vercel preview URLs
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

---

## Domain Migration Checklist

When setting up domains for the first time:

### Pre-Launch

- [ ] Register `audifi.io` domain (if not already)
- [ ] Set up Cloudflare account and add domain
- [ ] Configure nameservers to point to Cloudflare
- [ ] Create all DNS records as specified
- [ ] Wait for DNS propagation (up to 48 hours)

### Vercel Setup

- [ ] Add `audifi.io` to Vercel project
- [ ] Add `app.audifi.io` to Vercel project
- [ ] Verify DNS configuration in Vercel dashboard
- [ ] Confirm SSL certificates are provisioned

### Backend Setup

- [ ] Configure Caddy with domain names
- [ ] Ensure ports 80 and 443 are open
- [ ] Verify Let's Encrypt can reach server (ACME challenge)
- [ ] Confirm certificates are issued
- [ ] Test HTTPS connectivity

### Verification

- [ ] Test `https://audifi.io` loads correctly
- [ ] Test `https://app.audifi.io` loads correctly
- [ ] Test `https://api.audifi.io/health` returns 200
- [ ] Test WebSocket connection to `wss://api.audifi.io/ws/`
- [ ] Run SSL Labs test (https://ssllabs.com/ssltest/)
- [ ] Verify HSTS headers are present

---

## SSL Labs Target Grade

**Target:** A+ rating on SSL Labs

**Requirements for A+:**
- ✅ TLS 1.2 minimum
- ✅ TLS 1.3 supported
- ✅ Modern cipher suites
- ✅ HSTS with long max-age
- ✅ No vulnerabilities (POODLE, Heartbleed, etc.)
- ✅ Certificate chain complete
- ✅ OCSP stapling (Caddy automatic)

---

## Summary

| Component | Domain | Provider | TLS |
|-----------|--------|----------|-----|
| Landing/Marketing | audifi.io | Vercel | Automatic |
| Web App | app.audifi.io | Vercel | Automatic |
| API Gateway | api.audifi.io | Ubuntu Server + Caddy | Let's Encrypt |
| V Studio (optional) | studio.audifi.io | Ubuntu Server + Caddy | Let's Encrypt |

All traffic is encrypted with TLS 1.2+ with automatic certificate provisioning and renewal.

---

## Related Documents

- [Network Topology](./audifi-network-topology.md)
- [Security Alignment](./audifi-security-alignment.md)
- [V Studio Real-Time](./audifi-vstudio-realtime.md)
