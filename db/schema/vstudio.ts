/**
 * AudiFi Database Schema - V Studio & Interactions
 * 
 * This module defines tables for V Studio sessions, decision points,
 * polls, votes, and engagement tracking.
 * 
 * ON-CHAIN vs OFF-CHAIN:
 * - Sessions: Off-chain (platform-managed)
 * - Decision points/polls: Off-chain (platform-managed)
 * - Votes: Off-chain (may have on-chain verification for NFT holders)
 * - Engagement metrics: Off-chain (analytics)
 * 
 * Eligibility for voting may be verified against on-chain data
 * (NFT ownership, coin holdings, subscription status).
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, index, uniqueIndex, integer, numeric, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { masters } from './masters';
import { artists } from './artists';
import { users } from './identity';

// ============================================================
// ENUMS
// ============================================================

/**
 * V Studio session status
 */
export const vstudioSessionStatusEnum = pgEnum('vstudio_session_status', [
  'draft',        // Session being configured
  'scheduled',    // Scheduled for future
  'live',         // Currently active
  'locked',       // Voting closed, results pending
  'completed',    // Results finalized
  'ipo_launched', // IPO launched based on session
  'cancelled',    // Session was cancelled
]);

/**
 * Decision point type
 */
export const decisionPointTypeEnum = pgEnum('decision_point_type', [
  'poll',         // Multiple choice poll
  'slider',       // Numeric slider (e.g., 1-10 rating)
  'ranking',      // Rank options in order
  'open_text',    // Open-ended text response
  'binary',       // Yes/No decision
]);

/**
 * Eligibility rule for voting
 */
export const eligibilityRuleEnum = pgEnum('eligibility_rule', [
  'open',              // Anyone can vote
  'authenticated',     // Must be logged in
  'nft_holders',       // Must hold master NFT
  'coin_holders',      // Must hold artist coin
  'subscribers',       // Must be subscribed
  'superfans',         // NFT + coin holders
  'whitelist',         // Custom whitelist
]);

/**
 * Engagement event type
 */
export const engagementEventTypeEnum = pgEnum('engagement_event_type', [
  'session_view',
  'session_join',
  'vote_cast',
  'chat_message',
  'reaction',
  'share',
  'bookmark',
]);

// ============================================================
// TABLES
// ============================================================

/**
 * V Studio Sessions table - Interactive sessions
 * 
 * A V Studio session is tied to a master, allowing fans to
 * participate in creative decisions before/during IPO.
 */
export const vstudioSessions = pgTable('vstudio_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  masterId: uuid('master_id').notNull().references(() => masters.id),
  artistId: uuid('artist_id').notNull().references(() => artists.id),
  
  // Session identity
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 150 }), // URL-friendly identifier
  
  // Session type/theme
  sessionType: varchar('session_type', { length: 50 }), // e.g., "cover_art", "mix_feedback", "naming"
  
  // Status
  status: vstudioSessionStatusEnum('status').notNull().default('draft'),
  
  // Timing
  scheduledStartAt: timestamp('scheduled_start_at', { withTimezone: true }),
  scheduledEndAt: timestamp('scheduled_end_at', { withTimezone: true }),
  actualStartAt: timestamp('actual_start_at', { withTimezone: true }),
  actualEndAt: timestamp('actual_end_at', { withTimezone: true }),
  
  // Configuration
  isPublic: boolean('is_public').notNull().default(true),
  allowAnonymous: boolean('allow_anonymous').notNull().default(false),
  maxParticipants: integer('max_participants'), // null = unlimited
  
  // Branding
  coverImageUrl: text('cover_image_url'),
  backgroundColor: varchar('background_color', { length: 20 }),
  
  // Engagement stats (DERIVED - updated periodically)
  participantCount: integer('participant_count').notNull().default(0),
  totalVotes: integer('total_votes').notNull().default(0),
  peakConcurrentViewers: integer('peak_concurrent_viewers').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('vstudio_sessions_slug_idx').on(table.slug),
  index('vstudio_sessions_master_id_idx').on(table.masterId),
  index('vstudio_sessions_artist_id_idx').on(table.artistId),
  index('vstudio_sessions_status_idx').on(table.status),
  index('vstudio_sessions_start_at_idx').on(table.scheduledStartAt),
]);

/**
 * V Studio Decision Points table - Individual decisions
 * 
 * Each decision point is a specific question/vote within a session.
 */
export const vstudioDecisionPoints = pgTable('vstudio_decision_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  vstudioSessionId: uuid('vstudio_session_id').notNull().references(() => vstudioSessions.id, { onDelete: 'cascade' }),
  
  // Decision identity
  type: decisionPointTypeEnum('type').notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  description: text('description'),
  
  // Options (for poll/ranking types)
  options: jsonb('options').$type<Array<{
    id: string;
    label: string;
    imageUrl?: string;
    audioUrl?: string;
    metadata?: Record<string, unknown>;
  }>>(),
  
  // Slider configuration (for slider type)
  sliderMin: integer('slider_min'),
  sliderMax: integer('slider_max'),
  sliderStep: integer('slider_step'),
  sliderLabels: jsonb('slider_labels').$type<{ min?: string; max?: string; mid?: string }>(),
  
  // Eligibility
  eligibilityRule: eligibilityRuleEnum('eligibility_rule').notNull().default('open'),
  eligibilityConfig: jsonb('eligibility_config').$type<{
    minTokenBalance?: string;
    requiredNftCount?: number;
    whitelistAddresses?: string[];
  }>(),
  
  // Voting weight configuration
  superfanWeightMultiplier: numeric('superfan_weight_multiplier', { precision: 5, scale: 2 }).default('1.0'),
  nftHolderWeight: numeric('nft_holder_weight', { precision: 5, scale: 2 }).default('1.0'),
  
  // Timing
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(false),
  
  // Display order
  displayOrder: integer('display_order').notNull().default(0),
  
  // Results (DERIVED - computed when voting closes)
  resultsJson: jsonb('results_json').$type<{
    totalVotes: number;
    optionResults?: Array<{ optionId: string; voteCount: number; percentage: number }>;
    averageValue?: number;
    winningOption?: string;
  }>(),
  resultsComputedAt: timestamp('results_computed_at', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('vstudio_decision_points_session_id_idx').on(table.vstudioSessionId),
  index('vstudio_decision_points_type_idx').on(table.type),
  index('vstudio_decision_points_active_idx').on(table.isActive),
  index('vstudio_decision_points_order_idx').on(table.displayOrder),
]);

/**
 * V Studio Votes table - Individual vote records
 * 
 * Each vote cast by a user/wallet on a decision point.
 */
export const vstudioVotes = pgTable('vstudio_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  decisionPointId: uuid('decision_point_id').notNull().references(() => vstudioDecisionPoints.id, { onDelete: 'cascade' }),
  vstudioSessionId: uuid('vstudio_session_id').notNull().references(() => vstudioSessions.id),
  
  // Voter identity (one of these should be set)
  userId: uuid('user_id').references(() => users.id),
  walletAddress: varchar('wallet_address', { length: 255 }),
  anonymousId: varchar('anonymous_id', { length: 100 }), // For anonymous voting
  
  // Vote content
  optionSelected: varchar('option_selected', { length: 100 }), // Option ID for poll/ranking
  sliderValue: numeric('slider_value', { precision: 10, scale: 2 }), // For slider type
  textResponse: text('text_response'), // For open text
  rankingOrder: jsonb('ranking_order').$type<string[]>(), // For ranking type
  
  // Vote weight (calculated based on eligibility)
  weight: numeric('weight', { precision: 10, scale: 4 }).notNull().default('1.0'),
  
  // Verification (if applicable)
  verifiedNftHolder: boolean('verified_nft_holder').notNull().default(false),
  verifiedCoinHolder: boolean('verified_coin_holder').notNull().default(false),
  verifiedSubscriber: boolean('verified_subscriber').notNull().default(false),
  
  // Client metadata
  clientIpHash: varchar('client_ip_hash', { length: 64 }), // For fraud detection
  userAgent: varchar('user_agent', { length: 500 }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique vote per user per decision (if user authenticated)
  uniqueIndex('vstudio_votes_user_decision_idx').on(table.userId, table.decisionPointId),
  uniqueIndex('vstudio_votes_wallet_decision_idx').on(table.walletAddress, table.decisionPointId),
  
  // Query indexes
  index('vstudio_votes_decision_point_idx').on(table.decisionPointId),
  index('vstudio_votes_session_id_idx').on(table.vstudioSessionId),
  index('vstudio_votes_user_id_idx').on(table.userId),
  index('vstudio_votes_wallet_idx').on(table.walletAddress),
  index('vstudio_votes_created_at_idx').on(table.createdAt),
]);

/**
 * V Studio Participants table - Session participation tracking
 * 
 * Tracks who participated in a session for engagement analytics.
 */
export const vstudioParticipants = pgTable('vstudio_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  vstudioSessionId: uuid('vstudio_session_id').notNull().references(() => vstudioSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  walletAddress: varchar('wallet_address', { length: 255 }),
  
  // Participation details
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  
  // Engagement metrics
  votesCount: integer('votes_count').notNull().default(0),
  messagesCount: integer('messages_count').notNull().default(0),
  reactionsCount: integer('reactions_count').notNull().default(0),
  totalTimeSeconds: integer('total_time_seconds').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Unique participant per session
  uniqueIndex('vstudio_participants_session_user_idx').on(table.vstudioSessionId, table.userId),
  uniqueIndex('vstudio_participants_session_wallet_idx').on(table.vstudioSessionId, table.walletAddress),
  
  // Query indexes
  index('vstudio_participants_session_id_idx').on(table.vstudioSessionId),
  index('vstudio_participants_user_id_idx').on(table.userId),
]);

/**
 * V Studio Engagement Events table - Granular engagement tracking
 * 
 * Logs individual engagement events for detailed analytics.
 * High-volume table - consider partitioning/archiving.
 */
export const vstudioEngagementEvents = pgTable('vstudio_engagement_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  vstudioSessionId: uuid('vstudio_session_id').notNull().references(() => vstudioSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  walletAddress: varchar('wallet_address', { length: 255 }),
  
  // Event details
  eventType: engagementEventTypeEnum('event_type').notNull(),
  eventData: jsonb('event_data').$type<Record<string, unknown>>(),
  
  // Context
  decisionPointId: uuid('decision_point_id').references(() => vstudioDecisionPoints.id),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('vstudio_events_session_id_idx').on(table.vstudioSessionId),
  index('vstudio_events_event_type_idx').on(table.eventType),
  index('vstudio_events_created_at_idx').on(table.createdAt),
]);

/**
 * V Studio Chat Messages table - Session chat (optional)
 * 
 * Stores chat messages during V Studio sessions.
 * May be disabled or moderated based on session settings.
 */
export const vstudioChatMessages = pgTable('vstudio_chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Links
  vstudioSessionId: uuid('vstudio_session_id').notNull().references(() => vstudioSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  
  // Message content
  message: text('message').notNull(),
  
  // Moderation
  isModerated: boolean('is_moderated').notNull().default(false),
  moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  moderatedBy: uuid('moderated_by').references(() => users.id),
  moderationReason: varchar('moderation_reason', { length: 200 }),
  
  // Display
  isHighlighted: boolean('is_highlighted').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('vstudio_chat_session_id_idx').on(table.vstudioSessionId),
  index('vstudio_chat_user_id_idx').on(table.userId),
  index('vstudio_chat_created_at_idx').on(table.createdAt),
]);

// ============================================================
// RELATIONS
// ============================================================

export const vstudioSessionsRelations = relations(vstudioSessions, ({ one, many }) => ({
  master: one(masters, {
    fields: [vstudioSessions.masterId],
    references: [masters.id],
  }),
  artist: one(artists, {
    fields: [vstudioSessions.artistId],
    references: [artists.id],
  }),
  decisionPoints: many(vstudioDecisionPoints),
  votes: many(vstudioVotes),
  participants: many(vstudioParticipants),
  engagementEvents: many(vstudioEngagementEvents),
  chatMessages: many(vstudioChatMessages),
}));

export const vstudioDecisionPointsRelations = relations(vstudioDecisionPoints, ({ one, many }) => ({
  session: one(vstudioSessions, {
    fields: [vstudioDecisionPoints.vstudioSessionId],
    references: [vstudioSessions.id],
  }),
  votes: many(vstudioVotes),
}));

export const vstudioVotesRelations = relations(vstudioVotes, ({ one }) => ({
  decisionPoint: one(vstudioDecisionPoints, {
    fields: [vstudioVotes.decisionPointId],
    references: [vstudioDecisionPoints.id],
  }),
  session: one(vstudioSessions, {
    fields: [vstudioVotes.vstudioSessionId],
    references: [vstudioSessions.id],
  }),
  user: one(users, {
    fields: [vstudioVotes.userId],
    references: [users.id],
  }),
}));

export const vstudioParticipantsRelations = relations(vstudioParticipants, ({ one }) => ({
  session: one(vstudioSessions, {
    fields: [vstudioParticipants.vstudioSessionId],
    references: [vstudioSessions.id],
  }),
  user: one(users, {
    fields: [vstudioParticipants.userId],
    references: [users.id],
  }),
}));

export const vstudioEngagementEventsRelations = relations(vstudioEngagementEvents, ({ one }) => ({
  session: one(vstudioSessions, {
    fields: [vstudioEngagementEvents.vstudioSessionId],
    references: [vstudioSessions.id],
  }),
  user: one(users, {
    fields: [vstudioEngagementEvents.userId],
    references: [users.id],
  }),
  decisionPoint: one(vstudioDecisionPoints, {
    fields: [vstudioEngagementEvents.decisionPointId],
    references: [vstudioDecisionPoints.id],
  }),
}));

export const vstudioChatMessagesRelations = relations(vstudioChatMessages, ({ one }) => ({
  session: one(vstudioSessions, {
    fields: [vstudioChatMessages.vstudioSessionId],
    references: [vstudioSessions.id],
  }),
  user: one(users, {
    fields: [vstudioChatMessages.userId],
    references: [users.id],
  }),
}));
