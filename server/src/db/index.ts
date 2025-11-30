/**
 * AudiFi Database Client
 * 
 * Configures and exports the Drizzle ORM database client for the server.
 * Uses Neon (PostgreSQL) as the primary database provider.
 * 
 * Connection is established via DATABASE_URL with SSL enabled for Neon.
 * Uses inline schema definitions mirroring the shared db/schema.
 * 
 * NOTE: In production, consider using a shared package for schema.
 * For now, we define essential tables inline to avoid cross-package imports.
 */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, uuid, varchar, text, timestamp, boolean, index, uniqueIndex, integer, numeric, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { envConfig } from '../config/index.js';

// =============================================================================
// ENUMS
// =============================================================================

export const userRoleEnum = pgEnum('user_role', ['viewer', 'artist', 'producer', 'admin']);
export const authProviderEnum = pgEnum('auth_provider', ['magic_link', 'google', 'microsoft', 'apple', 'github', 'wallet']);
export const accountStatusEnum = pgEnum('account_status', ['active', 'suspended', 'pending_verification', 'deleted']);
export const masterTypeEnum = pgEnum('master_type', ['track', 'album']);
export const masterStatusEnum = pgEnum('master_status', ['draft', 'pending', 'approved', 'live', 'archived']);
export const ipoStatusEnum = pgEnum('ipo_status', ['draft', 'scheduled', 'live', 'closed', 'cancelled']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused']);
export const planIntervalEnum = pgEnum('plan_interval', ['monthly', 'yearly', 'lifetime']);

// =============================================================================
// TABLES
// =============================================================================

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  status: accountStatusEnum('status').notNull().default('active'),
  emailVerified: boolean('email_verified').notNull().default(false),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('users_email_idx').on(table.email),
  index('users_status_idx').on(table.status),
]);

// User wallets table
export const userWallets = pgTable('user_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  verified: boolean('verified').notNull().default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  label: varchar('label', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('user_wallets_address_chain_idx').on(table.walletAddress, table.chainId),
  index('user_wallets_user_id_idx').on(table.userId),
]);

// User roles table
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: userRoleEnum('name').notNull(),
  description: text('description'),
  permissions: text('permissions'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('roles_name_idx').on(table.name),
]);

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedBy: uuid('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('user_roles_user_role_idx').on(table.userId, table.roleId),
]);

// Artists table
export const artists = pgTable('artists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  artistName: varchar('artist_name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(),
  bio: text('bio'),
  genre: varchar('genre', { length: 100 }),
  profileImageUrl: text('profile_image_url'),
  isVerified: boolean('is_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  totalMasters: integer('total_masters').notNull().default(0),
  followerCount: integer('follower_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('artists_user_id_idx').on(table.userId),
  uniqueIndex('artists_slug_idx').on(table.slug),
]);

// Masters table
export const masters = pgTable('masters', {
  id: uuid('id').primaryKey().defaultRandom(),
  artistId: uuid('artist_id').notNull().references(() => artists.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  masterType: masterTypeEnum('master_type').notNull().default('track'),
  status: masterStatusEnum('status').notNull().default('draft'),
  genre: varchar('genre', { length: 100 }),
  bpm: integer('bpm'),
  duration: integer('duration'),
  releaseDate: timestamp('release_date', { withTimezone: true }),
  moodTags: jsonb('mood_tags').$type<string[]>().default([]),
  audioIpfsHash: varchar('audio_ipfs_hash', { length: 100 }),
  coverImageUrl: text('cover_image_url'),
  coverImageIpfsHash: varchar('cover_image_ipfs_hash', { length: 100 }),
  metadataIpfsHash: varchar('metadata_ipfs_hash', { length: 100 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
}, (table) => [
  index('masters_artist_id_idx').on(table.artistId),
  index('masters_status_idx').on(table.status),
  index('masters_genre_idx').on(table.genre),
]);

// Master IPOs table
export const masterIpos = pgTable('master_ipos', {
  id: uuid('id').primaryKey().defaultRandom(),
  masterId: uuid('master_id').notNull().references(() => masters.id),
  totalSupply: integer('total_supply').notNull(),
  mintedSupply: integer('minted_supply').notNull().default(0),
  mintPriceWei: numeric('mint_price_wei', { precision: 78, scale: 0 }),
  mintPriceCurrency: varchar('mint_price_currency', { length: 20 }),
  status: ipoStatusEnum('status').notNull().default('draft'),
  scheduledStartAt: timestamp('scheduled_start_at', { withTimezone: true }),
  scheduledEndAt: timestamp('scheduled_end_at', { withTimezone: true }),
  actualStartAt: timestamp('actual_start_at', { withTimezone: true }),
  actualEndAt: timestamp('actual_end_at', { withTimezone: true }),
  moverAdvantageEnabled: boolean('mover_advantage_enabled').notNull().default(true),
  firstMinterBonusBps: integer('first_minter_bonus_bps').default(300),
  secondMinterBonusBps: integer('second_minter_bonus_bps').default(200),
  thirdMinterBonusBps: integer('third_minter_bonus_bps').default(100),
  chainId: varchar('chain_id', { length: 50 }),
  contractAddress: varchar('contract_address', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('master_ipos_master_id_idx').on(table.masterId),
  index('master_ipos_status_idx').on(table.status),
]);

// Master NFTs table
export const masterNfts = pgTable('master_nfts', {
  id: uuid('id').primaryKey().defaultRandom(),
  masterId: uuid('master_id').notNull().references(() => masters.id),
  masterIpoId: uuid('master_ipo_id').notNull().references(() => masterIpos.id),
  tokenId: numeric('token_id', { precision: 78, scale: 0 }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  contractAddress: varchar('contract_address', { length: 255 }).notNull(),
  currentOwnerWallet: varchar('current_owner_wallet', { length: 255 }).notNull(),
  isFirstMinter: boolean('is_first_minter').notNull().default(false),
  isSecondMinter: boolean('is_second_minter').notNull().default(false),
  isThirdMinter: boolean('is_third_minter').notNull().default(false),
  originalMinterWallet: varchar('original_minter_wallet', { length: 255 }).notNull(),
  mintTxHash: varchar('mint_tx_hash', { length: 255 }),
  mintedAt: timestamp('minted_at', { withTimezone: true }),
  mintPriceWei: numeric('mint_price_wei', { precision: 78, scale: 0 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('master_nfts_chain_contract_token_idx').on(table.chainId, table.contractAddress, table.tokenId),
  index('master_nfts_master_id_idx').on(table.masterId),
  index('master_nfts_owner_wallet_idx').on(table.currentOwnerWallet),
]);

// Subscription plans table
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull(),
  description: text('description'),
  priceUsd: numeric('price_usd', { precision: 10, scale: 2 }).notNull(),
  interval: planIntervalEnum('interval').notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 100 }),
  stripeProductId: varchar('stripe_product_id', { length: 100 }),
  maxMasters: integer('max_masters'),
  features: jsonb('features').$type<Record<string, boolean>>(),
  featureList: jsonb('feature_list').$type<string[]>(),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('subscription_plans_slug_idx').on(table.slug),
]);

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('subscriptions_user_id_idx').on(table.userId),
  index('subscriptions_status_idx').on(table.status),
]);

// Magic link tokens table (for auth)
export const magicLinkTokens = pgTable('magic_link_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('magic_link_tokens_token_idx').on(table.token),
  index('magic_link_tokens_email_idx').on(table.email),
]);

// User sessions table (for refresh tokens)
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: varchar('refresh_token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  userAgent: varchar('user_agent', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('user_sessions_refresh_token_idx').on(table.refreshToken),
  index('user_sessions_user_id_idx').on(table.userId),
]);

// =============================================================================
// RELATIONS
// =============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(userWallets),
  roles: many(userRoles),
  sessions: many(userSessions),
  subscriptions: many(subscriptions),
}));

export const userWalletsRelations = relations(userWallets, ({ one }) => ({
  user: one(users, { fields: [userWallets.userId], references: [users.id] }),
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, { fields: [artists.userId], references: [users.id] }),
  masters: many(masters),
}));

export const mastersRelations = relations(masters, ({ one, many }) => ({
  artist: one(artists, { fields: [masters.artistId], references: [artists.id] }),
  ipo: one(masterIpos),
  nfts: many(masterNfts),
}));

export const masterIposRelations = relations(masterIpos, ({ one, many }) => ({
  master: one(masters, { fields: [masterIpos.masterId], references: [masters.id] }),
  nfts: many(masterNfts),
}));

export const masterNftsRelations = relations(masterNfts, ({ one }) => ({
  master: one(masters, { fields: [masterNfts.masterId], references: [masters.id] }),
  ipo: one(masterIpos, { fields: [masterNfts.masterIpoId], references: [masterIpos.id] }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, { fields: [userSessions.userId], references: [users.id] }),
}));

// =============================================================================
// Combine all schemas into one object
// =============================================================================

export const schema = {
  // Enums
  userRoleEnum,
  authProviderEnum,
  accountStatusEnum,
  masterTypeEnum,
  masterStatusEnum,
  ipoStatusEnum,
  subscriptionStatusEnum,
  planIntervalEnum,
  // Tables
  users,
  userWallets,
  roles,
  userRoles,
  artists,
  masters,
  masterIpos,
  masterNfts,
  subscriptionPlans,
  subscriptions,
  magicLinkTokens,
  userSessions,
  // Relations
  usersRelations,
  userWalletsRelations,
  artistsRelations,
  mastersRelations,
  masterIposRelations,
  masterNftsRelations,
  subscriptionPlansRelations,
  subscriptionsRelations,
  userSessionsRelations,
};

// =============================================================================
// DATABASE CLIENT (Neon PostgreSQL)
// =============================================================================

// Get connection string from environment config (includes sslmode=require for Neon)
const connectionString = envConfig.dbUrl;

// Create postgres connection pool with Neon-compatible settings
let sql: postgres.Sql | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

if (connectionString) {
  sql = postgres(connectionString, {
    // Connection pool settings optimized for Neon serverless
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Neon requires SSL for all connections (handled in connection string via sslmode=require)
  });
  
  db = drizzle(sql, { schema });
  
  if (!envConfig.isTest) {
    console.log('✅ Database client initialized (Neon PostgreSQL)');
  }
} else if (!envConfig.isTest) {
  console.warn(`⚠️  DATABASE_URL not set. Database features will be disabled.
  
  To configure the Neon database:
  1. Create a database at https://neon.tech
  2. Copy the connection string from your Neon dashboard
  3. Set DATABASE_URL in your .env file:
     DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database
  4. For Fly.io, set via: flyctl secrets set DATABASE_URL=...
  5. Run 'npm run db:push' to create tables
  
  See README.md for full setup instructions.`);
}

// Export db client - may be null if no connection string
export { db };

// Export raw SQL client for advanced queries
export { sql };

/**
 * Close database connections gracefully.
 * Call this when shutting down the application.
 */
export async function closeDatabase(): Promise<void> {
  if (sql) {
    await sql.end();
    console.log('Database connections closed.');
  }
}

/**
 * Check if database is connected and ready.
 */
export async function isDatabaseReady(): Promise<boolean> {
  if (!sql) {
    return false;
  }
  
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Get the database client, throwing an error if not connected.
 * Use this in services that require DB access.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!db) {
    throw new Error(
      'Database not connected. Check DATABASE_URL environment variable.\n' +
      'For Neon connections, ensure your DATABASE_URL is set correctly:\n' +
      'DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database'
    );
  }
  return db;
}
