/**
 * AudiFi Database Schema - Master NFTs & Ownership
 * 
 * This module defines tables for individual Master NFTs,
 * transfer history, and ownership snapshots.
 * 
 * ON-CHAIN vs OFF-CHAIN:
 * - NFT ownership: On-chain (authoritative)
 * - Transfer history: On-chain (indexed for fast access)
 * - Mover advantage tracking: On-chain (mirrored)
 * - Ownership snapshots: Off-chain (derived for analytics)
 */

import { pgTable, uuid, varchar, numeric, timestamp, index, uniqueIndex, integer, text, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { masters, masterContracts } from './masters';

// ============================================================
// ENUMS
// ============================================================

/**
 * NFT listing status
 */
export const nftListingStatusEnum = pgEnum('nft_listing_status', [
  'not_listed',
  'listed',
  'in_escrow',
  'sold',
]);

/**
 * Transfer event type
 */
export const transferTypeEnum = pgEnum('transfer_type', [
  'mint',        // Initial mint
  'transfer',    // Regular transfer
  'sale',        // Secondary sale
  'burn',        // Token burn
  'claim',       // Airdrop/claim
]);

// ============================================================
// TABLES
// ============================================================

/**
 * Master NFTs table - Individual token records
 * 
 * Each row represents one token from a Master Contract.
 * 
 * ON-CHAIN DATA: Fields marked [ON-CHAIN] are authoritative on-chain.
 */
export const masterNfts = pgTable('master_nfts', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  masterId: uuid('master_id').notNull().references(() => masters.id),
  masterContractId: uuid('master_contract_id').notNull().references(() => masterContracts.id),
  
  // [ON-CHAIN] Token identity
  tokenId: numeric('token_id', { precision: 78, scale: 0 }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  contractAddress: varchar('contract_address', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Current ownership
  currentOwnerWallet: varchar('current_owner_wallet', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Mover Advantage tracking - first three minters
  isFirstMinter: boolean('is_first_minter').notNull().default(false),
  isSecondMinter: boolean('is_second_minter').notNull().default(false),
  isThirdMinter: boolean('is_third_minter').notNull().default(false),
  
  // [ON-CHAIN] Original minter (for royalty purposes)
  originalMinterWallet: varchar('original_minter_wallet', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Mint details
  mintTxHash: varchar('mint_tx_hash', { length: 255 }),
  mintedAtBlock: numeric('minted_at_block', { precision: 20, scale: 0 }),
  mintedAt: timestamp('minted_at', { withTimezone: true }),
  mintPriceWei: numeric('mint_price_wei', { precision: 78, scale: 0 }),
  
  // Listing status (platform-managed, may differ from on-chain marketplace)
  listingStatus: nftListingStatusEnum('listing_status').notNull().default('not_listed'),
  listingPriceWei: numeric('listing_price_wei', { precision: 78, scale: 0 }),
  listingCurrency: varchar('listing_currency', { length: 20 }),
  listedAt: timestamp('listed_at', { withTimezone: true }),
  
  // Token metadata URI
  tokenUri: text('token_uri'),
  
  // DERIVED: Dividend tracking
  totalDividendsReceived: numeric('total_dividends_received', { precision: 78, scale: 0 }).default('0'),
  lastDividendClaimedAt: timestamp('last_dividend_claimed_at', { withTimezone: true }),
  
  // Indexer metadata
  lastIndexedBlock: numeric('last_indexed_block', { precision: 20, scale: 0 }),
  lastIndexedAt: timestamp('last_indexed_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique constraint on chain + contract + token
  uniqueIndex('master_nfts_chain_contract_token_idx').on(table.chainId, table.contractAddress, table.tokenId),
  
  // Common query indexes
  index('master_nfts_master_id_idx').on(table.masterId),
  index('master_nfts_contract_id_idx').on(table.masterContractId),
  index('master_nfts_owner_wallet_idx').on(table.currentOwnerWallet),
  index('master_nfts_original_minter_idx').on(table.originalMinterWallet),
  index('master_nfts_listing_status_idx').on(table.listingStatus),
  index('master_nfts_minted_at_idx').on(table.mintedAt),
]);

/**
 * NFT Transfers table - Transfer event history
 * 
 * Normalized transfer events from blockchain.
 * Append-only table - never updated, only inserted.
 * 
 * ON-CHAIN DATA: All fields are derived from on-chain events.
 */
export const nftTransfers = pgTable('nft_transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  masterNftId: uuid('master_nft_id').notNull().references(() => masterNfts.id),
  masterId: uuid('master_id').notNull().references(() => masters.id),
  
  // [ON-CHAIN] Transfer event identity
  tokenId: numeric('token_id', { precision: 78, scale: 0 }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  contractAddress: varchar('contract_address', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Transfer parties
  fromWallet: varchar('from_wallet', { length: 255 }).notNull(),
  toWallet: varchar('to_wallet', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Transaction details
  txHash: varchar('tx_hash', { length: 255 }).notNull(),
  blockNumber: numeric('block_number', { precision: 20, scale: 0 }).notNull(),
  logIndex: integer('log_index').notNull(),
  blockTimestamp: timestamp('block_timestamp', { withTimezone: true }).notNull(),
  
  // Transfer classification
  transferType: transferTypeEnum('transfer_type').notNull(),
  
  // Sale details (if this was a sale)
  salePriceWei: numeric('sale_price_wei', { precision: 78, scale: 0 }),
  saleCurrency: varchar('sale_currency', { length: 20 }),
  marketplace: varchar('marketplace', { length: 100 }), // e.g., "OpenSea", "AudiFi", "Blur"
  
  // Royalty details (if applicable)
  royaltyPaidWei: numeric('royalty_paid_wei', { precision: 78, scale: 0 }),
  royaltyRecipient: varchar('royalty_recipient', { length: 255 }),
  
  // Created when indexed
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique constraint on transaction + log index
  uniqueIndex('nft_transfers_tx_log_idx').on(table.txHash, table.logIndex),
  
  // Common query indexes
  index('nft_transfers_master_nft_id_idx').on(table.masterNftId),
  index('nft_transfers_master_id_idx').on(table.masterId),
  index('nft_transfers_from_wallet_idx').on(table.fromWallet),
  index('nft_transfers_to_wallet_idx').on(table.toWallet),
  index('nft_transfers_block_number_idx').on(table.blockNumber),
  index('nft_transfers_block_timestamp_idx').on(table.blockTimestamp),
  index('nft_transfers_transfer_type_idx').on(table.transferType),
  index('nft_transfers_marketplace_idx').on(table.marketplace),
]);

/**
 * NFT Ownership Snapshots table - Historical ownership for analytics
 * 
 * Periodic snapshots of NFT ownership for:
 * - Dividend distribution calculations
 * - Historical analytics
 * - Airdrop eligibility
 * 
 * OFF-CHAIN DERIVED: Created by background jobs.
 */
export const nftOwnershipSnapshots = pgTable('nft_ownership_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Snapshot identity
  masterId: uuid('master_id').notNull().references(() => masters.id),
  tokenId: numeric('token_id', { precision: 78, scale: 0 }).notNull(),
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  contractAddress: varchar('contract_address', { length: 255 }).notNull(),
  
  // Owner at snapshot time
  ownerWallet: varchar('owner_wallet', { length: 255 }).notNull(),
  
  // Snapshot timing
  snapshotTimestamp: timestamp('snapshot_timestamp', { withTimezone: true }).notNull(),
  snapshotBlockNumber: numeric('snapshot_block_number', { precision: 20, scale: 0 }),
  
  // Snapshot context
  snapshotReason: varchar('snapshot_reason', { length: 50 }), // "daily", "dividend", "airdrop"
  
  // Created when snapshot taken
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Composite index for looking up ownership at a point in time
  index('nft_snapshots_master_token_time_idx').on(table.masterId, table.tokenId, table.snapshotTimestamp),
  index('nft_snapshots_owner_wallet_idx').on(table.ownerWallet),
  index('nft_snapshots_timestamp_idx').on(table.snapshotTimestamp),
  index('nft_snapshots_reason_idx').on(table.snapshotReason),
]);

// ============================================================
// RELATIONS
// ============================================================

export const masterNftsRelations = relations(masterNfts, ({ one, many }) => ({
  master: one(masters, {
    fields: [masterNfts.masterId],
    references: [masters.id],
  }),
  masterContract: one(masterContracts, {
    fields: [masterNfts.masterContractId],
    references: [masterContracts.id],
  }),
  transfers: many(nftTransfers),
}));

export const nftTransfersRelations = relations(nftTransfers, ({ one }) => ({
  masterNft: one(masterNfts, {
    fields: [nftTransfers.masterNftId],
    references: [masterNfts.id],
  }),
  master: one(masters, {
    fields: [nftTransfers.masterId],
    references: [masters.id],
  }),
}));
