/**
 * AudiFi Database Schema - Artist Coin & Liquidity
 * 
 * This module defines tables for ERC-20 Artist Coins,
 * liquidity pools, and pool positions.
 * 
 * ON-CHAIN vs OFF-CHAIN:
 * - Token contracts: On-chain (authoritative)
 * - Token balances: On-chain (mirrored for fast lookups)
 * - Liquidity pools: On-chain (mirrored)
 * - Pool positions: On-chain (mirrored)
 * - AMM events: On-chain (indexed for analytics)
 */

import { pgTable, uuid, varchar, numeric, timestamp, index, uniqueIndex, text, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { artists } from './artists';

// ============================================================
// ENUMS
// ============================================================

/**
 * Token type
 */
export const tokenTypeEnum = pgEnum('token_type', [
  'artist_coin',      // Artist's ERC-20 coin
  'platform_token',   // Platform utility token
  'governance',       // Governance token
]);

/**
 * Pool type
 */
export const poolTypeEnum = pgEnum('pool_type', [
  'uniswap_v2',
  'uniswap_v3',
  'sushiswap',
  'raydium',          // Solana
  'orca',             // Solana
  'custom',           // Custom AMM
]);

/**
 * Pool event type
 */
export const poolEventTypeEnum = pgEnum('pool_event_type', [
  'add_liquidity',
  'remove_liquidity',
  'swap',
]);

// ============================================================
// TABLES
// ============================================================

/**
 * Artist Tokens table - ERC-20 Artist Coins
 * 
 * Mirrors deployed Artist Coin contracts.
 * Each artist can have one token per chain.
 * 
 * ON-CHAIN DATA: Contract details are authoritative on-chain.
 */
export const artistTokens = pgTable('artist_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  artistId: uuid('artist_id').notNull().references(() => artists.id),
  
  // [ON-CHAIN] Token identity
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  contractAddress: varchar('contract_address', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Token metadata
  name: varchar('name', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  decimals: varchar('decimals', { length: 2 }).notNull().default('18'),
  
  // [ON-CHAIN] Supply
  totalSupply: numeric('total_supply', { precision: 78, scale: 0 }).notNull(),
  circulatingSupply: numeric('circulating_supply', { precision: 78, scale: 0 }), // DERIVED
  
  // [ON-CHAIN] Deployment
  deploymentTxHash: varchar('deployment_tx_hash', { length: 255 }),
  deployedAtBlock: numeric('deployed_at_block', { precision: 20, scale: 0 }),
  deployedAt: timestamp('deployed_at', { withTimezone: true }),
  
  // Token branding
  logoUrl: text('logo_url'),
  description: text('description'),
  
  // Trading status
  isTradable: boolean('is_tradable').notNull().default(false),
  tradingEnabledAt: timestamp('trading_enabled_at', { withTimezone: true }),
  
  // Market data (DERIVED - updated periodically)
  lastPriceUsd: numeric('last_price_usd', { precision: 28, scale: 18 }),
  marketCapUsd: numeric('market_cap_usd', { precision: 28, scale: 8 }),
  volume24hUsd: numeric('volume_24h_usd', { precision: 28, scale: 8 }),
  priceChange24h: numeric('price_change_24h', { precision: 10, scale: 4 }), // Percentage
  holdersCount: numeric('holders_count', { precision: 20, scale: 0 }),
  lastMarketDataUpdate: timestamp('last_market_data_update', { withTimezone: true }),
  
  // Indexer metadata
  lastIndexedBlock: numeric('last_indexed_block', { precision: 20, scale: 0 }),
  lastIndexedAt: timestamp('last_indexed_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique constraints
  uniqueIndex('artist_tokens_chain_address_idx').on(table.chainId, table.contractAddress),
  uniqueIndex('artist_tokens_artist_chain_idx').on(table.artistId, table.chainId),
  
  // Query indexes
  index('artist_tokens_artist_id_idx').on(table.artistId),
  index('artist_tokens_symbol_idx').on(table.symbol),
  index('artist_tokens_tradable_idx').on(table.isTradable),
]);

/**
 * Token Holders table - Wallet balances for Artist Coins
 * 
 * Mirrors on-chain token balances for fast lookups.
 * Updated by indexer on Transfer events.
 * 
 * OFF-CHAIN MIRROR: Derived from on-chain Transfer events.
 */
export const tokenHolders = pgTable('token_holders', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  artistTokenId: uuid('artist_token_id').notNull().references(() => artistTokens.id),
  
  // Holder identity
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  
  // Balance
  balance: numeric('balance', { precision: 78, scale: 0 }).notNull().default('0'),
  
  // First acquisition
  firstAcquiredAt: timestamp('first_acquired_at', { withTimezone: true }),
  firstAcquiredTxHash: varchar('first_acquired_tx_hash', { length: 255 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique on token + wallet
  uniqueIndex('token_holders_token_wallet_idx').on(table.artistTokenId, table.walletAddress),
  
  // Query indexes
  index('token_holders_wallet_idx').on(table.walletAddress),
  index('token_holders_balance_idx').on(table.balance),
]);

/**
 * Liquidity Pools table - AMM pools for Artist Coins
 * 
 * Tracks liquidity pools where Artist Coins are traded.
 * 
 * ON-CHAIN DATA: Pool existence and reserves are on-chain.
 */
export const liquidityPools = pgTable('liquidity_pools', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  artistTokenId: uuid('artist_token_id').notNull().references(() => artistTokens.id),
  
  // [ON-CHAIN] Pool identity
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  poolAddress: varchar('pool_address', { length: 255 }).notNull(),
  poolType: poolTypeEnum('pool_type').notNull(),
  
  // Pool pair
  token0Address: varchar('token0_address', { length: 255 }).notNull(),
  token1Address: varchar('token1_address', { length: 255 }).notNull(),
  token0Symbol: varchar('token0_symbol', { length: 20 }),
  token1Symbol: varchar('token1_symbol', { length: 20 }),
  
  // [ON-CHAIN] Reserves (DERIVED - updated by indexer)
  reserve0: numeric('reserve0', { precision: 78, scale: 0 }),
  reserve1: numeric('reserve1', { precision: 78, scale: 0 }),
  
  // [ON-CHAIN] Pool metadata
  fee: numeric('fee', { precision: 10, scale: 6 }), // Fee percentage
  
  // Pool stats (DERIVED)
  totalValueLockedUsd: numeric('total_value_locked_usd', { precision: 28, scale: 8 }),
  volume24hUsd: numeric('volume_24h_usd', { precision: 28, scale: 8 }),
  
  // Creation
  createdAtBlock: numeric('created_at_block', { precision: 20, scale: 0 }),
  createdAtTxHash: varchar('created_at_tx_hash', { length: 255 }),
  
  // Indexer metadata
  lastIndexedBlock: numeric('last_indexed_block', { precision: 20, scale: 0 }),
  lastIndexedAt: timestamp('last_indexed_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique on chain + pool
  uniqueIndex('liquidity_pools_chain_pool_idx').on(table.chainId, table.poolAddress),
  
  // Query indexes
  index('liquidity_pools_artist_token_idx').on(table.artistTokenId),
  index('liquidity_pools_pool_type_idx').on(table.poolType),
  index('liquidity_pools_tvl_idx').on(table.totalValueLockedUsd),
]);

/**
 * Pool Positions table - LP positions (optional at MVP)
 * 
 * Tracks liquidity provider positions in pools.
 * Useful for showing artists/fans their LP positions.
 * 
 * ON-CHAIN DATA: LP token balances are on-chain.
 */
export const poolPositions = pgTable('pool_positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  liquidityPoolId: uuid('liquidity_pool_id').notNull().references(() => liquidityPools.id),
  
  // Position holder
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  
  // [ON-CHAIN] LP token balance
  lpTokenBalance: numeric('lp_token_balance', { precision: 78, scale: 0 }).notNull(),
  
  // DERIVED: Position value
  token0Amount: numeric('token0_amount', { precision: 78, scale: 0 }),
  token1Amount: numeric('token1_amount', { precision: 78, scale: 0 }),
  positionValueUsd: numeric('position_value_usd', { precision: 28, scale: 8 }),
  
  // Entry tracking
  enteredAt: timestamp('entered_at', { withTimezone: true }),
  entryTxHash: varchar('entry_tx_hash', { length: 255 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique on pool + wallet
  uniqueIndex('pool_positions_pool_wallet_idx').on(table.liquidityPoolId, table.walletAddress),
  
  // Query indexes
  index('pool_positions_wallet_idx').on(table.walletAddress),
  index('pool_positions_value_idx').on(table.positionValueUsd),
]);

/**
 * Pool Events table - AMM swap/liquidity events
 * 
 * Indexed swap and liquidity events for analytics.
 * 
 * ON-CHAIN DATA: All data from blockchain events.
 */
export const poolEvents = pgTable('pool_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  liquidityPoolId: uuid('liquidity_pool_id').notNull().references(() => liquidityPools.id),
  artistTokenId: uuid('artist_token_id').notNull().references(() => artistTokens.id),
  
  // [ON-CHAIN] Event details
  eventType: poolEventTypeEnum('event_type').notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  poolAddress: varchar('pool_address', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Transaction
  txHash: varchar('tx_hash', { length: 255 }).notNull(),
  blockNumber: numeric('block_number', { precision: 20, scale: 0 }).notNull(),
  blockTimestamp: timestamp('block_timestamp', { withTimezone: true }).notNull(),
  
  // [ON-CHAIN] Amounts
  amount0: numeric('amount0', { precision: 78, scale: 0 }),
  amount1: numeric('amount1', { precision: 78, scale: 0 }),
  amountUsd: numeric('amount_usd', { precision: 28, scale: 8 }),
  
  // [ON-CHAIN] For swaps
  sender: varchar('sender', { length: 255 }),
  recipient: varchar('recipient', { length: 255 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique on tx
  uniqueIndex('pool_events_tx_idx').on(table.txHash),
  
  // Query indexes
  index('pool_events_pool_id_idx').on(table.liquidityPoolId),
  index('pool_events_artist_token_idx').on(table.artistTokenId),
  index('pool_events_event_type_idx').on(table.eventType),
  index('pool_events_block_timestamp_idx').on(table.blockTimestamp),
]);

// ============================================================
// RELATIONS
// ============================================================

export const artistTokensRelations = relations(artistTokens, ({ one, many }) => ({
  artist: one(artists, {
    fields: [artistTokens.artistId],
    references: [artists.id],
  }),
  holders: many(tokenHolders),
  liquidityPools: many(liquidityPools),
  poolEvents: many(poolEvents),
}));

export const tokenHoldersRelations = relations(tokenHolders, ({ one }) => ({
  artistToken: one(artistTokens, {
    fields: [tokenHolders.artistTokenId],
    references: [artistTokens.id],
  }),
}));

export const liquidityPoolsRelations = relations(liquidityPools, ({ one, many }) => ({
  artistToken: one(artistTokens, {
    fields: [liquidityPools.artistTokenId],
    references: [artistTokens.id],
  }),
  positions: many(poolPositions),
  events: many(poolEvents),
}));

export const poolPositionsRelations = relations(poolPositions, ({ one }) => ({
  liquidityPool: one(liquidityPools, {
    fields: [poolPositions.liquidityPoolId],
    references: [liquidityPools.id],
  }),
}));

export const poolEventsRelations = relations(poolEvents, ({ one }) => ({
  liquidityPool: one(liquidityPools, {
    fields: [poolEvents.liquidityPoolId],
    references: [liquidityPools.id],
  }),
  artistToken: one(artistTokens, {
    fields: [poolEvents.artistTokenId],
    references: [artistTokens.id],
  }),
}));
