/**
 * AudiFi Database Schema - Artists & Profiles
 * 
 * This module defines tables for artist and producer profiles,
 * extending the core user identity with music industry specific data.
 * 
 * ON-CHAIN vs OFF-CHAIN:
 * - Artist profiles: Off-chain (platform-managed)
 * - Associated wallets: Off-chain mirror
 * - Social/music platform links: Off-chain
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, index, uniqueIndex, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './identity';

// ============================================================
// TABLES
// ============================================================

/**
 * Artists table - Artist profile
 * 
 * Extended profile for users with the artist role.
 * Contains artist-specific information beyond basic user data.
 */
export const artists = pgTable('artists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Artist identity
  artistName: varchar('artist_name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(), // URL-friendly identifier
  
  // Profile content
  bio: text('bio'),
  shortBio: varchar('short_bio', { length: 280 }), // Twitter-length summary
  genre: varchar('genre', { length: 100 }),
  location: varchar('location', { length: 200 }),
  
  // Media
  profileImageUrl: text('profile_image_url'),
  bannerImageUrl: text('banner_image_url'),
  
  // Social media links (JSON for flexibility)
  socialLinks: jsonb('social_links').$type<{
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;
  }>(),
  
  // Music platform links
  musicPlatforms: jsonb('music_platforms').$type<{
    spotify?: string;
    appleMusic?: string;
    soundcloud?: string;
    bandcamp?: string;
    tidal?: string;
    youtube?: string;
  }>(),
  
  // Verification & status
  isVerified: boolean('is_verified').notNull().default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  
  // Statistics (cached/derived - refreshed periodically)
  totalMasters: integer('total_masters').notNull().default(0),
  totalSales: integer('total_sales').notNull().default(0),
  followerCount: integer('follower_count').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('artists_user_id_idx').on(table.userId),
  uniqueIndex('artists_slug_idx').on(table.slug),
  index('artists_name_idx').on(table.artistName),
  index('artists_genre_idx').on(table.genre),
  index('artists_verified_idx').on(table.isVerified),
]);

/**
 * Producers table - Producer profile
 * 
 * Extended profile for users with the producer role.
 * Producers can collaborate on masters with artists.
 */
export const producers = pgTable('producers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Producer identity
  producerName: varchar('producer_name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(),
  
  // Profile content
  bio: text('bio'),
  specialty: varchar('specialty', { length: 200 }), // e.g., "Hip-hop beats", "Electronic production"
  
  // Media
  profileImageUrl: text('profile_image_url'),
  
  // Social links
  socialLinks: jsonb('social_links').$type<{
    instagram?: string;
    twitter?: string;
    website?: string;
  }>(),
  
  // Verification
  isVerified: boolean('is_verified').notNull().default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  
  // Statistics (cached/derived)
  totalCredits: integer('total_credits').notNull().default(0), // Masters produced
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('producers_user_id_idx').on(table.userId),
  uniqueIndex('producers_slug_idx').on(table.slug),
  index('producers_name_idx').on(table.producerName),
]);

/**
 * Artist Follows table - Following relationships
 * 
 * Tracks which users follow which artists.
 */
export const artistFollows = pgTable('artist_follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  artistId: uuid('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // When the follow happened
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('artist_follows_artist_follower_idx').on(table.artistId, table.followerId),
  index('artist_follows_artist_id_idx').on(table.artistId),
  index('artist_follows_follower_id_idx').on(table.followerId),
]);

// ============================================================
// RELATIONS
// ============================================================

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, {
    fields: [artists.userId],
    references: [users.id],
  }),
  followers: many(artistFollows),
}));

export const producersRelations = relations(producers, ({ one }) => ({
  user: one(users, {
    fields: [producers.userId],
    references: [users.id],
  }),
}));

export const artistFollowsRelations = relations(artistFollows, ({ one }) => ({
  artist: one(artists, {
    fields: [artistFollows.artistId],
    references: [artists.id],
  }),
  follower: one(users, {
    fields: [artistFollows.followerId],
    references: [users.id],
  }),
}));
