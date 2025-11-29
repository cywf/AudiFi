/**
 * AudiFi Database Schema - Identity & Roles
 * 
 * This module defines tables for user identity, authentication,
 * and role-based access control.
 * 
 * ON-CHAIN vs OFF-CHAIN:
 * - User identity: Off-chain (platform-managed)
 * - Wallet addresses: Off-chain mirror of on-chain identity
 * - Roles: Off-chain (platform-managed)
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, uniqueIndex, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// ENUMS
// ============================================================

/**
 * User roles in the AudiFi platform
 */
export const userRoleEnum = pgEnum('user_role', [
  'viewer',     // Default role - can view content
  'artist',     // Can create masters, launch IPOs
  'producer',   // Can collaborate on masters
  'admin',      // Platform administrator
]);

/**
 * Authentication provider types
 */
export const authProviderEnum = pgEnum('auth_provider', [
  'magic_link',
  'google',
  'microsoft',
  'apple',
  'github',
  'wallet',     // Web3 wallet authentication
]);

/**
 * Account status
 */
export const accountStatusEnum = pgEnum('account_status', [
  'active',
  'suspended',
  'pending_verification',
  'deleted',
]);

// ============================================================
// TABLES
// ============================================================

/**
 * Users table - Core account identity
 * 
 * This is the primary identity table for all platform users.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Core identity
  email: varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  
  // Account status
  status: accountStatusEnum('status').notNull().default('active'),
  emailVerified: boolean('email_verified').notNull().default(false),
  
  // Two-factor authentication
  // SECURITY NOTE: twoFactorSecret must be encrypted at application level using AES-256
  // before storing. Drizzle does not provide column-level encryption; implement in service layer.
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('users_email_idx').on(table.email),
  index('users_status_idx').on(table.status),
  index('users_created_at_idx').on(table.createdAt),
]);

/**
 * Accounts table - Authentication methods
 * 
 * Links users to their authentication providers (magic-link, SSO, wallet).
 * A user can have multiple accounts (e.g., email + wallet).
 */
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Provider details
  provider: authProviderEnum('provider').notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  
  // OAuth tokens (encrypted if stored)
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpires: timestamp('access_token_expires', { withTimezone: true }),
  
  // Metadata
  providerMetadata: text('provider_metadata'), // JSON string for extra provider data
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('accounts_provider_account_idx').on(table.provider, table.providerAccountId),
  index('accounts_user_id_idx').on(table.userId),
]);

/**
 * Identity Providers table - SSO configuration
 * 
 * Stores configuration for external identity providers.
 * Admin-managed table for platform SSO settings.
 */
export const identityProviders = pgTable('identity_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Provider identification
  name: varchar('name', { length: 100 }).notNull(),
  provider: authProviderEnum('provider').notNull(),
  
  // Configuration (encrypted)
  clientId: varchar('client_id', { length: 255 }),
  clientSecret: text('client_secret'), // Encrypted
  
  // Provider settings
  enabled: boolean('enabled').notNull().default(true),
  configJson: text('config_json'), // Additional JSON config
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('identity_providers_provider_idx').on(table.provider),
]);

/**
 * Roles table - Role definitions
 * 
 * Defines available roles and their descriptions.
 */
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  name: userRoleEnum('name').notNull(),
  description: text('description'),
  
  // Permissions as JSON (future: move to separate permissions table)
  permissions: text('permissions'), // JSON array of permission strings
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('roles_name_idx').on(table.name),
]);

/**
 * User Roles table - Role assignments
 * 
 * Junction table linking users to their roles.
 * A user can have multiple roles.
 */
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  
  // Assignment metadata
  assignedBy: uuid('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // Optional role expiration
}, (table) => [
  uniqueIndex('user_roles_user_role_idx').on(table.userId, table.roleId),
  index('user_roles_user_id_idx').on(table.userId),
  index('user_roles_role_id_idx').on(table.roleId),
]);

/**
 * User Wallets table - Wallet associations
 * 
 * Links users to their blockchain wallet addresses.
 * A user can have multiple wallets across different chains.
 * 
 * OFF-CHAIN MIRROR: Wallet ownership is ultimately on-chain,
 * but we store associations for fast lookups.
 */
export const userWallets = pgTable('user_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Wallet details
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(), // e.g., "1" (eth mainnet), "solana"
  
  // Verification status
  isPrimary: boolean('is_primary').notNull().default(false),
  verified: boolean('verified').notNull().default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  
  // Display preferences
  label: varchar('label', { length: 100 }), // User-friendly wallet name
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('user_wallets_address_chain_idx').on(table.walletAddress, table.chainId),
  index('user_wallets_user_id_idx').on(table.userId),
  index('user_wallets_address_idx').on(table.walletAddress),
]);

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  userRoles: many(userRoles),
  wallets: many(userWallets),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
}));

export const userWalletsRelations = relations(userWallets, ({ one }) => ({
  user: one(users, {
    fields: [userWallets.userId],
    references: [users.id],
  }),
}));
