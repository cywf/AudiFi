# AudiFi External Integrations & Connectivity

## Overview

This document defines the networking patterns, endpoints, and configuration requirements for all external services that AudiFi integrates with.

---

## Integration Summary

| Category | Service | Direction | Protocol |
|----------|---------|-----------|----------|
| **Blockchain** | Ethereum RPC | Outbound | HTTPS |
| **Blockchain** | Base/Polygon RPC | Outbound | HTTPS |
| **Blockchain** | Solana RPC | Outbound | HTTPS |
| **Blockchain** | Blockchain Indexer | Outbound | HTTPS/GraphQL |
| **Payments** | Stripe API | Outbound | HTTPS |
| **Payments** | Stripe Webhooks | Inbound | HTTPS POST |
| **Email** | SendGrid/Resend | Outbound | HTTPS |
| **Auth** | Google OAuth | Outbound/Redirect | HTTPS |
| **Auth** | Microsoft OAuth | Outbound/Redirect | HTTPS |
| **Streaming** | Twitch API | Outbound | HTTPS/WSS |
| **Streaming** | YouTube API | Outbound | HTTPS |
| **Streaming** | TikTok API | Outbound | HTTPS/WSS |
| **Community** | Discord API | Outbound | HTTPS/WSS |

---

## Blockchain RPC Connectivity

### Overview

AudiFi connects to blockchain networks to:
- Read Master Contract state (ERC-721C)
- Read Dividend Contract balances
- Query Artist Coin (ERC-20) holdings
- Monitor liquidity pool metrics
- Submit transactions (minting, distributions)

### Provider Recommendations

| Network | Primary Provider | Backup Provider |
|---------|-----------------|-----------------|
| Ethereum Mainnet | Alchemy | Infura |
| Base (L2) | Alchemy | QuickNode |
| Polygon | Alchemy | Infura |
| Solana | Helius | QuickNode |

### RPC Endpoint Configuration

```bash
# Environment Variables
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<API_KEY>
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/<API_KEY>
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/<API_KEY>
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<API_KEY>

# Testnet (Development/Staging)
ETHEREUM_RPC_URL_TESTNET=https://eth-sepolia.g.alchemy.com/v2/<API_KEY>
BASE_RPC_URL_TESTNET=https://base-sepolia.g.alchemy.com/v2/<API_KEY>
SOLANA_RPC_URL_TESTNET=https://devnet.helius-rpc.com/?api-key=<API_KEY>
```

### Connection Patterns

```typescript
// Recommended: Use ethers.js or viem with fallback providers
const providers = [
  new JsonRpcProvider(process.env.ETHEREUM_RPC_URL),
  new JsonRpcProvider(process.env.ETHEREUM_RPC_BACKUP_URL)
];

const provider = new FallbackProvider(providers, 1);
```

### Rate Limits & Best Practices

| Provider | Free Tier | Pro Tier |
|----------|-----------|----------|
| Alchemy | 300 CU/s | 660+ CU/s |
| Infura | 100K requests/day | 200K+ requests/day |
| QuickNode | Variable | Dedicated |

**Best Practices:**
- Cache frequently-read data (token balances, contract state)
- Batch RPC calls where possible
- Use websocket subscriptions for real-time events
- Implement exponential backoff for rate limit errors

---

### Blockchain Indexer Integration

**Options:**

1. **The Graph (Subgraph)**
   - GraphQL queries for indexed contract events
   - Self-hosted or hosted service
   
2. **Custom Indexer**
   - Backend service listening to blockchain events
   - Stores processed data in PostgreSQL

**Endpoint Configuration:**

```bash
# The Graph
SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/audifi/master-contracts

# Custom Indexer
INDEXER_URL=http://indexer:3003  # Internal service
```

---

## Stripe Integration

### API Connectivity

**Base URL:** `https://api.stripe.com`

**Required API Calls:**

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/checkout/sessions` | Create subscription checkout |
| `POST /v1/billing_portal/sessions` | Customer portal access |
| `GET /v1/subscriptions/{id}` | Check subscription status |
| `POST /v1/payment_intents` | One-time payments (NFT purchases) |

### Environment Variables

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...           # Server-side only
STRIPE_PUBLISHABLE_KEY=pk_live_...      # Client-side
STRIPE_WEBHOOK_SECRET=whsec_...         # Webhook signature verification

# Test Mode
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
```

### Webhook Configuration

**Endpoint:** `POST https://api.audifi.io/webhooks/stripe`

**Events to Subscribe:**

| Event | Purpose |
|-------|---------|
| `checkout.session.completed` | Subscription created |
| `customer.subscription.updated` | Plan changes |
| `customer.subscription.deleted` | Cancellation |
| `invoice.paid` | Recurring payment success |
| `invoice.payment_failed` | Payment failure |
| `payment_intent.succeeded` | One-time payment success |

**Webhook Implementation:**

```typescript
// Verify Stripe signature
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.rawBody,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);

// Handle events
switch (event.type) {
  case 'checkout.session.completed':
    // Activate subscription
    break;
  case 'invoice.payment_failed':
    // Send retry notification
    break;
}
```

### Security Measures

- ✅ Verify webhook signatures
- ✅ Use HTTPS only
- ✅ Implement idempotency keys
- ✅ Log all webhook events
- ⚠️ Consider IP allowlisting (Stripe IPs vary)

---

## Email Provider Integration

### Recommended Providers

| Provider | API Type | Best For |
|----------|----------|----------|
| **Resend** | REST API | Modern, developer-friendly |
| **SendGrid** | REST API | Enterprise scale |
| **Postmark** | REST API | Transactional reliability |

### API Configuration

```bash
# Resend
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@audifi.io

# SendGrid (alternative)
SENDGRID_API_KEY=SG....
```

### Email Types

| Email | Trigger | Priority |
|-------|---------|----------|
| Magic Link | Login request | Immediate |
| Welcome | Account creation | Immediate |
| Subscription Confirmation | Payment success | Immediate |
| Password Reset | Reset request | Immediate |
| Revenue Report | Weekly/Monthly | Batch |
| Session Reminders | Scheduled session | Scheduled |

### Implementation Example

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'AudiFi <noreply@audifi.io>',
  to: user.email,
  subject: 'Your Magic Link',
  html: `<a href="${magicLinkUrl}">Click to log in</a>`
});
```

---

## OAuth / SSO Integration

### Google OAuth

**Endpoints:**
- Authorization: `https://accounts.google.com/o/oauth2/v2/auth`
- Token: `https://oauth2.googleapis.com/token`
- User Info: `https://www.googleapis.com/oauth2/v3/userinfo`

**Configuration:**

```bash
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://app.audifi.io/auth/callback/google
```

**Callback URLs to Register:**

```
Production:  https://app.audifi.io/auth/callback/google
Staging:     https://staging.audifi.io/auth/callback/google
Development: http://localhost:5173/auth/callback/google
```

### Microsoft OAuth

**Endpoints:**
- Authorization: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
- Token: `https://login.microsoftonline.com/common/oauth2/v2.0/token`

**Configuration:**

```bash
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_REDIRECT_URI=https://app.audifi.io/auth/callback/microsoft
```

### OAuth Security Best Practices

- ✅ Use PKCE for public clients
- ✅ Store tokens securely (HTTP-only cookies or encrypted storage)
- ✅ Implement token refresh flow
- ✅ Validate `state` parameter to prevent CSRF
- ✅ Use short-lived access tokens

---

## Streaming Platform APIs

### Twitch Integration

**API Base:** `https://api.twitch.tv/helix`  
**Chat (IRC):** `wss://irc-ws.chat.twitch.tv:443`

**Use Cases:**
- Fetch stream status
- Connect to chat for V Studio aggregation
- User authentication via Twitch

**Configuration:**

```bash
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
TWITCH_REDIRECT_URI=https://app.audifi.io/auth/callback/twitch
```

**Chat Connection:**

```typescript
const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

ws.onopen = () => {
  ws.send(`PASS oauth:${accessToken}`);
  ws.send(`NICK ${botUsername}`);
  ws.send(`JOIN #${channelName}`);
};

ws.onmessage = (event) => {
  // Parse IRC messages
  // Normalize and publish to Redis
};
```

---

### YouTube Live Integration

**API Base:** `https://www.googleapis.com/youtube/v3`

**Use Cases:**
- Fetch live chat messages
- Get stream details
- Monitor viewer count

**Configuration:**

```bash
YOUTUBE_API_KEY=AIza...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
```

**Chat Polling:**

```typescript
// YouTube requires polling (no WebSocket for chat)
const pollInterval = 5000; // 5 seconds

async function pollChat(liveChatId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/liveChat/messages` +
    `?liveChatId=${liveChatId}&part=snippet,authorDetails` +
    `&key=${process.env.YOUTUBE_API_KEY}`
  );
  return response.json();
}
```

---

### TikTok Integration

**Note:** TikTok Live API access requires partnership approval.

**API Base:** `https://open.tiktokapis.com`

**Configuration:**

```bash
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
```

---

### Discord Integration

**API Base:** `https://discord.com/api/v10`  
**Gateway:** `wss://gateway.discord.gg`

**Use Cases:**
- Community server integration
- Chat aggregation from designated channels
- Bot for announcements

**Configuration:**

```bash
DISCORD_BOT_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_GUILD_ID=...  # AudiFi community server
```

---

## Network-Level Controls

### Egress Rules (Backend → External)

```
ALLOW TCP/443 → *.stripe.com
ALLOW TCP/443 → *.alchemy.com
ALLOW TCP/443 → *.infura.io
ALLOW TCP/443 → api.twitch.tv
ALLOW TCP/443 → irc-ws.chat.twitch.tv
ALLOW TCP/443 → *.googleapis.com
ALLOW TCP/443 → open.tiktokapis.com
ALLOW TCP/443 → discord.com
ALLOW TCP/443 → gateway.discord.gg
ALLOW TCP/443 → api.resend.com (or sendgrid.com)
DENY  ALL     → *  (default deny)
```

### Ingress Rules (External → Backend)

```
ALLOW TCP/443 FROM * → api.audifi.io        # Public API
ALLOW TCP/443 FROM stripe.com → /webhooks/stripe
# Note: Stripe uses dynamic IPs, signature verification is critical
```

### Environment Variable Management

**Required Variables (Backend):**

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/audifi

# Secrets
JWT_SECRET=...
SESSION_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Blockchain
ETHEREUM_RPC_URL=...
BASE_RPC_URL=...
SOLANA_RPC_URL=...

# Email
RESEND_API_KEY=...
EMAIL_FROM=noreply@audifi.io

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Streaming Platforms
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...

# Feature Flags
ENABLE_VSTUDIO=true
ENABLE_SOLANA=false
```

**Best Practices:**
- ✅ Never hardcode secrets
- ✅ Use `.env` for local development (add to `.gitignore`)
- ✅ Use secure secret management in production (Doppler, AWS Secrets Manager, etc.)
- ✅ Rotate secrets regularly
- ✅ Use different credentials for each environment

---

## Connection Health Monitoring

### Health Check Endpoints

```typescript
// /health/external - Check all external dependencies
app.get('/health/external', async (req, res) => {
  const checks = await Promise.allSettled([
    checkStripe(),
    checkDatabase(),
    checkRedis(),
    checkRpc('ethereum'),
    checkEmail()
  ]);

  const status = checks.every(c => c.status === 'fulfilled') 
    ? 'healthy' 
    : 'degraded';

  res.json({ status, checks });
});
```

### Timeout Configuration

| Service | Connect Timeout | Read Timeout |
|---------|-----------------|--------------|
| Stripe API | 5s | 30s |
| Blockchain RPC | 5s | 60s |
| Email API | 5s | 30s |
| OAuth Providers | 5s | 30s |
| Streaming APIs | 5s | 30s |
| WebSocket (Twitch/Discord) | 10s | N/A (persistent) |

---

## Retry Strategies

### Exponential Backoff

```typescript
const retryConfig = {
  maxRetries: 3,
  initialDelay: 1000,   // 1 second
  maxDelay: 30000,      // 30 seconds
  factor: 2,
  jitter: 0.1
};

// Retry delays: 1s, 2s, 4s (with jitter)
```

### Circuit Breaker

```typescript
const circuitConfig = {
  failureThreshold: 5,      // Open after 5 failures
  successThreshold: 3,      // Close after 3 successes
  timeout: 30000            // Reset after 30 seconds
};
```

---

## Summary Table

| Integration | Base URL | Auth Method | Rate Limit Handling |
|-------------|----------|-------------|---------------------|
| Alchemy RPC | `*.g.alchemy.com` | API Key (URL) | Backoff + Cache |
| Stripe | `api.stripe.com` | Bearer Token | Retry-After header |
| Resend | `api.resend.com` | API Key | 429 response |
| Google OAuth | `googleapis.com` | OAuth 2.0 | Token refresh |
| Twitch | `api.twitch.tv` | Bearer Token | Retry-After header |
| YouTube | `googleapis.com` | API Key | Quota per project |
| Discord | `discord.com` | Bot Token | X-RateLimit headers |

---

## Related Documents

- [Network Topology](./audifi-network-topology.md)
- [V Studio Real-Time](./audifi-vstudio-realtime.md)
- [Security Alignment](./audifi-security-alignment.md)
- [Observability](./audifi-observability.md)
