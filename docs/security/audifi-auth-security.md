# AudiFi Authentication & Session Security

**Document Version**: 1.0  
**Date**: 2025-01-15  
**Status**: Design Specification

---

## Executive Summary

This document defines the authentication and session security architecture for AudiFi, including magic link login, mandatory 2FA, optional SSO, and secure session management. The design prioritizes security while maintaining a smooth user experience for artists.

---

## 1. Authentication Architecture Overview

### 1.1 Authentication Methods

| Method | Status | Priority | Use Case |
|--------|--------|----------|----------|
| Magic Links | Required | P0 | Primary passwordless auth |
| TOTP (2FA) | Required | P0 | Mandatory second factor |
| Passkeys (WebAuthn) | Required | P0 | Modern 2FA alternative |
| Google SSO | Optional | P1 | Convenience for Google users |
| Microsoft SSO | Optional | P1 | Convenience for enterprise users |

### 1.2 Authentication Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Email     │────>│ Magic Link  │────>│  2FA Check  │────>│   Session   │
│   Entry     │     │   Sent      │     │  Required   │     │   Created   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  2FA Setup  │ (if not enrolled)
                                        │  Required   │
                                        └─────────────┘
```

---

## 2. Magic Link Authentication

### 2.1 Token Generation

**Requirements**:
- Cryptographically secure random tokens
- URL-safe encoding
- Single-use enforcement
- Short time-to-live (TTL)

**Implementation Specification**:

```typescript
// Token configuration
const MAGIC_LINK_CONFIG = {
  tokenLength: 32,          // 256 bits of entropy
  ttlMinutes: 10,           // 10-minute expiration
  maxAttempts: 3,           // Per email per hour
  rateLimit: {
    perEmail: {
      count: 3,
      windowMinutes: 60
    },
    global: {
      count: 1000,
      windowMinutes: 60
    }
  }
}

// Token data model
interface MagicLinkToken {
  id: string                    // Primary key
  token: string                 // Hashed token (never store raw)
  userId: string                // Associated user
  email: string                 // Email sent to
  createdAt: Date               // For TTL calculation
  expiresAt: Date               // Explicit expiration
  usedAt: Date | null           // Null if unused
  ipAddress: string             // Requesting IP
  userAgent: string             // Browser fingerprint
}

// Token generation (backend)
async function generateMagicLink(email: string, ip: string, userAgent: string): Promise<string> {
  // Rate limiting check
  await checkRateLimit(email, ip)

  // Generate cryptographically secure token
  const rawToken = crypto.randomBytes(32).toString('base64url')

  // Hash before storage
  const hashedToken = await argon2.hash(rawToken)

  // Store in database
  await db.magicLinkTokens.create({
    data: {
      token: hashedToken,
      email,
      expiresAt: new Date(Date.now() + MAGIC_LINK_CONFIG.ttlMinutes * 60 * 1000),
      ipAddress: ip,
      userAgent
    }
  })

  // Return URL for email
  return `${process.env.APP_URL}/auth/magic-link?token=${rawToken}`
}
```

### 2.2 Token Validation

```typescript
async function validateMagicLink(rawToken: string, ip: string): Promise<User | null> {
  // Find all unexpired tokens (we'll verify hash individually)
  const candidateTokens = await db.magicLinkTokens.findMany({
    where: {
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' },
    take: 100  // Limit search space
  })

  // Find matching token by hash verification
  let matchingToken = null
  for (const candidate of candidateTokens) {
    if (await argon2.verify(candidate.token, rawToken)) {
      matchingToken = candidate
      break
    }
  }

  if (!matchingToken) {
    await logSecurityEvent('MAGIC_LINK_INVALID', { ip })
    return null
  }

  // Mark as used immediately (before any other processing)
  await db.magicLinkTokens.update({
    where: { id: matchingToken.id },
    data: { usedAt: new Date() }
  })

  // Return associated user
  return await db.users.findUnique({
    where: { email: matchingToken.email }
  })
}
```

### 2.3 Email Delivery Best Practices

- Use transactional email service (SendGrid, Postmark, etc.)
- Implement SPF, DKIM, and DMARC
- Include clear sender identification
- Warn users about phishing in email footer
- Track delivery and bounce rates

---

## 3. Two-Factor Authentication (2FA)

### 3.1 Mandatory 2FA Enforcement

**Policy**: All users MUST have at least one 2FA method enrolled before accessing protected features.

```typescript
// 2FA enforcement middleware
async function require2FA(req: Request, next: NextFunction) {
  const user = req.user

  if (!user) {
    return redirect('/auth/login')
  }

  const mfaMethods = await db.mfaMethods.findMany({
    where: { userId: user.id, isActive: true }
  })

  if (mfaMethods.length === 0) {
    // Redirect to mandatory 2FA setup
    return redirect('/auth/setup-2fa?required=true')
  }

  // Check if session has completed 2FA
  if (!req.session.mfaVerified) {
    return redirect('/auth/verify-2fa')
  }

  return next()
}
```

### 3.2 TOTP Implementation

**Data Model**:

```typescript
interface MFAMethod {
  id: string
  userId: string
  type: 'totp' | 'passkey'
  name: string                     // User-friendly name
  secret: string                   // Encrypted TOTP secret
  verified: boolean                // Setup completed
  isActive: boolean                // Can be disabled without deletion
  createdAt: Date
  lastUsedAt: Date | null
}

// Encryption requirement
// Secret MUST be encrypted at rest using AES-256-GCM
// Key stored in secure secret management (AWS KMS, etc.)
```

**TOTP Configuration**:

```typescript
const TOTP_CONFIG = {
  issuer: 'AudiFi',
  algorithm: 'SHA1',      // For compatibility
  digits: 6,
  period: 30,             // 30-second window
  window: 1               // Allow 1 period before/after
}

// Generation
import { authenticator } from 'otplib'

async function setupTOTP(userId: string): Promise<{ secret: string, qrCodeUrl: string }> {
  const secret = authenticator.generateSecret()

  // Store encrypted secret (not yet verified)
  await db.mfaMethods.create({
    data: {
      userId,
      type: 'totp',
      name: 'Authenticator App',
      secret: await encrypt(secret),
      verified: false
    }
  })

  const otpauthUrl = authenticator.keyuri(
    userId,
    TOTP_CONFIG.issuer,
    secret
  )

  const qrCodeUrl = await generateQRCode(otpauthUrl)

  return { secret, qrCodeUrl }
}

// Verification
async function verifyTOTP(userId: string, code: string): Promise<boolean> {
  const method = await db.mfaMethods.findFirst({
    where: { userId, type: 'totp', isActive: true }
  })

  if (!method) return false

  const secret = await decrypt(method.secret)
  const isValid = authenticator.check(code, secret)

  if (isValid) {
    await db.mfaMethods.update({
      where: { id: method.id },
      data: { verified: true, lastUsedAt: new Date() }
    })
  }

  return isValid
}
```

### 3.3 Passkey (WebAuthn) Implementation

**Data Model Extension**:

```typescript
interface PasskeyCredential {
  id: string
  mfaMethodId: string
  credentialId: string              // Base64 encoded
  publicKey: string                 // COSE public key
  signCount: number                 // Replay protection
  transports: string[]              // Available transports
  deviceName: string
}
```

**Registration Flow**:

```typescript
// Backend: Generate registration options
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'

async function startPasskeyRegistration(userId: string): Promise<RegistrationOptions> {
  const user = await db.users.findUnique({ where: { id: userId } })

  const options = await generateRegistrationOptions({
    rpName: 'AudiFi',
    rpID: 'audifi.io',
    userID: userId,
    userName: user.email,
    userDisplayName: user.name,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred'
    }
  })

  // Store challenge for verification
  await setSessionChallenge(userId, options.challenge)

  return options
}

// Frontend: Create credential
const credential = await navigator.credentials.create({
  publicKey: registrationOptions
})
```

### 3.4 Backup Codes

```typescript
interface BackupCodes {
  userId: string
  codes: string[]           // Hashed codes
  generatedAt: Date
  usedCodes: string[]       // Track which are used
}

async function generateBackupCodes(userId: string): Promise<string[]> {
  const codes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  )

  // Hash all codes before storage
  const hashedCodes = await Promise.all(
    codes.map(code => bcrypt.hash(code, 10))
  )

  await db.backupCodes.upsert({
    where: { userId },
    create: {
      userId,
      codes: hashedCodes,
      generatedAt: new Date()
    },
    update: {
      codes: hashedCodes,
      generatedAt: new Date(),
      usedCodes: []
    }
  })

  // Return raw codes ONCE for user to save
  return codes
}
```

### 3.5 Lockout Policy

```typescript
const LOCKOUT_POLICY = {
  maxAttempts: 5,
  lockoutDuration: 30 * 60 * 1000,  // 30 minutes
  escalatingLockout: true
}

async function handle2FAAttempt(userId: string, success: boolean): Promise<void> {
  if (success) {
    await db.loginAttempts.deleteMany({ where: { userId } })
    return
  }

  const attempt = await db.loginAttempts.create({
    data: { userId, attemptedAt: new Date() }
  })

  const recentAttempts = await db.loginAttempts.count({
    where: {
      userId,
      attemptedAt: {
        gt: new Date(Date.now() - LOCKOUT_POLICY.lockoutDuration)
      }
    }
  })

  if (recentAttempts >= LOCKOUT_POLICY.maxAttempts) {
    await db.users.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + LOCKOUT_POLICY.lockoutDuration)
      }
    })

    await sendLockoutNotification(userId)
  }
}
```

---

## 4. SSO Integration

### 4.1 Google OAuth Configuration

```typescript
const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  scopes: ['openid', 'email'],  // Minimal scopes only
  redirectUri: `${process.env.APP_URL}/auth/google/callback`
}

// State parameter for CSRF protection
async function initiateGoogleAuth(): Promise<string> {
  const state = crypto.randomUUID()
  await session.set('oauth_state', state)

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', GOOGLE_OAUTH_CONFIG.clientId)
  url.searchParams.set('redirect_uri', GOOGLE_OAUTH_CONFIG.redirectUri)
  url.searchParams.set('scope', GOOGLE_OAUTH_CONFIG.scopes.join(' '))
  url.searchParams.set('state', state)
  url.searchParams.set('response_type', 'code')

  return url.toString()
}
```

### 4.2 Microsoft OAuth Configuration

```typescript
const MICROSOFT_OAUTH_CONFIG = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  scopes: ['openid', 'email'],  // Minimal scopes only
  redirectUri: `${process.env.APP_URL}/auth/microsoft/callback`,
  tenant: 'common'  // Or specific tenant for enterprise
}
```

### 4.3 SSO Account Linking

```typescript
// Link SSO identity to existing account
async function linkSSOIdentity(
  userId: string,
  provider: 'google' | 'microsoft',
  providerUserId: string,
  email: string
): Promise<void> {
  // Verify email matches or user confirms
  const user = await db.users.findUnique({ where: { id: userId } })

  if (user.email !== email) {
    // Require additional verification
    throw new SecurityError('Email mismatch - additional verification required')
  }

  await db.ssoIdentities.create({
    data: {
      userId,
      provider,
      providerUserId,
      linkedAt: new Date()
    }
  })
}
```

---

## 5. Session Management

### 5.1 Session Token Configuration

```typescript
const SESSION_CONFIG = {
  cookieName: 'audifi_session',
  cookieOptions: {
    httpOnly: true,           // Not accessible via JavaScript
    secure: true,             // HTTPS only
    sameSite: 'lax',          // CSRF protection
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  },
  accessTokenTTL: 15 * 60,    // 15 minutes
  refreshTokenTTL: 7 * 24 * 60 * 60  // 7 days
}
```

### 5.2 Token Structure

```typescript
interface SessionTokens {
  accessToken: string         // Short-lived JWT
  refreshToken: string        // Long-lived, stored in HttpOnly cookie
}

interface AccessTokenPayload {
  sub: string                 // User ID
  email: string
  mfaVerified: boolean
  iat: number                 // Issued at
  exp: number                 // Expiration
}
```

### 5.3 Session Refresh Flow

```typescript
async function refreshSession(refreshToken: string): Promise<SessionTokens | null> {
  // Verify refresh token
  const storedToken = await db.refreshTokens.findUnique({
    where: { token: hashToken(refreshToken) }
  })

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return null
  }

  // Rotate refresh token (invalidate old one)
  await db.refreshTokens.delete({ where: { id: storedToken.id } })

  // Generate new tokens
  const newAccessToken = generateAccessToken(storedToken.userId)
  const newRefreshToken = await generateRefreshToken(storedToken.userId)

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }
}
```

### 5.4 Session Revocation

```typescript
// Logout from current device
async function logout(userId: string, sessionId: string): Promise<void> {
  await db.refreshTokens.delete({
    where: { id: sessionId, userId }
  })
}

// Logout from all devices (security measure)
async function logoutAll(userId: string): Promise<void> {
  await db.refreshTokens.deleteMany({
    where: { userId }
  })

  await logSecurityEvent('LOGOUT_ALL_DEVICES', { userId })
}
```

---

## 6. Frontend Token Handling

### 6.1 Recommended Patterns

```typescript
// DO: Store access token in memory only
let accessToken: string | null = null

// DO: Let the browser handle refresh token in HttpOnly cookie
// DO: Implement automatic token refresh
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  if (!accessToken) {
    accessToken = await refreshAccessToken()
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',  // Include cookies
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (response.status === 401) {
    // Token expired, try refresh
    accessToken = await refreshAccessToken()
    if (accessToken) {
      return fetchWithAuth(url, options)  // Retry once
    }
    // Redirect to login
    window.location.href = '/auth/login'
  }

  return response
}
```

### 6.2 Anti-Patterns to Avoid

```typescript
// DON'T: Store tokens in localStorage
localStorage.setItem('token', accessToken)  // ❌ XSS vulnerable

// DON'T: Store tokens in sessionStorage for long periods
sessionStorage.setItem('refreshToken', token)  // ❌ Still XSS vulnerable

// DON'T: Include tokens in URLs
fetch(`/api/data?token=${accessToken}`)  // ❌ Logged in browser history, referer headers

// DON'T: Store sensitive data in JWT payload
// JWTs are only signed, not encrypted - anyone can read the payload
```

---

## 7. TODO Items for Implementation

### Backend Agent

```markdown
TODO: Implement magic link generation and validation
- Use argon2 for token hashing
- Implement rate limiting
- Add security event logging

TODO: Implement TOTP 2FA
- Use otplib library
- Encrypt secrets at rest with AES-256-GCM
- Implement backup codes

TODO: Implement passkey/WebAuthn support
- Use @simplewebauthn/server library
- Store credential metadata securely

TODO: Implement session management
- Use HttpOnly cookies for refresh tokens
- Implement token rotation
- Add session revocation endpoints
```

### Frontend Agent

```markdown
TODO: Remove localStorage usage for auth data
- Migrate to memory-only access token storage
- Rely on HttpOnly cookies for refresh tokens

TODO: Implement proper token refresh flow
- Automatic refresh before expiration
- Handle refresh failures gracefully

TODO: Update 2FA setup flow
- Generate QR codes locally (no external service)
- Implement passkey enrollment UI
```

### Database Agent

```markdown
TODO: Create schema for auth tables
- magic_link_tokens (encrypted)
- mfa_methods (encrypted secrets)
- passkey_credentials
- refresh_tokens
- login_attempts
- security_events
```

---

## 8. Security Considerations

### 8.1 Timing Attack Prevention

```typescript
// Use constant-time comparison for all token validation
import { timingSafeEqual } from 'crypto'

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)

  if (bufA.length !== bufB.length) {
    // Still do comparison to prevent timing leak
    timingSafeEqual(bufA, bufA)
    return false
  }

  return timingSafeEqual(bufA, bufB)
}
```

### 8.2 Rate Limiting Strategy

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| Magic link request | 3/email | 1 hour |
| Magic link validation | 10/IP | 1 hour |
| 2FA verification | 5/user | 30 min |
| Login attempt | 10/IP | 15 min |
| Token refresh | 60/user | 1 hour |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Security-Agent | Initial specification |

---

*This document should be reviewed and updated as authentication requirements evolve.*
