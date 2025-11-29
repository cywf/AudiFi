/**
 * AudiFi Database Schema - Main Export
 * 
 * This file exports all schema definitions for use with Drizzle ORM.
 * 
 * Schema Modules:
 * - identity: Users, accounts, roles, wallets
 * - artists: Artist and producer profiles
 * - masters: Masters, Master IPOs, contracts
 * - nfts: Master NFTs, transfers, ownership
 * - revenue: Revenue events, dividends, claims
 * - artistCoin: Artist tokens, liquidity pools
 * - vstudio: V Studio sessions, votes, engagement
 * - subscriptions: Billing, invoices, payments
 * - observability: Audit logs, security events
 */

// ============================================================
// IDENTITY & ROLES
// ============================================================
export {
  // Enums
  userRoleEnum,
  authProviderEnum,
  accountStatusEnum,
  // Tables
  users,
  accounts,
  identityProviders,
  roles,
  userRoles,
  userWallets,
  // Relations
  usersRelations,
  accountsRelations,
  rolesRelations,
  userRolesRelations,
  userWalletsRelations,
} from './identity';

// ============================================================
// ARTISTS & PROFILES
// ============================================================
export {
  // Tables
  artists,
  producers,
  artistFollows,
  // Relations
  artistsRelations,
  producersRelations,
  artistFollowsRelations,
} from './artists';

// ============================================================
// MASTERS & MASTER IPOs
// ============================================================
export {
  // Enums
  masterTypeEnum,
  masterStatusEnum,
  ipoStatusEnum,
  dividendDistributionModelEnum,
  // Tables
  masters,
  masterCollaborators,
  masterIpos,
  masterContracts,
  dividendContracts,
  // Relations
  mastersRelations,
  masterCollaboratorsRelations,
  masterIposRelations,
  masterContractsRelations,
  dividendContractsRelations,
} from './masters';

// ============================================================
// MASTER NFTs & OWNERSHIP
// ============================================================
export {
  // Enums
  nftListingStatusEnum,
  transferTypeEnum,
  // Tables
  masterNfts,
  nftTransfers,
  nftOwnershipSnapshots,
  // Relations
  masterNftsRelations,
  nftTransfersRelations,
} from './nfts';

// ============================================================
// REVENUE & DIVIDENDS
// ============================================================
export {
  // Enums
  revenueSourceTypeEnum,
  revenueEventStatusEnum,
  dividendEventTypeEnum,
  // Tables
  revenueEvents,
  dividendEvents,
  walletDividendBalances,
  dividendClaims,
  // Relations
  revenueEventsRelations,
  dividendEventsRelations,
  walletDividendBalancesRelations,
  dividendClaimsRelations,
} from './revenue';

// ============================================================
// ARTIST COIN & LIQUIDITY
// ============================================================
export {
  // Enums
  tokenTypeEnum,
  poolTypeEnum,
  poolEventTypeEnum,
  // Tables
  artistTokens,
  tokenHolders,
  liquidityPools,
  poolPositions,
  poolEvents,
  // Relations
  artistTokensRelations,
  tokenHoldersRelations,
  liquidityPoolsRelations,
  poolPositionsRelations,
  poolEventsRelations,
} from './artistCoin';

// ============================================================
// V STUDIO & INTERACTIONS
// ============================================================
export {
  // Enums
  vstudioSessionStatusEnum,
  decisionPointTypeEnum,
  eligibilityRuleEnum,
  engagementEventTypeEnum,
  // Tables
  vstudioSessions,
  vstudioDecisionPoints,
  vstudioVotes,
  vstudioParticipants,
  vstudioEngagementEvents,
  vstudioChatMessages,
  // Relations
  vstudioSessionsRelations,
  vstudioDecisionPointsRelations,
  vstudioVotesRelations,
  vstudioParticipantsRelations,
  vstudioEngagementEventsRelations,
  vstudioChatMessagesRelations,
} from './vstudio';

// ============================================================
// SUBSCRIPTIONS & BILLING
// ============================================================
export {
  // Enums
  planIntervalEnum,
  subscriptionStatusEnum,
  invoiceStatusEnum,
  paymentProviderTypeEnum,
  webhookStatusEnum,
  // Tables
  subscriptionPlans,
  subscriptions,
  invoices,
  paymentProviders,
  webhooksLog,
  paymentMethods,
  // Relations
  subscriptionPlansRelations,
  subscriptionsRelations,
  invoicesRelations,
  webhooksLogRelations,
  paymentMethodsRelations,
} from './subscriptions';

// ============================================================
// OBSERVABILITY & SECURITY
// ============================================================
export {
  // Enums
  auditActionCategoryEnum,
  securitySeverityEnum,
  securityEventTypeEnum,
  // Tables
  auditLogs,
  securityEvents,
  systemEvents,
  rateLimits,
  // Relations
  auditLogsRelations,
  securityEventsRelations,
} from './observability';
