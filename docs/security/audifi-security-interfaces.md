# AudiFi Security Interfaces - Agent Collaboration Guidelines

**Document Version**: 1.0  
**Date**: 2025-01-15  
**Status**: Active

---

## Executive Summary

This document defines the security expectations, guardrails, and interfaces between the Security-Agent and other collaborating agents in the AudiFi development ecosystem. Each section outlines specific security requirements that must be followed.

---

## 1. Backend-Agent Security Requirements

### 1.1 Authentication & Authorization Middleware

**Requirement**: All sensitive endpoints MUST have authentication and authorization middleware.

```typescript
// Required middleware stack for protected endpoints
app.use('/api/v1/master-ipo/*', [
  authenticateToken,      // Verify JWT/session
  require2FA,             // Ensure 2FA completed
  authorizeResource,      // Check resource ownership/permissions
  rateLimit,              // Prevent abuse
  auditLog                // Log all access
])
```

**Protected Endpoint Categories**:

| Category | Endpoints | Auth Level |
|----------|-----------|------------|
| Master IPO | `/api/v1/master-ipo/*` | User + 2FA + Ownership |
| Revenue | `/api/v1/revenue/*` | User + 2FA + Admin |
| V Studio | `/api/v1/vstudio/*` | User + 2FA + Access |
| User Settings | `/api/v1/user/settings/*` | User + 2FA |
| Payments | `/api/v1/payments/*` | User + 2FA |
| Admin | `/api/v1/admin/*` | Admin + 2FA |

### 1.2 Input Validation Requirements

**Requirement**: All API inputs MUST be validated using a schema validation library (Zod recommended).

```typescript
// Example: Master IPO creation validation
import { z } from 'zod'

const CreateMasterIPOSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .regex(/^[^<>]*$/, 'Invalid characters'),
  
  description: z.string()
    .max(5000, 'Description too long')
    .transform(sanitizeHtml),  // Sanitize HTML
  
  royaltyPercent: z.number()
    .min(0, 'Cannot be negative')
    .max(25, 'Maximum 25%')
    .multipleOf(0.01, 'Max 2 decimal places'),
  
  totalShares: z.number()
    .int('Must be integer')
    .min(1, 'At least 1 share')
    .max(10000, 'Maximum 10,000 shares'),
  
  pricePerShare: z.number()
    .positive('Must be positive')
    .max(1000000, 'Price too high'),
  
  walletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
})

// Usage in controller
async function createMasterIPO(req: Request) {
  const validated = CreateMasterIPOSchema.parse(req.body)
  // Safe to use validated data
}
```

### 1.3 Secret & Configuration Handling

**Requirement**: All secrets MUST come from environment variables or a secret management service.

```typescript
// DO: Use environment variables
const config = {
  database: {
    url: process.env.DATABASE_URL,
    password: process.env.DB_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  }
}

// DON'T: Hard-code secrets
const BAD_CONFIG = {
  jwtSecret: 'hardcoded-secret-123'  // ❌ NEVER DO THIS
}

// Validate required environment variables on startup
function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
}
```

### 1.4 Error Handling

**Requirement**: Errors MUST be sanitized before being returned to clients.

```typescript
// Error handling middleware
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log full error internally
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path
  })
  
  // Return sanitized error to client
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors  // Only validation-specific details
    })
  }
  
  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      error: 'Authentication required'
      // DON'T reveal why auth failed
    })
  }
  
  // Generic error for production
  return res.status(500).json({
    error: 'Internal server error',
    requestId: req.id  // For support reference
    // DON'T include stack trace or internal details
  })
}
```

### 1.5 Database Security

**Requirement**: Use parameterized queries and follow least-privilege access.

```typescript
// DO: Use parameterized queries (ORM or prepared statements)
const user = await prisma.user.findUnique({
  where: { id: userId }
})

// DON'T: String concatenation
const BAD = `SELECT * FROM users WHERE id = '${userId}'`  // ❌ SQL injection

// Mark sensitive fields
model User {
  id            String   @id
  email         String   @unique
  passwordHash  String   // @db.SecureText (if supported)
  totpSecret    String?  // @db.Encrypted
}
```

---

## 2. Frontend-Agent Security Requirements

### 2.1 Token Handling

**Requirement**: Long-lived tokens MUST NOT be stored in localStorage or sessionStorage.

```typescript
// DO: Keep access token in memory only
let accessToken: string | null = null

// DO: Use HttpOnly cookies for refresh tokens (set by backend)
// The frontend never touches the refresh token directly

// DON'T: Store in localStorage
localStorage.setItem('token', token)  // ❌ XSS vulnerable

// Token refresh pattern
async function getAccessToken(): Promise<string | null> {
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken
  }
  
  // Call refresh endpoint (cookie sent automatically)
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'  // Include cookies
  })
  
  if (response.ok) {
    const data = await response.json()
    accessToken = data.accessToken
    return accessToken
  }
  
  return null  // Redirect to login
}
```

### 2.2 XSS Prevention

**Requirement**: All user-generated content MUST be sanitized before rendering.

```typescript
// DO: Use React's built-in escaping for text content
function TrackDescription({ description }: { description: string }) {
  return <p>{description}</p>  // React escapes by default
}

// DO: Sanitize when using dangerouslySetInnerHTML
import DOMPurify from 'dompurify'

function RichContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  })
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}

// DON'T: Render unsanitized HTML
function BAD({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />  // ❌ XSS
}

// Chat message sanitization
function ChatMessage({ message }: { message: string }) {
  // Escape, then linkify
  const escaped = escapeHtml(message)
  const linkified = linkifyUrls(escaped, {
    attributes: {
      target: '_blank',
      rel: 'noopener noreferrer'
    }
  })
  
  return <span dangerouslySetInnerHTML={{ __html: linkified }} />
}
```

### 2.3 Wallet Interaction Security

**Requirement**: All transaction signing MUST have clear, accurate prompts.

```typescript
// DO: Clear transaction descriptions
async function purchaseNFT(trackId: string, price: bigint) {
  const description = `Purchase NFT Track #${trackId} for ${formatEther(price)} ETH`
  
  // Show confirmation modal with full details
  const confirmed = await showConfirmation({
    title: 'Confirm Purchase',
    description,
    details: [
      { label: 'Track ID', value: trackId },
      { label: 'Price', value: `${formatEther(price)} ETH` },
      { label: 'Gas Estimate', value: `~${gasEstimate} ETH` },
      { label: 'Total', value: `~${total} ETH` }
    ],
    warnings: [
      'This transaction is irreversible',
      'Verify the contract address before signing'
    ]
  })
  
  if (!confirmed) return
  
  // Proceed with transaction
}

// DON'T: Vague or misleading prompts
async function BAD_purchaseNFT() {
  await contract.buy()  // ❌ No user confirmation or details
}
```

### 2.4 Content Security Policy

**Requirement**: Deploy with strict CSP headers.

```typescript
// Recommended CSP for AudiFi
const csp = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Add trusted CDNs only if necessary
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'"  // Required for many UI libraries
  ],
  'img-src': [
    "'self'",
    'data:',
    'https://images.unsplash.com',  // If using Unsplash
    'https://ipfs.io',              // For IPFS content
  ],
  'connect-src': [
    "'self'",
    'https://api.audifi.io',
    'https://eth-mainnet.g.alchemy.com',  // RPC provider
    'wss://eth-mainnet.g.alchemy.com',
  ],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
}
```

---

## 3. Database-Agent Security Requirements

### 3.1 Sensitive Field Encryption

**Requirement**: Specific fields MUST be encrypted at rest.

```typescript
// Fields requiring encryption
const ENCRYPTED_FIELDS = {
  // Authentication
  'magic_link_tokens.token': 'AES-256-GCM',
  'mfa_methods.secret': 'AES-256-GCM',
  'backup_codes.codes': 'AES-256-GCM',
  
  // Billing (if storing payment details)
  'payment_methods.last_four': 'AES-256-GCM',  // Consider not storing
  
  // User PII
  'users.phone': 'AES-256-GCM',  // If collected
}

// Encryption key management
// Keys MUST be stored in a secure key management service (AWS KMS, HashiCorp Vault)
// Keys MUST NOT be stored in the database or application code
```

### 3.2 Audit Logging

**Requirement**: Security-relevant database changes MUST be logged.

```typescript
// Events requiring audit logs
const AUDITABLE_EVENTS = [
  // Role and permission changes
  'user.role.updated',
  'user.permission.granted',
  'user.permission.revoked',
  
  // Master IPO configuration
  'master_ipo.created',
  'master_ipo.royalty.updated',
  'master_ipo.wallet.updated',
  'master_ipo.deleted',
  
  // Payout configuration
  'dividend_config.created',
  'dividend_config.updated',
  'payout.executed',
  
  // Sensitive user actions
  'user.2fa.enabled',
  'user.2fa.disabled',
  'user.wallet.linked',
  'user.wallet.unlinked',
  'user.deleted',
]

// Audit log schema
interface AuditLog {
  id: string
  timestamp: Date
  eventType: string
  actorId: string           // Who made the change
  actorIp: string
  targetId: string          // What was changed
  targetType: string
  previousValue: object     // For comparison
  newValue: object
  metadata: object
}
```

### 3.3 Data Retention

**Requirement**: Implement data retention policies per data type.

| Data Type | Retention | Action on Expiry |
|-----------|-----------|------------------|
| Magic link tokens | 24 hours | Hard delete |
| Session tokens | 30 days (inactive) | Hard delete |
| Audit logs | 7 years | Archive to cold storage |
| User data | Account lifetime + 90 days | Anonymize or delete |
| Payment records | 7 years | Retain (regulatory) |
| V Studio messages | 1 year | Archive or delete |

---

## 4. Networking-Agent Security Requirements

### 4.1 Network Segmentation

**Requirement**: Implement strict network zones.

```yaml
# Network zones
zones:
  public:
    description: "Internet-facing services"
    services:
      - load_balancer
      - cdn
    allowed_inbound:
      - 0.0.0.0/0:443
      - 0.0.0.0/0:80
  
  api:
    description: "API servers"
    services:
      - api_server
      - auth_server
    allowed_inbound:
      - public:*  # From load balancer only
    allowed_outbound:
      - data:5432
      - data:6379
  
  data:
    description: "Databases and caches"
    services:
      - postgresql
      - redis
    allowed_inbound:
      - api:*
    allowed_outbound: []  # No outbound
  
  internal:
    description: "Internal services"
    services:
      - wazuh_agent
      - monitoring
    allowed_inbound:
      - api:*
    allowed_outbound:
      - wazuh_manager:1514
```

### 4.2 WAF Rules

**Requirement**: Deploy Web Application Firewall with these minimum rules.

```yaml
waf_rules:
  # Rate limiting
  - name: "API rate limit"
    type: rate_limit
    path: /api/*
    limit: 100
    window: 60s
    action: block
  
  - name: "Auth rate limit"
    type: rate_limit
    path: /api/auth/*
    limit: 10
    window: 60s
    action: block
  
  # Input validation
  - name: "SQL injection"
    type: owasp
    ruleset: sql_injection
    action: block
  
  - name: "XSS prevention"
    type: owasp
    ruleset: xss
    action: block
  
  # Bot protection
  - name: "Bot detection"
    type: bot_protection
    action: challenge
    exclude:
      - /api/health
      - /api/webhooks/stripe
```

### 4.3 Endpoint Documentation

**Requirement**: Document public vs private endpoint access.

| Endpoint | Access | IP Restriction |
|----------|--------|----------------|
| `/*` (frontend) | Public | None |
| `/api/auth/*` | Public | Rate limited |
| `/api/webhooks/stripe` | Public | Stripe IPs only |
| `/api/v1/*` | Authenticated | None |
| `/api/admin/*` | Admin only | VPN/Office IPs |
| `/metrics` | Internal | Internal network only |
| `/health` | Public | None |

---

## 5. CI-CD-Agent Security Requirements

### 5.1 Secret Management

**Requirement**: CI/CD pipelines MUST NOT contain hardcoded secrets.

```yaml
# GitHub Actions example
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # DO: Use GitHub Secrets
      - name: Deploy
        env:
          API_KEY: ${{ secrets.DEPLOY_API_KEY }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: ./deploy.sh
      
      # DON'T: Hardcode secrets
      # env:
      #   API_KEY: "hardcoded-key"  # ❌ NEVER
```

### 5.2 Security Gates

**Requirement**: Implement these security checks in CI pipeline.

```yaml
# Required security checks
security_gates:
  # Static analysis
  - name: "ESLint security rules"
    tool: eslint
    config: eslint-plugin-security
    block_on: error
  
  - name: "Semgrep SAST"
    tool: semgrep
    rulesets:
      - p/owasp-top-ten
      - p/typescript
    block_on: error
  
  # Dependency scanning
  - name: "npm audit"
    tool: npm-audit
    block_on: high
  
  - name: "Snyk"
    tool: snyk
    block_on: high
  
  # Secret scanning
  - name: "GitLeaks"
    tool: gitleaks
    block_on: any
  
  # License compliance
  - name: "License check"
    tool: license-checker
    block_on: copyleft  # Depending on project needs
```

### 5.3 Contract Deployment Requirements

**Requirement**: Smart contract deployments MUST require approval.

```yaml
# Contract deployment workflow
name: Deploy Contracts

on:
  workflow_dispatch:
    inputs:
      network:
        description: 'Network to deploy to'
        required: true
        type: choice
        options:
          - testnet
          - mainnet
      contract:
        description: 'Contract to deploy'
        required: true

jobs:
  review:
    if: github.event.inputs.network == 'mainnet'
    environment: mainnet-deployment
    # Requires manual approval in GitHub
    runs-on: ubuntu-latest
    steps:
      - name: Require approvals
        run: echo "Deployment approved"

  deploy:
    needs: [review]
    runs-on: ubuntu-latest
    steps:
      # Verify bytecode matches audited code
      - name: Verify bytecode
        run: ./scripts/verify-bytecode.sh
      
      # Deploy with multi-sig if possible
      - name: Deploy
        run: ./scripts/deploy.sh
        env:
          NETWORK: ${{ inputs.network }}
```

---

## 6. Integration Checklist

### 6.1 Pre-Integration Review

Before any agent integrates security-relevant code:

- [ ] Security requirements from this document reviewed
- [ ] Threat model scenarios considered
- [ ] Security-Agent consulted for edge cases
- [ ] Implementation follows patterns in this document

### 6.2 Post-Integration Verification

After integration:

- [ ] Security-Agent review of changes
- [ ] SAST scan passes
- [ ] Dependency scan passes
- [ ] Penetration testing (if applicable)
- [ ] Documentation updated

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Security-Agent | Initial document |

---

*This document should be reviewed and updated as agent responsibilities evolve.*
