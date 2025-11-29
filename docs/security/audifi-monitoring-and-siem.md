# AudiFi Monitoring & SIEM Integration

**Document Version**: 1.0  
**Date**: 2025-01-15  
**Status**: Design Specification

---

## Executive Summary

This document defines the monitoring, logging, and Security Information and Event Management (SIEM) integration strategy for AudiFi, with a focus on Wazuh integration. It covers log sources, formats, alert rules, and operational procedures.

---

## 1. Monitoring Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AudiFi Monitoring Stack                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Log Sources                      Collection            Analysis        │
│  ──────────                       ──────────            ────────        │
│                                                                         │
│  ┌─────────────┐                ┌─────────────┐     ┌─────────────┐    │
│  │ API Server  │───────────────>│   Wazuh     │────>│   Wazuh     │    │
│  │    Logs     │                │   Agent     │     │   Manager   │    │
│  └─────────────┘                └─────────────┘     └──────┬──────┘    │
│                                                            │           │
│  ┌─────────────┐                ┌─────────────┐            │           │
│  │ Auth Events │───────────────>│   Wazuh     │────────────┤           │
│  │    Logs     │                │   Agent     │            │           │
│  └─────────────┘                └─────────────┘            │           │
│                                                            │           │
│  ┌─────────────┐                ┌─────────────┐     ┌──────▼──────┐    │
│  │   System    │───────────────>│   Wazuh     │────>│   Wazuh     │    │
│  │    Logs     │                │   Agent     │     │  Dashboard  │    │
│  └─────────────┘                └─────────────┘     └──────┬──────┘    │
│                                                            │           │
│  ┌─────────────┐                ┌─────────────┐            │           │
│  │ Container   │───────────────>│  Log Driver │────────────┤           │
│  │    Logs     │                │             │            │           │
│  └─────────────┘                └─────────────┘            │           │
│                                                            │           │
│  ┌─────────────┐                                    ┌──────▼──────┐    │
│  │ Blockchain  │───────────────────────────────────>│   Alerts    │    │
│  │   Events    │                                    │  & Actions  │    │
│  └─────────────┘                                    └─────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Log Sources

### 2.1 Application Logs

| Source | Log Type | Priority | Retention |
|--------|----------|----------|-----------|
| API Server | Access, Error, Debug | High | 90 days |
| Auth Service | Login, 2FA, Session | Critical | 1 year |
| Payment Service | Transactions, Webhooks | Critical | 7 years |
| V Studio | Sessions, Voting | High | 90 days |
| Web3 Service | Transactions, Events | High | 1 year |

### 2.2 Security Events to Log

```typescript
// Security event categories

enum SecurityEventCategory {
  // Authentication
  AUTH_LOGIN_SUCCESS = 'auth.login.success',
  AUTH_LOGIN_FAILURE = 'auth.login.failure',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_2FA_ENABLED = 'auth.2fa.enabled',
  AUTH_2FA_DISABLED = 'auth.2fa.disabled',
  AUTH_2FA_FAILURE = 'auth.2fa.failure',
  AUTH_MAGIC_LINK_SENT = 'auth.magic_link.sent',
  AUTH_MAGIC_LINK_USED = 'auth.magic_link.used',
  AUTH_MAGIC_LINK_EXPIRED = 'auth.magic_link.expired',
  AUTH_SESSION_REVOKED = 'auth.session.revoked',
  AUTH_PASSWORD_RESET = 'auth.password.reset',
  
  // Authorization
  AUTHZ_ACCESS_DENIED = 'authz.access.denied',
  AUTHZ_ROLE_CHANGED = 'authz.role.changed',
  AUTHZ_PERMISSION_ADDED = 'authz.permission.added',
  
  // User Actions
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_WALLET_LINKED = 'user.wallet.linked',
  USER_WALLET_UNLINKED = 'user.wallet.unlinked',
  
  // Master IPO
  MASTER_IPO_CREATED = 'master_ipo.created',
  MASTER_IPO_UPDATED = 'master_ipo.updated',
  MASTER_IPO_LAUNCHED = 'master_ipo.launched',
  MASTER_IPO_SOLD = 'master_ipo.sold',
  
  // Financial
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  DIVIDEND_DISTRIBUTED = 'dividend.distributed',
  DIVIDEND_CLAIMED = 'dividend.claimed',
  STRIPE_WEBHOOK_RECEIVED = 'stripe.webhook.received',
  STRIPE_WEBHOOK_INVALID = 'stripe.webhook.invalid',
  
  // V Studio
  VSTUDIO_SESSION_START = 'vstudio.session.start',
  VSTUDIO_SESSION_END = 'vstudio.session.end',
  VSTUDIO_VOTE_CAST = 'vstudio.vote.cast',
  VSTUDIO_ACCESS_GRANTED = 'vstudio.access.granted',
  VSTUDIO_ACCESS_DENIED = 'vstudio.access.denied',
  
  // System
  SYSTEM_CONFIG_CHANGED = 'system.config.changed',
  SYSTEM_MAINTENANCE_START = 'system.maintenance.start',
  SYSTEM_MAINTENANCE_END = 'system.maintenance.end',
  
  // Security Incidents
  SECURITY_RATE_LIMIT_HIT = 'security.rate_limit.hit',
  SECURITY_SUSPICIOUS_ACTIVITY = 'security.suspicious.activity',
  SECURITY_BRUTE_FORCE_DETECTED = 'security.brute_force.detected',
}
```

### 2.3 System Logs

| Source | Path | Content |
|--------|------|---------|
| SSH | `/var/log/auth.log` | SSH access attempts |
| System | `/var/log/syslog` | System events |
| Audit | `/var/log/audit/audit.log` | Audit events |
| Docker | journald/json | Container logs |
| Nginx | `/var/log/nginx/` | Web server access |

---

## 3. Log Format Specification

### 3.1 Standard JSON Log Format

```typescript
interface LogEntry {
  // Required fields
  timestamp: string         // ISO 8601 format
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical'
  message: string           // Human-readable message
  service: string           // Service name (e.g., 'api', 'auth', 'web3')
  
  // Context
  requestId?: string        // Unique request identifier
  traceId?: string          // Distributed tracing ID
  spanId?: string           // Span ID for tracing
  
  // User context (when applicable)
  userId?: string           // User ID (not PII)
  sessionId?: string        // Session identifier
  
  // Request context (when applicable)
  method?: string           // HTTP method
  path?: string             // Request path
  statusCode?: number       // Response status
  durationMs?: number       // Request duration
  
  // Client context (privacy-conscious)
  ipAddress?: string        // Client IP (consider hashing)
  userAgent?: string        // User agent string
  
  // Security context
  securityEvent?: string    // Security event category
  
  // Additional data
  metadata?: Record<string, unknown>
}
```

### 3.2 Example Log Entries

```json
// Successful login
{
  "timestamp": "2025-01-15T14:30:45.123Z",
  "level": "info",
  "message": "User login successful",
  "service": "auth",
  "requestId": "req_abc123",
  "userId": "usr_789xyz",
  "sessionId": "sess_456def",
  "method": "POST",
  "path": "/api/auth/magic-link/verify",
  "statusCode": 200,
  "durationMs": 145,
  "ipAddress": "192.168.1.100",
  "securityEvent": "auth.login.success",
  "metadata": {
    "mfaMethod": "totp",
    "deviceNew": false
  }
}

// Failed 2FA attempt
{
  "timestamp": "2025-01-15T14:31:02.456Z",
  "level": "warn",
  "message": "2FA verification failed",
  "service": "auth",
  "requestId": "req_def456",
  "userId": "usr_789xyz",
  "method": "POST",
  "path": "/api/auth/2fa/verify",
  "statusCode": 401,
  "durationMs": 89,
  "ipAddress": "192.168.1.100",
  "securityEvent": "auth.2fa.failure",
  "metadata": {
    "attemptNumber": 3,
    "mfaMethod": "totp"
  }
}

// Suspicious activity
{
  "timestamp": "2025-01-15T14:32:00.789Z",
  "level": "error",
  "message": "Rate limit exceeded for authentication",
  "service": "auth",
  "ipAddress": "203.0.113.50",
  "securityEvent": "security.rate_limit.hit",
  "metadata": {
    "endpoint": "/api/auth/magic-link",
    "requestCount": 50,
    "windowSeconds": 60
  }
}
```

---

## 4. Wazuh Integration

### 4.1 Agent Configuration

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <client>
    <server>
      <address>wazuh-manager.audifi.internal</address>
      <port>1514</port>
      <protocol>tcp</protocol>
    </server>
  </client>

  <!-- Local file monitoring -->
  <localfile>
    <log_format>json</log_format>
    <location>/var/log/audifi/api.log</location>
  </localfile>

  <localfile>
    <log_format>json</log_format>
    <location>/var/log/audifi/auth.log</location>
  </localfile>

  <localfile>
    <log_format>json</log_format>
    <location>/var/log/audifi/security.log</location>
  </localfile>

  <localfile>
    <log_format>syslog</log_format>
    <location>/var/log/auth.log</location>
  </localfile>

  <!-- File integrity monitoring -->
  <syscheck>
    <frequency>43200</frequency>
    <directories check_all="yes" realtime="yes">/opt/audifi/config</directories>
    <directories check_all="yes" realtime="yes">/etc/audifi</directories>
    <ignore>/opt/audifi/logs</ignore>
  </syscheck>

  <!-- Rootkit detection -->
  <rootcheck>
    <frequency>43200</frequency>
  </rootcheck>

  <!-- Vulnerability detection -->
  <vulnerability-detection>
    <enabled>yes</enabled>
    <interval>12h</interval>
  </vulnerability-detection>
</ossec_config>
```

### 4.2 Custom Decoders

```xml
<!-- /var/ossec/etc/decoders/audifi_decoders.xml -->
<decoder name="audifi-json">
  <prematch>^{"\S+timestamp":</prematch>
</decoder>

<decoder name="audifi-auth">
  <parent>audifi-json</parent>
  <regex offset="after_parent">
    "service":\s*"auth".*"securityEvent":\s*"(\S+)".*"userId":\s*"(\S+)"
  </regex>
  <order>security_event, user_id</order>
</decoder>

<decoder name="audifi-security">
  <parent>audifi-json</parent>
  <regex offset="after_parent">
    "level":\s*"(error|critical)".*"securityEvent":\s*"security\.(\S+)"
  </regex>
  <order>log_level, security_type</order>
</decoder>

<decoder name="audifi-payment">
  <parent>audifi-json</parent>
  <regex offset="after_parent">
    "service":\s*"payment".*"securityEvent":\s*"(\S+)"
  </regex>
  <order>payment_event</order>
</decoder>
```

### 4.3 Custom Rules

```xml
<!-- /var/ossec/etc/rules/audifi_rules.xml -->
<group name="audifi,">

  <!-- Base rule for AudiFi logs -->
  <rule id="100001" level="0">
    <decoded_as>audifi-json</decoded_as>
    <description>AudiFi log entry</description>
  </rule>

  <!-- Authentication Events -->
  <rule id="100100" level="3">
    <if_sid>100001</if_sid>
    <field name="securityEvent">auth.login.success</field>
    <description>AudiFi: Successful user login</description>
    <group>authentication_success,</group>
  </rule>

  <rule id="100101" level="5">
    <if_sid>100001</if_sid>
    <field name="securityEvent">auth.login.failure</field>
    <description>AudiFi: Failed login attempt</description>
    <group>authentication_failed,</group>
  </rule>

  <!-- Multiple failed logins - possible brute force -->
  <rule id="100102" level="10" frequency="5" timeframe="120">
    <if_matched_sid>100101</if_matched_sid>
    <same_source_ip/>
    <description>AudiFi: Multiple failed login attempts from same IP</description>
    <group>authentication_failures,brute_force,</group>
  </rule>

  <!-- Multiple failed logins for same user -->
  <rule id="100103" level="10" frequency="5" timeframe="300">
    <if_matched_sid>100101</if_matched_sid>
    <same_field>user_id</same_field>
    <description>AudiFi: Multiple failed login attempts for same user</description>
    <group>authentication_failures,account_lockout,</group>
  </rule>

  <!-- 2FA Events -->
  <rule id="100110" level="5">
    <if_sid>100001</if_sid>
    <field name="securityEvent">auth.2fa.failure</field>
    <description>AudiFi: Failed 2FA verification</description>
    <group>authentication_failed,</group>
  </rule>

  <rule id="100111" level="10" frequency="3" timeframe="300">
    <if_matched_sid>100110</if_matched_sid>
    <same_field>user_id</same_field>
    <description>AudiFi: Multiple 2FA failures - possible bypass attempt</description>
    <group>authentication_failures,</group>
  </rule>

  <rule id="100112" level="7">
    <if_sid>100001</if_sid>
    <field name="securityEvent">auth.2fa.disabled</field>
    <description>AudiFi: 2FA disabled on account</description>
    <group>policy_changed,</group>
  </rule>

  <!-- Rate Limiting -->
  <rule id="100120" level="8">
    <if_sid>100001</if_sid>
    <field name="securityEvent">security.rate_limit.hit</field>
    <description>AudiFi: Rate limit exceeded</description>
    <group>access_denied,</group>
  </rule>

  <!-- Payment Events -->
  <rule id="100200" level="3">
    <if_sid>100001</if_sid>
    <field name="securityEvent">payment.completed</field>
    <description>AudiFi: Payment completed successfully</description>
    <group>payment,</group>
  </rule>

  <rule id="100201" level="7">
    <if_sid>100001</if_sid>
    <field name="securityEvent">payment.failed</field>
    <description>AudiFi: Payment failed</description>
    <group>payment,</group>
  </rule>

  <rule id="100202" level="10">
    <if_sid>100001</if_sid>
    <field name="securityEvent">stripe.webhook.invalid</field>
    <description>AudiFi: Invalid Stripe webhook received</description>
    <group>payment,web_attack,</group>
  </rule>

  <!-- Master IPO Events -->
  <rule id="100300" level="5">
    <if_sid>100001</if_sid>
    <field name="securityEvent">master_ipo.created</field>
    <description>AudiFi: New Master IPO created</description>
    <group>audifi_ipo,</group>
  </rule>

  <rule id="100301" level="7">
    <if_sid>100001</if_sid>
    <field name="securityEvent">master_ipo.launched</field>
    <description>AudiFi: Master IPO launched</description>
    <group>audifi_ipo,</group>
  </rule>

  <!-- High-value dividend claim -->
  <rule id="100310" level="8">
    <if_sid>100001</if_sid>
    <field name="securityEvent">dividend.claimed</field>
    <field name="metadata.amount" type="pcre2">\d{6,}</field>
    <description>AudiFi: Large dividend claim detected</description>
    <group>audifi_financial,</group>
  </rule>

  <!-- Access Control -->
  <rule id="100400" level="7">
    <if_sid>100001</if_sid>
    <field name="securityEvent">authz.access.denied</field>
    <description>AudiFi: Access denied to resource</description>
    <group>access_denied,</group>
  </rule>

  <rule id="100401" level="9">
    <if_sid>100001</if_sid>
    <field name="securityEvent">authz.role.changed</field>
    <description>AudiFi: User role changed</description>
    <group>policy_changed,</group>
  </rule>

  <!-- Wallet Events -->
  <rule id="100500" level="7">
    <if_sid>100001</if_sid>
    <field name="securityEvent">user.wallet.linked</field>
    <description>AudiFi: Wallet linked to user account</description>
    <group>account_changed,</group>
  </rule>

  <rule id="100501" level="8">
    <if_sid>100001</if_sid>
    <field name="securityEvent">user.wallet.unlinked</field>
    <description>AudiFi: Wallet unlinked from user account</description>
    <group>account_changed,</group>
  </rule>

</group>
```

---

## 5. Alert Conditions

### 5.1 Critical Alerts (Immediate Response)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Multiple failed logins (same IP) | 5 in 2 min | Block IP, notify security |
| 2FA bypass attempts | 3 in 5 min | Lock account, notify user |
| Invalid Stripe webhooks | 3 in 1 min | Block IP, investigate |
| Admin function called | Any | Verify authorization |
| Contract pause triggered | Any | Immediate investigation |
| Large dividend claim | >$10,000 | Manual verification |

### 5.2 High Priority Alerts

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Failed logins for single user | 10 in 1 hour | Notify user, suggest password reset |
| Rate limit exceeded | 10 in 10 min | Temporary IP block |
| Role/permission changes | Any | Log and review |
| New device login | Any | Notify user |
| Wallet link/unlink | Any | Confirm with user |

### 5.3 Medium Priority Alerts

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Error rate spike | >5% | Investigate |
| Response time degradation | >2x baseline | Investigate |
| Failed payments | >5 in 1 hour | Check payment provider |
| Unusual login times | Off-hours for user | Flag for review |

---

## 6. Dashboard Configuration

### 6.1 Security Overview Dashboard

```yaml
# Wazuh Dashboard configuration
dashboards:
  audifi-security-overview:
    title: "AudiFi Security Overview"
    refresh_interval: "30s"
    panels:
      - title: "Authentication Events (24h)"
        type: "pie_chart"
        query: "securityEvent:auth.*"
        breakdown: "securityEvent"

      - title: "Failed Logins by IP"
        type: "table"
        query: "securityEvent:auth.login.failure"
        columns: ["timestamp", "ipAddress", "userId", "count"]

      - title: "Security Alerts"
        type: "timeline"
        query: "level:(error OR critical)"
        
      - title: "Top Blocked IPs"
        type: "bar_chart"
        query: "securityEvent:security.rate_limit.hit"
        aggregation: "ipAddress"

      - title: "Payment Events"
        type: "metrics"
        queries:
          - label: "Successful"
            query: "securityEvent:payment.completed"
          - label: "Failed"
            query: "securityEvent:payment.failed"
          - label: "Invalid Webhooks"
            query: "securityEvent:stripe.webhook.invalid"
```

### 6.2 Key Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| Auth Success Rate | % of successful logins | >99% |
| 2FA Adoption | % of users with 2FA | 100% (mandatory) |
| Mean Time to Detect (MTTD) | Time to detect security events | <5 min |
| Mean Time to Respond (MTTR) | Time to respond to alerts | <30 min (critical) |
| False Positive Rate | % of alerts that are false positives | <10% |

---

## 7. Log Retention and Compliance

### 7.1 Retention Policy

| Log Type | Retention Period | Storage | Encryption |
|----------|------------------|---------|------------|
| Security events | 1 year | Hot 30d, Cold 11mo | AES-256 |
| Authentication logs | 1 year | Hot 30d, Cold 11mo | AES-256 |
| Payment logs | 7 years | Hot 90d, Cold 7yr | AES-256 |
| Application logs | 90 days | Hot 7d, Cold 83d | AES-256 |
| Debug logs | 7 days | Hot only | AES-256 |

### 7.2 Privacy Considerations

```typescript
// Anonymize/hash sensitive data before logging

function anonymizeForLogging(data: LogData): LogData {
  return {
    ...data,
    // Hash IP addresses for logs older than 30 days
    ipAddress: shouldHash(data.timestamp) 
      ? hashIp(data.ipAddress) 
      : data.ipAddress,
    // Never log full email addresses
    email: data.email ? maskEmail(data.email) : undefined,
    // Never log tokens or secrets
    token: undefined,
    password: undefined,
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local.charAt(0)}***@${domain}`
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + SALT).digest('hex').slice(0, 16)
}
```

---

## 8. Implementation TODOs

### Backend Agent

```markdown
TODO: Implement structured logging
- Use Winston or Pino with JSON format
- Include all required fields from LogEntry interface
- Implement log levels appropriately
- Add request ID generation and propagation

TODO: Implement security event logging
- Create SecurityEventLogger service
- Log all events from SecurityEventCategory enum
- Include appropriate metadata for each event type

TODO: Configure log shipping
- Install and configure Wazuh agent
- Configure log file locations
- Set up log rotation
```

### Infrastructure Agent

```markdown
TODO: Deploy Wazuh Manager
- Set up Wazuh manager on dedicated server
- Configure agent enrollment
- Set up TLS for agent communication

TODO: Configure alerting
- Set up email notifications
- Configure Slack/PagerDuty integration
- Define escalation policies

TODO: Set up log storage
- Configure hot/cold storage tiers
- Implement retention policies
- Set up encrypted backups
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Security-Agent | Initial specification |

---

*This document should be reviewed and updated as monitoring requirements evolve.*
