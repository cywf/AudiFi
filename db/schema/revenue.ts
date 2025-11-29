/**
 * AudiFi Database Schema - Revenue & Dividends
 * 
 * This module defines tables for revenue events, dividend distributions,
 * and wallet-level dividend tracking.
 * 
 * ON-CHAIN vs OFF-CHAIN:
 * - Revenue deposits to contract: On-chain
 * - Dividend distribution events: On-chain
 * - Claim transactions: On-chain
 * - Revenue sources (distributors, PROs): Off-chain
 * - Wallet balances: Off-chain derived from on-chain
 */

import { pgTable, uuid, varchar, numeric, timestamp, index, uniqueIndex, text, pgEnum, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { masters } from './masters';
import { dividendContracts } from './masters';
import { masterNfts } from './nfts';

// ============================================================
// ENUMS
// ============================================================

/**
 * Revenue source type
 */
export const revenueSourceTypeEnum = pgEnum('revenue_source_type', [
  'manual',           // Manually entered by artist/admin
  'distributor',      // Music distributor (Spotify, Apple, etc.)
  'pro',              // Performance Rights Organization
  'sync',             // Sync licensing
  'merchandise',      // Merch sales
  'live',             // Live performance
  'direct',           // Direct sales on platform
  'secondary',        // Secondary market royalties
  'other',            // Other sources
]);

/**
 * Revenue event status
 */
export const revenueEventStatusEnum = pgEnum('revenue_event_status', [
  'pending',          // Awaiting processing
  'verified',         // Verified and ready for distribution
  'deposited',        // Deposited to dividend contract
  'distributed',      // Dividends distributed to holders
  'failed',           // Processing failed
  'disputed',         // Under dispute
]);

/**
 * Dividend event type
 */
export const dividendEventTypeEnum = pgEnum('dividend_event_type', [
  'deposit',          // Revenue deposited to contract
  'distribution',     // Dividends distributed to holders
  'claim',            // Holder claimed dividends
]);

// ============================================================
// TABLES
// ============================================================

/**
 * Revenue Events table - Inbound revenue records
 * 
 * Tracks revenue earned by masters from various sources.
 * Revenue is then deposited to dividend contracts for distribution.
 */
export const revenueEvents = pgTable('revenue_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  masterId: uuid('master_id').notNull().references(() => masters.id),
  
  // Revenue source
  sourceType: revenueSourceTypeEnum('source_type').notNull(),
  sourceName: varchar('source_name', { length: 200 }), // e.g., "Spotify", "ASCAP"
  externalReference: varchar('external_reference', { length: 255 }), // External ID from source
  
  // Revenue amount
  amount: numeric('amount', { precision: 28, scale: 8 }).notNull(), // High precision for small amounts
  currency: varchar('currency', { length: 10 }).notNull(), // "USD", "EUR", "ETH", "USDC"
  amountUsd: numeric('amount_usd', { precision: 28, scale: 8 }), // Converted to USD for analytics
  
  // Revenue period
  periodStart: timestamp('period_start', { withTimezone: true }),
  periodEnd: timestamp('period_end', { withTimezone: true }),
  
  // Processing status
  status: revenueEventStatusEnum('status').notNull().default('pending'),
  
  // Verification
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: uuid('verified_by'), // Admin or automated system
  
  // Deposit tracking (when deposited to dividend contract)
  depositedToContractId: uuid('deposited_to_contract_id').references(() => dividendContracts.id),
  depositTxHash: varchar('deposit_tx_hash', { length: 255 }),
  depositedAt: timestamp('deposited_at', { withTimezone: true }),
  
  // Supporting documentation
  documentUrl: text('document_url'),
  notes: text('notes'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('revenue_events_master_id_idx').on(table.masterId),
  index('revenue_events_source_type_idx').on(table.sourceType),
  index('revenue_events_status_idx').on(table.status),
  index('revenue_events_period_start_idx').on(table.periodStart),
  index('revenue_events_created_at_idx').on(table.createdAt),
]);

/**
 * Dividend Events table - On-chain dividend activities
 * 
 * Tracks dividend-related on-chain events:
 * - Revenue deposits to dividend contract
 * - Dividend distributions
 * - Holder claims
 * 
 * ON-CHAIN DATA: Indexed from blockchain events.
 */
export const dividendEvents = pgTable('dividend_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  masterId: uuid('master_id').references(() => masters.id),
  dividendContractId: uuid('dividend_contract_id').notNull().references(() => dividendContracts.id),
  
  // [ON-CHAIN] Event identity
  eventType: dividendEventTypeEnum('event_type').notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  contractAddress: varchar('contract_address', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Transaction details
  txHash: varchar('tx_hash', { length: 255 }).notNull(),
  blockNumber: numeric('block_number', { precision: 20, scale: 0 }).notNull(),
  logIndex: integer('log_index').notNull(),
  blockTimestamp: timestamp('block_timestamp', { withTimezone: true }).notNull(),
  
  // [ON-CHAIN] Event amounts
  totalAmount: numeric('total_amount', { precision: 78, scale: 0 }).notNull(),
  currency: varchar('currency', { length: 20 }).notNull(), // Token address or symbol
  
  // [ON-CHAIN] For claim events
  claimantWallet: varchar('claimant_wallet', { length: 255 }),
  claimantTokenId: numeric('claimant_token_id', { precision: 78, scale: 0 }),
  
  // [ON-CHAIN] Distribution details (if applicable)
  totalHoldersAtDistribution: integer('total_holders_at_distribution'),
  perTokenAmount: numeric('per_token_amount', { precision: 78, scale: 0 }),
  
  // Link to off-chain revenue event (if applicable)
  revenueEventId: uuid('revenue_event_id').references(() => revenueEvents.id),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique constraint on transaction + log
  uniqueIndex('dividend_events_tx_log_idx').on(table.txHash, table.logIndex),
  
  // Query indexes
  index('dividend_events_master_id_idx').on(table.masterId),
  index('dividend_events_contract_id_idx').on(table.dividendContractId),
  index('dividend_events_event_type_idx').on(table.eventType),
  index('dividend_events_block_number_idx').on(table.blockNumber),
  index('dividend_events_block_timestamp_idx').on(table.blockTimestamp),
  index('dividend_events_claimant_wallet_idx').on(table.claimantWallet),
]);

/**
 * Wallet Dividend Balances table - Per-wallet dividend tracking
 * 
 * Tracks dividend balances and claims per wallet per master.
 * Updated by indexer on dividend distributions and claims.
 * 
 * OFF-CHAIN DERIVED: Computed from on-chain events.
 */
export const walletDividendBalances = pgTable('wallet_dividend_balances', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Wallet and master
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  masterId: uuid('master_id').notNull().references(() => masters.id),
  dividendContractId: uuid('dividend_contract_id').notNull().references(() => dividendContracts.id),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  
  // Dividend tracking
  totalEarned: numeric('total_earned', { precision: 78, scale: 0 }).notNull().default('0'),
  totalClaimed: numeric('total_claimed', { precision: 78, scale: 0 }).notNull().default('0'),
  claimableAmount: numeric('claimable_amount', { precision: 78, scale: 0 }).notNull().default('0'), // DERIVED
  currency: varchar('currency', { length: 20 }).notNull(),
  
  // Claim tracking
  lastClaimedAt: timestamp('last_claimed_at', { withTimezone: true }),
  lastClaimTxHash: varchar('last_claim_tx_hash', { length: 255 }),
  
  // Holdings at last update
  tokensHeld: integer('tokens_held').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique constraint on wallet + master + chain
  uniqueIndex('wallet_dividends_wallet_master_chain_idx').on(table.walletAddress, table.masterId, table.chainId),
  
  // Query indexes
  index('wallet_dividends_wallet_idx').on(table.walletAddress),
  index('wallet_dividends_master_id_idx').on(table.masterId),
  index('wallet_dividends_claimable_idx').on(table.claimableAmount),
]);

/**
 * Dividend Claims table - Individual claim records
 * 
 * Detailed log of each dividend claim transaction.
 * Provides audit trail and analytics on claim behavior.
 * 
 * ON-CHAIN DATA: Indexed from blockchain.
 */
export const dividendClaims = pgTable('dividend_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  masterId: uuid('master_id').notNull().references(() => masters.id),
  dividendContractId: uuid('dividend_contract_id').notNull().references(() => dividendContracts.id),
  masterNftId: uuid('master_nft_id').references(() => masterNfts.id),
  
  // [ON-CHAIN] Claim details
  tokenId: numeric('token_id', { precision: 78, scale: 0 }),
  amountClaimed: numeric('amount_claimed', { precision: 78, scale: 0 }).notNull(),
  currency: varchar('currency', { length: 20 }).notNull(),
  
  // [ON-CHAIN] Transaction details
  txHash: varchar('tx_hash', { length: 255 }).notNull(),
  blockNumber: numeric('block_number', { precision: 20, scale: 0 }).notNull(),
  blockTimestamp: timestamp('block_timestamp', { withTimezone: true }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  
  // Gas costs
  gasUsed: numeric('gas_used', { precision: 20, scale: 0 }),
  gasPriceWei: numeric('gas_price_wei', { precision: 78, scale: 0 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique on tx hash
  uniqueIndex('dividend_claims_tx_hash_idx').on(table.txHash),
  
  // Query indexes
  index('dividend_claims_wallet_idx').on(table.walletAddress),
  index('dividend_claims_master_id_idx').on(table.masterId),
  index('dividend_claims_block_timestamp_idx').on(table.blockTimestamp),
]);

// ============================================================
// RELATIONS
// ============================================================

export const revenueEventsRelations = relations(revenueEvents, ({ one }) => ({
  master: one(masters, {
    fields: [revenueEvents.masterId],
    references: [masters.id],
  }),
  depositedToContract: one(dividendContracts, {
    fields: [revenueEvents.depositedToContractId],
    references: [dividendContracts.id],
  }),
}));

export const dividendEventsRelations = relations(dividendEvents, ({ one }) => ({
  master: one(masters, {
    fields: [dividendEvents.masterId],
    references: [masters.id],
  }),
  dividendContract: one(dividendContracts, {
    fields: [dividendEvents.dividendContractId],
    references: [dividendContracts.id],
  }),
  revenueEvent: one(revenueEvents, {
    fields: [dividendEvents.revenueEventId],
    references: [revenueEvents.id],
  }),
}));

export const walletDividendBalancesRelations = relations(walletDividendBalances, ({ one }) => ({
  master: one(masters, {
    fields: [walletDividendBalances.masterId],
    references: [masters.id],
  }),
  dividendContract: one(dividendContracts, {
    fields: [walletDividendBalances.dividendContractId],
    references: [dividendContracts.id],
  }),
}));

export const dividendClaimsRelations = relations(dividendClaims, ({ one }) => ({
  master: one(masters, {
    fields: [dividendClaims.masterId],
    references: [masters.id],
  }),
  dividendContract: one(dividendContracts, {
    fields: [dividendClaims.dividendContractId],
    references: [dividendContracts.id],
  }),
  masterNft: one(masterNfts, {
    fields: [dividendClaims.masterNftId],
    references: [masterNfts.id],
  }),
}));
