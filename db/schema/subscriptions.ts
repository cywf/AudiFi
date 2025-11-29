/**
 * AudiFi Database Schema - Subscriptions & Billing
 * 
 * This module defines tables for subscription plans, active subscriptions,
 * invoices, payment providers, and webhook processing.
 * 
 * ON-CHAIN vs OFF-CHAIN:
 * - Subscriptions: Off-chain (Stripe-managed)
 * - Invoices: Off-chain (Stripe-managed)
 * - Future crypto payments: On-chain (to be mirrored)
 * 
 * This schema is designed to work with Stripe as the primary
 * payment provider, with extensibility for future crypto payments.
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, index, uniqueIndex, integer, numeric, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './identity';

// ============================================================
// ENUMS
// ============================================================

/**
 * Subscription plan interval
 */
export const planIntervalEnum = pgEnum('plan_interval', [
  'monthly',
  'yearly',
  'lifetime',
]);

/**
 * Subscription status
 */
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused',
]);

/**
 * Invoice status
 */
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'open',
  'paid',
  'void',
  'uncollectible',
]);

/**
 * Payment provider
 */
export const paymentProviderTypeEnum = pgEnum('payment_provider_type', [
  'stripe',
  'crypto_eth',
  'crypto_sol',
  'paypal',      // Future
  'apple_pay',   // Via Stripe
]);

/**
 * Webhook processing status
 */
export const webhookStatusEnum = pgEnum('webhook_status', [
  'pending',
  'processing',
  'processed',
  'failed',
  'skipped',
]);

// ============================================================
// TABLES
// ============================================================

/**
 * Subscription Plans table - Available plans
 * 
 * Defines the subscription tiers available on the platform.
 */
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Plan identity
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull(), // e.g., "free", "pro", "enterprise"
  description: text('description'),
  
  // Pricing
  priceUsd: numeric('price_usd', { precision: 10, scale: 2 }).notNull(),
  interval: planIntervalEnum('interval').notNull(),
  
  // Stripe integration
  stripePriceId: varchar('stripe_price_id', { length: 100 }),
  stripeProductId: varchar('stripe_product_id', { length: 100 }),
  
  // Features and limits
  maxMasters: integer('max_masters'), // null = unlimited
  maxIposPerMonth: integer('max_ipos_per_month'),
  vstudioSessionsIncluded: integer('vstudio_sessions_included'),
  
  // Feature flags (JSON for flexibility)
  features: jsonb('features').$type<{
    advancedAnalytics?: boolean;
    prioritySupport?: boolean;
    customBranding?: boolean;
    apiAccess?: boolean;
    whiteLabel?: boolean;
    earlyAccess?: boolean;
  }>(),
  
  // Feature list for display
  featureList: jsonb('feature_list').$type<string[]>(),
  
  // Plan availability
  isActive: boolean('is_active').notNull().default(true),
  isPublic: boolean('is_public').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  
  // Trial configuration
  trialDays: integer('trial_days').default(0),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('subscription_plans_slug_idx').on(table.slug),
  index('subscription_plans_active_idx').on(table.isActive),
  index('subscription_plans_order_idx').on(table.displayOrder),
]);

/**
 * Subscriptions table - Active user subscriptions
 * 
 * Tracks individual subscription instances.
 */
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  userId: uuid('user_id').notNull().references(() => users.id),
  planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),
  
  // Status
  status: subscriptionStatusEnum('status').notNull().default('active'),
  
  // Period
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  
  // Trial
  trialStart: timestamp('trial_start', { withTimezone: true }),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  
  // Cancellation
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  cancellationReason: text('cancellation_reason'),
  
  // Stripe integration
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  
  // Payment method
  defaultPaymentMethodId: varchar('default_payment_method_id', { length: 100 }),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('subscriptions_user_id_idx').on(table.userId),
  index('subscriptions_plan_id_idx').on(table.planId),
  index('subscriptions_status_idx').on(table.status),
  index('subscriptions_stripe_sub_id_idx').on(table.stripeSubscriptionId),
  index('subscriptions_stripe_customer_idx').on(table.stripeCustomerId),
  index('subscriptions_period_end_idx').on(table.currentPeriodEnd),
]);

/**
 * Invoices table - Billing records
 * 
 * Records of all invoices, primarily synced from Stripe.
 */
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  
  // Invoice identity
  invoiceNumber: varchar('invoice_number', { length: 50 }),
  
  // Stripe integration
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 100 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 100 }),
  
  // Amounts
  amountDue: numeric('amount_due', { precision: 10, scale: 2 }).notNull(),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull().default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  
  // Status
  status: invoiceStatusEnum('status').notNull().default('open'),
  
  // Dates
  periodStart: timestamp('period_start', { withTimezone: true }),
  periodEnd: timestamp('period_end', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  
  // URLs
  hostedInvoiceUrl: text('hosted_invoice_url'),
  invoicePdfUrl: text('invoice_pdf_url'),
  
  // Line items (JSON for flexibility)
  lineItems: jsonb('line_items').$type<Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    amount: number;
  }>>(),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('invoices_stripe_invoice_id_idx').on(table.stripeInvoiceId),
  index('invoices_subscription_id_idx').on(table.subscriptionId),
  index('invoices_user_id_idx').on(table.userId),
  index('invoices_status_idx').on(table.status),
  index('invoices_due_date_idx').on(table.dueDate),
]);

/**
 * Payment Providers table - Integration configuration
 * 
 * Stores configuration for payment providers.
 * Admin-managed table.
 */
export const paymentProviders = pgTable('payment_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Provider identity
  name: varchar('name', { length: 100 }).notNull(),
  providerType: paymentProviderTypeEnum('provider_type').notNull(),
  
  // Configuration (encrypted sensitive data)
  isEnabled: boolean('is_enabled').notNull().default(false),
  isDefault: boolean('is_default').notNull().default(false),
  
  // Supported currencies/regions
  supportedCurrencies: jsonb('supported_currencies').$type<string[]>(),
  supportedRegions: jsonb('supported_regions').$type<string[]>(),
  
  // Webhooks
  // SECURITY NOTE: webhookSecret and configJson contain sensitive data and must be
  // encrypted at application level using AES-256 before storing. Implement encryption
  // in the service layer before database operations.
  webhookEndpoint: text('webhook_endpoint'),
  webhookSecret: text('webhook_secret'),
  
  // Metadata
  configJson: text('config_json'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('payment_providers_type_idx').on(table.providerType),
  index('payment_providers_enabled_idx').on(table.isEnabled),
]);

/**
 * Webhooks Log table - Webhook processing audit
 * 
 * Logs all incoming webhooks from payment providers
 * for debugging and replay capability.
 */
export const webhooksLog = pgTable('webhooks_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Provider
  providerName: varchar('provider_name', { length: 100 }).notNull(),
  providerId: uuid('provider_id').references(() => paymentProviders.id),
  
  // Event details
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventId: varchar('event_id', { length: 100 }), // Provider's event ID
  
  // Payload (consider separate storage for large payloads)
  payloadMetadata: jsonb('payload_metadata').$type<{
    objectId?: string;
    objectType?: string;
    customerId?: string;
    subscriptionId?: string;
  }>(),
  
  // Processing status
  status: webhookStatusEnum('status').notNull().default('pending'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  processingError: text('processing_error'),
  retryCount: integer('retry_count').notNull().default(0),
  
  // Request metadata
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('webhooks_log_event_id_idx').on(table.eventId),
  index('webhooks_log_provider_idx').on(table.providerName),
  index('webhooks_log_event_type_idx').on(table.eventType),
  index('webhooks_log_status_idx').on(table.status),
  index('webhooks_log_created_at_idx').on(table.createdAt),
]);

/**
 * Payment Methods table - Saved payment methods
 * 
 * Tracks user's saved payment methods for quick checkout.
 */
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  userId: uuid('user_id').notNull().references(() => users.id),
  
  // Provider reference
  stripePaymentMethodId: varchar('stripe_payment_method_id', { length: 100 }),
  
  // Type
  paymentMethodType: varchar('payment_method_type', { length: 50 }).notNull(), // "card", "wallet", etc.
  
  // Display info (non-sensitive)
  displayName: varchar('display_name', { length: 100 }), // e.g., "Visa •••• 4242"
  brand: varchar('brand', { length: 50 }),
  last4: varchar('last4', { length: 4 }),
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  
  // Status
  isDefault: boolean('is_default').notNull().default(false),
  isExpired: boolean('is_expired').notNull().default(false),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('payment_methods_stripe_pm_id_idx').on(table.stripePaymentMethodId),
  index('payment_methods_user_id_idx').on(table.userId),
  index('payment_methods_default_idx').on(table.isDefault),
]);

// ============================================================
// RELATIONS
// ============================================================

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
}));

export const webhooksLogRelations = relations(webhooksLog, ({ one }) => ({
  provider: one(paymentProviders, {
    fields: [webhooksLog.providerId],
    references: [paymentProviders.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));
