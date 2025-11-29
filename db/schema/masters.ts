/**
 * AudiFi Database Schema - Masters & Master IPOs
 * 
 * This module defines tables for music masters, Master IPO configurations,
 * Master Contracts (ERC-721C), and Dividend Contracts.
 * 
 * ON-CHAIN vs OFF-CHAIN:
 * - Master metadata: Off-chain (IPFS + DB for fast access)
 * - Master Contracts: On-chain (DB mirrors contract state)
 * - Dividend Contracts: On-chain (DB mirrors contract state)
 * - IPO configuration: Off-chain (platform-managed)
 * 
 * DERIVED/AGGREGATED fields are marked with comments.
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, index, uniqueIndex, integer, numeric, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { artists, producers } from './artists';

// ============================================================
// ENUMS
// ============================================================

/**
 * Master type - track or album
 */
export const masterTypeEnum = pgEnum('master_type', [
  'track',
  'album',
]);

/**
 * Master status in the platform
 */
export const masterStatusEnum = pgEnum('master_status', [
  'draft',      // Initial creation
  'pending',    // Awaiting review/approval
  'approved',   // Ready for IPO
  'live',       // Active IPO or post-IPO
  'archived',   // Deprecated/removed
]);

/**
 * IPO status
 */
export const ipoStatusEnum = pgEnum('ipo_status', [
  'draft',       // Configuration in progress
  'scheduled',   // Scheduled for future launch
  'live',        // Currently accepting mints
  'closed',      // Minting closed, secondary trading active
  'cancelled',   // IPO was cancelled before completion
]);

/**
 * Distribution model for dividends
 */
export const dividendDistributionModelEnum = pgEnum('dividend_distribution_model', [
  'per_master',   // Separate dividend contract per master
  'per_artist',   // Shared dividend contract for all artist's masters
  'platform',     // Platform-wide dividend pool
]);

// ============================================================
// TABLES
// ============================================================

/**
 * Masters table - Track/Album master recordings
 * 
 * Represents a music master (single track or album) that can be
 * offered in a Master IPO.
 */
export const masters = pgTable('masters', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Ownership
  artistId: uuid('artist_id').notNull().references(() => artists.id),
  
  // Core metadata
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  masterType: masterTypeEnum('master_type').notNull().default('track'),
  status: masterStatusEnum('status').notNull().default('draft'),
  
  // Music metadata
  genre: varchar('genre', { length: 100 }),
  bpm: integer('bpm'),
  duration: integer('duration'), // Duration in seconds
  releaseDate: timestamp('release_date', { withTimezone: true }),
  isrc: varchar('isrc', { length: 12 }), // International Standard Recording Code
  
  // Tags and categorization
  moodTags: jsonb('mood_tags').$type<string[]>().default([]),
  
  // Media files
  audioFileName: varchar('audio_file_name', { length: 255 }),
  audioIpfsHash: varchar('audio_ipfs_hash', { length: 100 }),
  coverImageUrl: text('cover_image_url'),
  coverImageIpfsHash: varchar('cover_image_ipfs_hash', { length: 100 }),
  
  // Metadata IPFS (complete metadata JSON)
  metadataIpfsHash: varchar('metadata_ipfs_hash', { length: 100 }),
  
  // Extended metadata JSON (flexible structure)
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
}, (table) => [
  index('masters_artist_id_idx').on(table.artistId),
  index('masters_status_idx').on(table.status),
  index('masters_genre_idx').on(table.genre),
  index('masters_release_date_idx').on(table.releaseDate),
  index('masters_created_at_idx').on(table.createdAt),
]);

/**
 * Master Collaborators table - Producer/collaborator credits
 * 
 * Links masters to producers and other collaborators.
 */
export const masterCollaborators = pgTable('master_collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  masterId: uuid('master_id').notNull().references(() => masters.id, { onDelete: 'cascade' }),
  producerId: uuid('producer_id').references(() => producers.id),
  
  // Collaborator details (if not a registered producer)
  collaboratorName: varchar('collaborator_name', { length: 150 }),
  role: varchar('role', { length: 100 }).notNull(), // e.g., "Producer", "Mixer", "Featured Artist"
  
  // Revenue split (percentage * 100 for precision, e.g., 1500 = 15%)
  splitBasisPoints: integer('split_basis_points').notNull().default(0),
  
  // Credit order
  displayOrder: integer('display_order').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('master_collaborators_master_id_idx').on(table.masterId),
  index('master_collaborators_producer_id_idx').on(table.producerId),
]);

/**
 * Master IPOs table - IPO configuration per master
 * 
 * Defines the Initial Public Offering parameters for a master.
 */
export const masterIpos = pgTable('master_ipos', {
  id: uuid('id').primaryKey().defaultRandom(),
  masterId: uuid('master_id').notNull().references(() => masters.id),
  
  // Supply configuration
  totalSupply: integer('total_supply').notNull(), // 1 to 1,000,000
  mintedSupply: integer('minted_supply').notNull().default(0), // DERIVED: updated via indexer
  
  // Pricing
  mintPriceWei: numeric('mint_price_wei', { precision: 78, scale: 0 }), // Price in smallest unit
  mintPriceCurrency: varchar('mint_price_currency', { length: 20 }), // e.g., "ETH", "USDC"
  
  // Revenue share configuration (basis points, 10000 = 100%)
  revenueShareNftHoldersBps: integer('revenue_share_nft_holders_bps').notNull().default(5000), // Default 50%
  retainedArtistBps: integer('retained_artist_bps').notNull().default(4000), // Default 40%
  retainedPlatformBps: integer('retained_platform_bps').notNull().default(1000), // Default 10%
  
  // IPO timing
  status: ipoStatusEnum('status').notNull().default('draft'),
  scheduledStartAt: timestamp('scheduled_start_at', { withTimezone: true }),
  scheduledEndAt: timestamp('scheduled_end_at', { withTimezone: true }),
  actualStartAt: timestamp('actual_start_at', { withTimezone: true }),
  actualEndAt: timestamp('actual_end_at', { withTimezone: true }),
  
  // Mover Advantage configuration
  moverAdvantageEnabled: boolean('mover_advantage_enabled').notNull().default(true),
  firstMinterBonusBps: integer('first_minter_bonus_bps').default(300), // Extra 3% for first minter
  secondMinterBonusBps: integer('second_minter_bonus_bps').default(200), // Extra 2%
  thirdMinterBonusBps: integer('third_minter_bonus_bps').default(100), // Extra 1%
  
  // Resale configuration
  secondaryRoyaltyBps: integer('secondary_royalty_bps').notNull().default(1000), // 10% on resales
  allowSecondaryResale: boolean('allow_secondary_resale').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('master_ipos_master_id_idx').on(table.masterId),
  index('master_ipos_status_idx').on(table.status),
  index('master_ipos_start_at_idx').on(table.scheduledStartAt),
]);

/**
 * Master Contracts table - On-chain Master Contract mirrors
 * 
 * Mirrors deployed ERC-721C Master Contracts on blockchain.
 * 
 * ON-CHAIN DATA: Fields marked with [ON-CHAIN] are authoritative on-chain.
 * This table is a mirror for fast querying.
 */
export const masterContracts = pgTable('master_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  masterId: uuid('master_id').notNull().references(() => masters.id),
  
  // [ON-CHAIN] Blockchain identity
  chainId: varchar('chain_id', { length: 50 }).notNull(), // e.g., "1", "137", "solana"
  contractAddress: varchar('contract_address', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Deployment details
  deploymentTxHash: varchar('deployment_tx_hash', { length: 255 }),
  deployedAtBlock: numeric('deployed_at_block', { precision: 20, scale: 0 }),
  deployedAt: timestamp('deployed_at', { withTimezone: true }),
  
  // [ON-CHAIN] Contract configuration (immutable after deployment)
  contractTotalSupply: integer('contract_total_supply'),
  contractRoyaltyBps: integer('contract_royalty_bps'),
  
  // [ON-CHAIN] Mover Advantage tracking
  firstMinterWallet: varchar('first_minter_wallet', { length: 255 }),
  secondMinterWallet: varchar('second_minter_wallet', { length: 255 }),
  thirdMinterWallet: varchar('third_minter_wallet', { length: 255 }),
  
  // Contract ABI version (for future upgrades)
  abiVersion: varchar('abi_version', { length: 20 }).default('1.0'),
  
  // Indexer metadata
  lastIndexedBlock: numeric('last_indexed_block', { precision: 20, scale: 0 }),
  lastIndexedAt: timestamp('last_indexed_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('master_contracts_chain_address_idx').on(table.chainId, table.contractAddress),
  uniqueIndex('master_contracts_master_chain_idx').on(table.masterId, table.chainId),
  index('master_contracts_master_id_idx').on(table.masterId),
]);

/**
 * Dividend Contracts table - On-chain Dividend Contract mirrors
 * 
 * Mirrors deployed Dividend Contracts that handle revenue distribution.
 * 
 * ON-CHAIN DATA: This table mirrors on-chain state.
 */
export const dividendContracts = pgTable('dividend_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Link to master OR artist (depending on distribution model)
  masterId: uuid('master_id').references(() => masters.id),
  artistId: uuid('artist_id').references(() => artists.id),
  
  // Distribution model
  distributionModel: dividendDistributionModelEnum('distribution_model').notNull(),
  
  // [ON-CHAIN] Blockchain identity
  chainId: varchar('chain_id', { length: 50 }).notNull(),
  contractAddress: varchar('contract_address', { length: 255 }).notNull(),
  
  // [ON-CHAIN] Deployment details
  deploymentTxHash: varchar('deployment_tx_hash', { length: 255 }),
  deployedAtBlock: numeric('deployed_at_block', { precision: 20, scale: 0 }),
  deployedAt: timestamp('deployed_at', { withTimezone: true }),
  
  // [ON-CHAIN] Linked Master Contract (if per-master model)
  linkedMasterContract: varchar('linked_master_contract', { length: 255 }),
  
  // DERIVED: Running totals (updated by indexer)
  totalRevenueDeposited: numeric('total_revenue_deposited', { precision: 78, scale: 0 }).default('0'),
  totalDividendsDistributed: numeric('total_dividends_distributed', { precision: 78, scale: 0 }).default('0'),
  
  // Indexer metadata
  lastIndexedBlock: numeric('last_indexed_block', { precision: 20, scale: 0 }),
  lastIndexedAt: timestamp('last_indexed_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('dividend_contracts_chain_address_idx').on(table.chainId, table.contractAddress),
  index('dividend_contracts_master_id_idx').on(table.masterId),
  index('dividend_contracts_artist_id_idx').on(table.artistId),
]);

// ============================================================
// RELATIONS
// ============================================================

export const mastersRelations = relations(masters, ({ one, many }) => ({
  artist: one(artists, {
    fields: [masters.artistId],
    references: [artists.id],
  }),
  collaborators: many(masterCollaborators),
  ipo: one(masterIpos, {
    fields: [masters.id],
    references: [masterIpos.masterId],
  }),
  contracts: many(masterContracts),
  dividendContracts: many(dividendContracts),
}));

export const masterCollaboratorsRelations = relations(masterCollaborators, ({ one }) => ({
  master: one(masters, {
    fields: [masterCollaborators.masterId],
    references: [masters.id],
  }),
  producer: one(producers, {
    fields: [masterCollaborators.producerId],
    references: [producers.id],
  }),
}));

export const masterIposRelations = relations(masterIpos, ({ one }) => ({
  master: one(masters, {
    fields: [masterIpos.masterId],
    references: [masters.id],
  }),
}));

export const masterContractsRelations = relations(masterContracts, ({ one }) => ({
  master: one(masters, {
    fields: [masterContracts.masterId],
    references: [masters.id],
  }),
}));

export const dividendContractsRelations = relations(dividendContracts, ({ one }) => ({
  master: one(masters, {
    fields: [dividendContracts.masterId],
    references: [masters.id],
  }),
  artist: one(artists, {
    fields: [dividendContracts.artistId],
    references: [artists.id],
  }),
}));
