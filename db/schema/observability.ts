/**
 * AudiFi Database Schema - Observability & Security
 * 
 * This module defines tables for audit logs, security events,
 * and system observability.
 * 
 * These tables are critical for:
 * - Compliance and auditing
 * - Security incident investigation
 * - System debugging and monitoring
 * 
 * Consider appropriate retention policies for these tables.
 */

import { pgTable, uuid, varchar, text, timestamp, index, integer, pgEnum, jsonb, inet, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './identity';

// ============================================================
// ENUMS
// ============================================================

/**
 * Audit log action categories
 */
export const auditActionCategoryEnum = pgEnum('audit_action_category', [
  'authentication',   // Login, logout, password changes
  'authorization',    // Role changes, permission grants
  'master',           // Master creation, updates
  'ipo',              // IPO configuration, launch
  'revenue',          // Revenue events, dividend config
  'subscription',     // Subscription changes
  'vstudio',          // V Studio session management
  'admin',            // Admin actions
  'system',           // System events
]);

/**
 * Security event severity
 */
export const securitySeverityEnum = pgEnum('security_severity', [
  'info',
  'low',
  'medium',
  'high',
  'critical',
]);

/**
 * Security event type
 */
export const securityEventTypeEnum = pgEnum('security_event_type', [
  'failed_login',
  'suspicious_activity',
  'rate_limit_exceeded',
  'invalid_token',
  'unauthorized_access',
  'data_export',
  'admin_action',
  'configuration_change',
  'vulnerability_detected',
  'unusual_pattern',
]);

// ============================================================
// TABLES
// ============================================================

/**
 * Audit Logs table - Important backend actions
 * 
 * Logs significant actions for compliance and debugging.
 * Append-only table - records should never be modified.
 */
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Actor (who performed the action)
  userId: uuid('user_id').references(() => users.id),
  actorType: varchar('actor_type', { length: 50 }).notNull(), // "user", "system", "webhook", "admin"
  actorIdentifier: varchar('actor_identifier', { length: 255 }), // Email, system name, etc.
  
  // Action details
  actionCategory: auditActionCategoryEnum('action_category').notNull(),
  action: varchar('action', { length: 100 }).notNull(), // e.g., "create_master", "launch_ipo"
  description: text('description'),
  
  // Target (what was affected)
  targetType: varchar('target_type', { length: 50 }), // e.g., "master", "user", "subscription"
  targetId: uuid('target_id'),
  targetIdentifier: varchar('target_identifier', { length: 255 }), // Human-readable identifier
  
  // Change details
  previousState: jsonb('previous_state').$type<Record<string, unknown>>(),
  newState: jsonb('new_state').$type<Record<string, unknown>>(),
  changedFields: jsonb('changed_fields').$type<string[]>(),
  
  // Request context
  ipAddress: inet('ip_address'),
  userAgent: varchar('user_agent', { length: 500 }),
  requestId: varchar('request_id', { length: 100 }), // Correlation ID
  
  // Result
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  
  // Timestamp
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('audit_logs_user_id_idx').on(table.userId),
  index('audit_logs_action_category_idx').on(table.actionCategory),
  index('audit_logs_action_idx').on(table.action),
  index('audit_logs_target_type_idx').on(table.targetType),
  index('audit_logs_target_id_idx').on(table.targetId),
  index('audit_logs_created_at_idx').on(table.createdAt),
  index('audit_logs_request_id_idx').on(table.requestId),
]);

/**
 * Security Events table - Security-relevant activity
 * 
 * Logs security-related events for monitoring and investigation.
 * Coordinate with Security-Agent for event types and responses.
 */
export const securityEvents = pgTable('security_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Event classification
  eventType: securityEventTypeEnum('event_type').notNull(),
  severity: securitySeverityEnum('severity').notNull(),
  
  // Associated user (if known)
  userId: uuid('user_id').references(() => users.id),
  walletAddress: varchar('wallet_address', { length: 255 }),
  
  // Event details
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  
  // Technical details
  ipAddress: inet('ip_address'),
  userAgent: varchar('user_agent', { length: 500 }),
  requestPath: varchar('request_path', { length: 500 }),
  requestMethod: varchar('request_method', { length: 10 }),
  
  // Additional context
  eventData: jsonb('event_data').$type<{
    failedAttempts?: number;
    threshold?: number;
    rule?: string;
    indicators?: string[];
  }>(),
  
  // Investigation status
  isInvestigated: boolean('is_investigated').notNull().default(false),
  investigatedBy: uuid('investigated_by').references(() => users.id),
  investigatedAt: timestamp('investigated_at', { withTimezone: true }),
  investigationNotes: text('investigation_notes'),
  
  // Resolution
  isResolved: boolean('is_resolved').notNull().default(false),
  resolution: varchar('resolution', { length: 100 }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  
  // Timestamp
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('security_events_event_type_idx').on(table.eventType),
  index('security_events_severity_idx').on(table.severity),
  index('security_events_user_id_idx').on(table.userId),
  index('security_events_ip_address_idx').on(table.ipAddress),
  index('security_events_investigated_idx').on(table.isInvestigated),
  index('security_events_created_at_idx').on(table.createdAt),
]);

/**
 * System Events table - System-level observability
 * 
 * Logs system events like job completions, errors, etc.
 */
export const systemEvents = pgTable('system_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Event classification
  eventType: varchar('event_type', { length: 100 }).notNull(), // e.g., "job_completed", "indexer_sync"
  source: varchar('source', { length: 100 }).notNull(), // e.g., "blockchain_indexer", "revenue_processor"
  
  // Event details
  message: text('message'),
  
  // Context
  jobId: varchar('job_id', { length: 100 }),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  
  // Metrics
  durationMs: integer('duration_ms'),
  recordsProcessed: integer('records_processed'),
  
  // Status
  success: boolean('success').notNull().default(true),
  errorMessage: text('error_message'),
  errorStack: text('error_stack'),
  
  // Additional data
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  
  // Timestamp
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('system_events_event_type_idx').on(table.eventType),
  index('system_events_source_idx').on(table.source),
  index('system_events_job_id_idx').on(table.jobId),
  index('system_events_success_idx').on(table.success),
  index('system_events_created_at_idx').on(table.createdAt),
]);

/**
 * Rate Limits table - Rate limiting state
 * 
 * Tracks rate limiting for various actions.
 * Consider using Redis for production rate limiting.
 */
export const rateLimits = pgTable('rate_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Identifier (user ID, IP, wallet, etc.)
  identifier: varchar('identifier', { length: 255 }).notNull(),
  identifierType: varchar('identifier_type', { length: 50 }).notNull(), // "user_id", "ip", "wallet"
  
  // Action being limited
  action: varchar('action', { length: 100 }).notNull(), // e.g., "login_attempt", "mint_request"
  
  // Window
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  windowEnd: timestamp('window_end', { withTimezone: true }).notNull(),
  
  // Count
  requestCount: integer('request_count').notNull().default(0),
  limit: integer('rate_limit').notNull(),
  
  // Blocked status
  isBlocked: boolean('is_blocked').notNull().default(false),
  blockedUntil: timestamp('blocked_until', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('rate_limits_identifier_action_idx').on(table.identifier, table.action),
  index('rate_limits_window_end_idx').on(table.windowEnd),
  index('rate_limits_blocked_idx').on(table.isBlocked),
]);

// ============================================================
// RELATIONS
// ============================================================

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id],
  }),
  investigator: one(users, {
    fields: [securityEvents.investigatedBy],
    references: [users.id],
  }),
}));
