# API Overview

> REST API Reference for AudiFi

## Overview

The AudiFi API provides programmatic access to the platform's functionality. This document covers authentication, common patterns, and endpoint organization.

> **Status:** 🔄 PLANNED - API design phase. Current frontend uses mock APIs.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.audifi.io/v1` |
| Staging | `https://api.staging.audifi.io/v1` |
| Local | `http://localhost:3000/v1` |

---

## Authentication

### Token-Based Auth

All authenticated endpoints require a Bearer token:

```http
GET /v1/user/profile
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtaining Tokens

```http
POST /v1/auth/magic-link
Content-Type: application/json

{
  "email": "artist@example.com"
}
```

Response:
```json
{
  "message": "Magic link sent to email"
}
```

After clicking the link:
```http
POST /v1/auth/verify-magic-link
Content-Type: application/json

{
  "token": "abc123..."
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 900,
  "refreshToken": "set-via-httponly-cookie"
}
```

### Token Refresh

```http
POST /v1/auth/refresh
Cookie: refresh_token=...
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 900
}
```

---

## API Domains

### Authentication & Identity

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/magic-link` | POST | Send magic link email |
| `/auth/verify-magic-link` | POST | Verify magic link token |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/logout` | POST | Invalidate session |
| `/auth/2fa/setup` | POST | Setup 2FA |
| `/auth/2fa/verify` | POST | Verify 2FA code |

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/profile` | GET | Get current user profile |
| `/user/profile` | PUT | Update profile |
| `/user/wallet` | POST | Link wallet address |
| `/user/wallet` | DELETE | Unlink wallet |

### Masters & IPOs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/masters` | GET | List masters (paginated) |
| `/masters` | POST | Register new master |
| `/masters/:id` | GET | Get master details |
| `/masters/:id` | PUT | Update master |
| `/masters/:id/ipo` | POST | Configure IPO |
| `/masters/:id/ipo` | GET | Get IPO configuration |
| `/masters/:id/mint` | POST | Trigger minting |
| `/masters/:id/shares` | GET | List shareholders |

### V Studio

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/vstudio/sessions` | GET | List sessions |
| `/vstudio/sessions` | POST | Create session |
| `/vstudio/sessions/:id` | GET | Get session details |
| `/vstudio/sessions/:id/decisions` | GET | List decision points |
| `/vstudio/sessions/:id/decisions` | POST | Add decision point |
| `/vstudio/sessions/:id/vote` | POST | Cast vote |
| `/vstudio/sessions/:id/lock` | POST | Lock master |

### Marketplace

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/marketplace/listings` | GET | Browse listings |
| `/marketplace/listings/:id` | GET | Get listing details |
| `/marketplace/purchase` | POST | Initiate purchase |

### Portfolio & Holdings

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/portfolio` | GET | Get user's holdings |
| `/portfolio/dividends` | GET | Dividend history |
| `/portfolio/dividends/claim` | POST | Claim dividends |

### Payments & Subscriptions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payments/checkout` | POST | Create checkout session |
| `/subscriptions` | GET | Get subscription status |
| `/subscriptions/cancel` | POST | Cancel subscription |

---

## Request/Response Patterns

### Pagination

```http
GET /v1/masters?page=1&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Filtering

```http
GET /v1/masters?status=LISTED&genre=Electronic&sort=-createdAt
```

### Standard Response

Success:
```json
{
  "data": {
    "id": "master_123",
    "title": "Electric Dreams",
    ...
  }
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "title": "Title is required"
    }
  },
  "requestId": "req_abc123"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `BLOCKCHAIN_ERROR` | 502 | Contract call failed |

---

## Rate Limiting

Limits are applied per IP and per user:

| Scope | Limit |
|-------|-------|
| Global (IP) | 1000 req/min |
| Global (User) | 10000 req/min |
| Auth endpoints | 10 req/min |
| Write endpoints | 100 req/min |

Headers included in response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

---

## WebSocket API

### V Studio Real-Time

Connect to: `wss://ws.audifi.io/vstudio/:sessionId`

Authentication:
```json
{ "type": "auth", "token": "eyJhbGciOi..." }
```

Messages:

```json
// Join session
{ "type": "join" }

// Cast vote
{ "type": "vote", "decisionId": "d1", "choice": "A" }

// Server events
{ "type": "vote_update", "decisionId": "d1", "results": {"A": 50, "B": 30} }
{ "type": "user_joined", "userId": "u1", "displayName": "Fan123" }
{ "type": "decision_closed", "decisionId": "d1", "winner": "A" }
```

---

## SDK (Future)

```typescript
// Planned SDK usage
import { AudiFi } from '@audifi/sdk'

const client = new AudiFi({
  apiKey: 'your-api-key',
})

const masters = await client.masters.list({ status: 'LISTED' })
const session = await client.vstudio.joinSession('session_123')

session.on('vote_update', (data) => {
  console.log('Vote update:', data)
})

await session.vote('decision_1', 'A')
```

---

## OpenAPI Specification

> **Status:** 💡 EXPERIMENTAL

A partial OpenAPI specification is planned at:
- `docs/api/openapi/openapi.yaml`

---

## Status

| Component | Status |
|-----------|--------|
| API Design | 🔄 PLANNED |
| Auth endpoints | 🔄 PLANNED |
| Master endpoints | 🔄 PLANNED |
| V Studio endpoints | 🔄 PLANNED |
| WebSocket API | 🔄 PLANNED |
| OpenAPI spec | 💡 EXPERIMENTAL |

---

## Related Documents

- [Backend Architecture](../architecture/backend.md)
- [Security Overview](../architecture/security-overview.md)
- [Frontend Architecture](../architecture/frontend.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
