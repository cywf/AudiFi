# AudiFi Data Governance

**Document Version**: 1.0  
**Last Updated**: 2024-12

---

## Overview

This document defines data governance policies for the AudiFi platform, covering data lifecycle management, privacy compliance, backup strategies, and security controls.

---

## 1. Data Classification

### 1.1 Classification Levels

| Level | Description | Examples | Retention |
|-------|-------------|----------|-----------|
| **Public** | Freely available | Master titles, artist names | Permanent |
| **Internal** | Platform operations | Aggregated analytics | 2 years |
| **Confidential** | Business-sensitive | Revenue details, IPO configs | 7 years |
| **Restricted** | Highly sensitive | PII, payment data | Regulatory |
| **On-Chain** | Blockchain data | Token ownership, transfers | Permanent (mirrored) |

### 1.2 Classification by Table

| Table | Classification | Notes |
|-------|----------------|-------|
| `users` | Restricted | Contains PII (email) |
| `accounts` | Restricted | Auth tokens |
| `artists` | Confidential | Public profile + internal data |
| `masters` | Confidential | Metadata may be public |
| `master_nfts` | On-Chain | Ownership is blockchain-authoritative |
| `revenue_events` | Confidential | Financial data |
| `subscriptions` | Confidential | Payment relationship |
| `invoices` | Confidential | Financial records |
| `audit_logs` | Restricted | Security-relevant |
| `security_events` | Restricted | Security-relevant |

---

## 2. Data Retention Policies

### 2.1 Retention Schedule

| Data Category | Retention Period | After Expiry |
|---------------|------------------|--------------|
| User account data | Account lifetime + 30 days | Anonymize/delete |
| Financial records | 7 years | Archive then delete |
| Audit logs | 3 years | Archive to cold storage |
| Security events | 1 year active, 3 years archive | Delete |
| V Studio engagement events | 90 days detailed, 2 years aggregated | Aggregate then delete |
| Blockchain mirrors | Permanent | N/A (on-chain authoritative) |
| System logs | 30 days | Rotate/delete |

### 2.2 Implementation

```sql
-- Example: Archive old engagement events
CREATE TABLE vstudio_engagement_events_archive (
  LIKE vstudio_engagement_events INCLUDING ALL
);

-- Move old events
INSERT INTO vstudio_engagement_events_archive
SELECT * FROM vstudio_engagement_events
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM vstudio_engagement_events
WHERE created_at < NOW() - INTERVAL '90 days';
```

### 2.3 On-Chain Data

**Important**: Blockchain data is immutable. Our retention policies apply only to the off-chain mirror. If on-chain data exists, our mirror should reflect it (even after account deletion).

---

## 3. Privacy & Right to Delete

### 3.1 GDPR/CCPA Compliance

AudiFi supports user data deletion requests with the following considerations:

1. **Deletable Data**: Email, profile information, voting history (off-chain)
2. **Non-Deletable Data**: On-chain transactions, wallet associations visible on blockchain
3. **Anonymizable Data**: Audit logs (replace user ID with hash)

### 3.2 Deletion Process

```typescript
async function handleDeletionRequest(userId: string): Promise<void> {
  // 1. Verify identity
  await verifyDeletionRequest(userId);
  
  // 2. Export user data (GDPR data portability)
  const exportData = await exportUserData(userId);
  await sendDataExport(userId, exportData);
  
  // 3. Anonymize audit/security logs
  await db.update(auditLogs)
    .set({
      actorIdentifier: 'DELETED_USER',
      metadata: sql`metadata - 'email'`,
    })
    .where(eq(auditLogs.userId, userId));
  
  // 4. Delete user data
  await db.delete(users).where(eq(users.id, userId));
  // Cascades to: accounts, user_roles, user_wallets, subscriptions, etc.
  
  // 5. Log deletion (anonymized)
  await logAuditEvent({
    action: 'user_deletion',
    actorType: 'system',
    metadata: { anonymizedId: hash(userId) },
  });
}
```

### 3.3 Soft Deletes

For certain tables, use soft deletes to maintain referential integrity:

```sql
-- Users table has deleted_at column
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Soft delete instead of hard delete
UPDATE users SET deleted_at = NOW(), status = 'deleted' WHERE id = ?;
```

### 3.4 Data Subject Access Requests (DSAR)

```typescript
async function handleDataAccessRequest(userId: string): Promise<UserDataExport> {
  return {
    profile: await db.query.users.findFirst({ where: eq(users.id, userId) }),
    wallets: await db.query.userWallets.findMany({ where: eq(userWallets.userId, userId) }),
    subscriptions: await db.query.subscriptions.findMany({ where: eq(subscriptions.userId, userId) }),
    masters: await getMastersForArtist(userId),
    vstudioVotes: await db.query.vstudioVotes.findMany({ where: eq(vstudioVotes.userId, userId) }),
    auditLogs: await getAuditLogsForUser(userId),
    exportedAt: new Date(),
  };
}
```

---

## 4. Backup & Recovery

### 4.1 Backup Strategy

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Full backup | Daily | 30 days | Cross-region S3/GCS |
| Incremental | Every 6 hours | 7 days | Same region |
| WAL archiving | Continuous | 7 days | Cross-region |
| Logical export | Weekly | 90 days | Cold storage |

### 4.2 Recovery Objectives

| Metric | Target | Notes |
|--------|--------|-------|
| RPO (Recovery Point Objective) | < 1 hour | Maximum data loss acceptable |
| RTO (Recovery Time Objective) | < 4 hours | Time to restore service |

### 4.3 Backup Implementation

For managed PostgreSQL (AWS RDS, Supabase, Neon):
- Enable automated backups
- Configure cross-region replication
- Set up point-in-time recovery

For self-managed:
```bash
# Daily full backup
pg_dump -Fc audifi_prod > /backups/audifi_$(date +%Y%m%d).dump

# Continuous WAL archiving
archive_command = 'aws s3 cp %p s3://audifi-wal-archive/%f'
```

### 4.4 Recovery Testing

- **Monthly**: Restore to test environment from backup
- **Quarterly**: Full disaster recovery drill
- **Document**: Recovery runbooks and playbooks

---

## 5. Access Control

### 5.1 Database Roles

| Role | Access Level | Use Case |
|------|--------------|----------|
| `audifi_app` | Read/write operational tables | Application backend |
| `audifi_indexer` | Read/write blockchain mirrors | Blockchain indexer |
| `audifi_analytics` | Read-only all tables | Analytics/BI |
| `audifi_admin` | Full access | Database administration |
| `audifi_support` | Read limited PII | Customer support |

### 5.2 Row-Level Security (Optional)

For multi-tenant scenarios or additional isolation:

```sql
-- Enable RLS
ALTER TABLE masters ENABLE ROW LEVEL SECURITY;

-- Artists can only see their own masters
CREATE POLICY artist_masters_policy ON masters
  FOR ALL
  USING (artist_id = current_setting('app.current_artist_id')::uuid);
```

### 5.3 Column-Level Encryption

Sensitive columns should be encrypted at the application level:

| Table | Column | Encryption |
|-------|--------|------------|
| `users` | `two_factor_secret` | AES-256 |
| `accounts` | `access_token` | AES-256 |
| `identity_providers` | `client_secret` | AES-256 |
| `payment_providers` | `webhook_secret` | AES-256 |

---

## 6. Audit & Compliance

### 6.1 Audit Trail Requirements

All sensitive operations must be logged:

- User authentication events
- Data modifications to financial tables
- Admin actions
- Configuration changes
- Data exports

### 6.2 Log Integrity

Audit logs should be:
- Append-only (no updates/deletes in production)
- Timestamped with server time
- Signed or hashed for integrity verification

### 6.3 Compliance Frameworks

| Framework | Applicability | Key Requirements |
|-----------|---------------|------------------|
| GDPR | EU users | Data portability, right to delete |
| CCPA | California users | Opt-out, deletion |
| SOC 2 | Enterprise clients | Access controls, encryption |
| PCI DSS | Payment processing | Handled by Stripe |

---

## 7. Data Quality

### 7.1 Validation Rules

Enforce at database level where possible:

```sql
-- Non-null constraints on required fields
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Check constraints for valid data
ALTER TABLE master_ipos ADD CONSTRAINT valid_total_supply
  CHECK (total_supply >= 1 AND total_supply <= 1000000);

-- Foreign key constraints
ALTER TABLE masters ADD CONSTRAINT fk_artist
  FOREIGN KEY (artist_id) REFERENCES artists(id);
```

### 7.2 Data Consistency Checks

Run periodic consistency checks:

```sql
-- Orphaned NFTs (no master)
SELECT * FROM master_nfts mn
LEFT JOIN masters m ON m.id = mn.master_id
WHERE m.id IS NULL;

-- Negative balances (should never happen)
SELECT * FROM token_holders WHERE balance < 0;

-- IPO supply mismatch
SELECT mi.*, COUNT(mn.id) as actual_minted
FROM master_ipos mi
LEFT JOIN master_nfts mn ON mn.master_id = mi.master_id
GROUP BY mi.id
HAVING mi.minted_supply != COUNT(mn.id);
```

---

## 8. Incident Response

### 8.1 Data Breach Procedure

1. **Identify**: Detect and classify the breach
2. **Contain**: Isolate affected systems
3. **Assess**: Determine scope and impact
4. **Notify**: Inform affected users within 72 hours (GDPR)
5. **Remediate**: Fix vulnerability
6. **Review**: Post-incident analysis

### 8.2 Contact Points

| Role | Responsibility |
|------|----------------|
| Security-Agent | Lead incident response |
| Database Admin | System access and forensics |
| Legal/Compliance | Regulatory notifications |
| Communications | User notifications |

---

## 9. Environment Separation

### 9.1 Environment Isolation

| Environment | Data | Access |
|-------------|------|--------|
| Production | Real user data | Restricted |
| Staging | Anonymized production subset | Engineering team |
| Development | Synthetic/seed data | All developers |
| Testing | Minimal fixtures | CI/CD systems |

### 9.2 Data Sanitization for Non-Production

```sql
-- Anonymize users for staging
UPDATE users SET
  email = 'user_' || id || '@example.com',
  display_name = 'Test User ' || SUBSTRING(id::text, 1, 8),
  two_factor_secret = NULL;

-- Remove payment data
TRUNCATE invoices, payment_methods;

-- Scramble wallet addresses (but keep structure)
UPDATE user_wallets SET
  wallet_address = '0x' || ENCODE(SHA256(wallet_address::bytea), 'hex')::varchar(42);
```

---

## 10. Documentation & Training

### 10.1 Required Documentation

- [ ] Data dictionary (all tables and columns)
- [ ] Entity-relationship diagrams
- [ ] Data flow diagrams
- [ ] Access control matrix
- [ ] Backup/recovery procedures

### 10.2 Training Requirements

- All developers: Data classification awareness
- Database administrators: Backup/recovery procedures
- Support team: PII handling
- Security team: Incident response
