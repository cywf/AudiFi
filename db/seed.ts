/**
 * AudiFi Database Seed Script
 * 
 * Populates the database with development data.
 * Run with: npx tsx db/seed.ts
 * 
 * WARNING: This script is for development only.
 * Never run in production.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.AUDIFI_DATABASE_URL;

if (!connectionString) {
  console.error('❌ AUDIFI_DATABASE_URL not set');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ============================================================
    // 1. ROLES
    // ============================================================
    console.log('Creating roles...');
    const [viewerRole, artistRole, producerRole, adminRole] = await db
      .insert(schema.roles)
      .values([
        { name: 'viewer', description: 'Default role - can view content and participate in V Studio' },
        { name: 'artist', description: 'Can create masters, launch IPOs, and manage artist profile' },
        { name: 'producer', description: 'Can collaborate on masters with artists' },
        { name: 'admin', description: 'Platform administrator with full access' },
      ])
      .returning();
    console.log(`  ✓ Created ${4} roles\n`);

    // ============================================================
    // 2. SUBSCRIPTION PLANS
    // ============================================================
    console.log('Creating subscription plans...');
    const [freePlan, proPlan] = await db
      .insert(schema.subscriptionPlans)
      .values([
        {
          name: 'Free',
          slug: 'free',
          description: 'Get started with AudiFi for free',
          priceUsd: '0',
          interval: 'monthly',
          maxMasters: 1,
          maxIposPerMonth: 1,
          vstudioSessionsIncluded: 1,
          features: {
            advancedAnalytics: false,
            prioritySupport: false,
            customBranding: false,
            apiAccess: false,
          },
          featureList: [
            'Create and deploy 1 Master',
            'Basic analytics',
            'IPFS storage',
            'Perpetual royalties',
            'Community support',
          ],
          displayOrder: 0,
        },
        {
          name: 'Pro',
          slug: 'pro',
          description: 'For serious artists and producers',
          priceUsd: '15',
          interval: 'monthly',
          maxMasters: null, // Unlimited
          maxIposPerMonth: null,
          vstudioSessionsIncluded: null,
          features: {
            advancedAnalytics: true,
            prioritySupport: true,
            customBranding: true,
            apiAccess: true,
            earlyAccess: true,
          },
          featureList: [
            'Unlimited Masters',
            'Advanced analytics and insights',
            'Royalty tracking dashboard',
            'Priority support',
            'Early access to new features',
            'Custom smart contract options',
          ],
          trialDays: 14,
          displayOrder: 1,
        },
      ])
      .returning();
    console.log(`  ✓ Created ${2} subscription plans\n`);

    // ============================================================
    // 3. USERS
    // ============================================================
    console.log('Creating test users...');
    const [alexUser, samUser, adminUser] = await db
      .insert(schema.users)
      .values([
        {
          email: 'alex@example.com',
          displayName: 'Alex Rivera',
          bio: 'Electronic music producer and DJ based in Los Angeles',
          emailVerified: true,
          status: 'active',
        },
        {
          email: 'sam@example.com',
          displayName: 'Sam Chen',
          bio: 'Hip-hop producer with 10+ years experience',
          emailVerified: true,
          status: 'active',
        },
        {
          email: 'admin@audifi.io',
          displayName: 'AudiFi Admin',
          emailVerified: true,
          status: 'active',
        },
      ])
      .returning();
    console.log(`  ✓ Created ${3} users\n`);

    // ============================================================
    // 4. USER ROLES
    // ============================================================
    console.log('Assigning roles to users...');
    await db.insert(schema.userRoles).values([
      { userId: alexUser.id, roleId: artistRole.id },
      { userId: samUser.id, roleId: producerRole.id },
      { userId: adminUser.id, roleId: adminRole.id },
    ]);
    console.log(`  ✓ Assigned roles\n`);

    // ============================================================
    // 5. USER WALLETS
    // ============================================================
    console.log('Adding wallets to users...');
    await db.insert(schema.userWallets).values([
      {
        userId: alexUser.id,
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: '1', // Ethereum mainnet
        isPrimary: true,
        verified: true,
        label: 'Main Wallet',
      },
      {
        userId: alexUser.id,
        walletAddress: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        chainId: 'solana',
        isPrimary: false,
        verified: true,
        label: 'Solana Wallet',
      },
    ]);
    console.log(`  ✓ Added wallets\n`);

    // ============================================================
    // 6. ARTIST PROFILES
    // ============================================================
    console.log('Creating artist profiles...');
    const [alexArtist] = await db
      .insert(schema.artists)
      .values([
        {
          userId: alexUser.id,
          artistName: 'Alex Rivera',
          slug: 'alex-rivera',
          bio: 'Electronic music producer and DJ creating deep house, synthwave, and ambient soundscapes.',
          shortBio: 'Deep house & synthwave artist 🎧',
          genre: 'Electronic',
          location: 'Los Angeles, CA',
          socialLinks: {
            instagram: 'https://instagram.com/alexrivera',
            twitter: 'https://twitter.com/alexrivera',
            website: 'https://alexrivera.music',
          },
          musicPlatforms: {
            spotify: 'https://spotify.com/artist/alexrivera',
            soundcloud: 'https://soundcloud.com/alexrivera',
          },
          isVerified: true,
        },
      ])
      .returning();
    console.log(`  ✓ Created artist profile\n`);

    // ============================================================
    // 7. PRODUCER PROFILES
    // ============================================================
    console.log('Creating producer profiles...');
    const [samProducer] = await db
      .insert(schema.producers)
      .values([
        {
          userId: samUser.id,
          producerName: 'Sam Chen',
          slug: 'sam-chen',
          bio: 'Grammy-nominated hip-hop producer working with top artists.',
          specialty: 'Hip-hop & R&B Production',
          isVerified: true,
        },
      ])
      .returning();
    console.log(`  ✓ Created producer profile\n`);

    // ============================================================
    // 8. MASTERS
    // ============================================================
    console.log('Creating masters...');
    const [midnightPulse, neonDreams, untitledProject] = await db
      .insert(schema.masters)
      .values([
        {
          artistId: alexArtist.id,
          title: 'Midnight Pulse',
          description: 'A deep house track with ethereal vocals and driving bassline',
          masterType: 'track',
          status: 'live',
          genre: 'Deep House',
          bpm: 124,
          duration: 380,
          moodTags: ['Dark', 'Hypnotic', 'Energetic'],
          audioFileName: 'midnight_pulse.wav',
          coverImageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400',
          audioIpfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        },
        {
          artistId: alexArtist.id,
          title: 'Neon Dreams',
          description: 'Synthwave inspired journey through cyberpunk landscapes',
          masterType: 'track',
          status: 'live',
          genre: 'Synthwave',
          bpm: 110,
          duration: 295,
          moodTags: ['Nostalgic', 'Cinematic', 'Uplifting'],
          audioFileName: 'neon_dreams.wav',
          coverImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
          audioIpfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
        },
        {
          artistId: alexArtist.id,
          title: 'Untitled Project',
          description: 'Work in progress experimental beat',
          masterType: 'track',
          status: 'draft',
          genre: 'Experimental',
          bpm: 95,
          moodTags: ['Abstract', 'Moody'],
          audioFileName: 'untitled_v3.wav',
        },
      ])
      .returning();
    console.log(`  ✓ Created ${3} masters\n`);

    // ============================================================
    // 9. MASTER IPOs
    // ============================================================
    console.log('Creating Master IPOs...');
    await db.insert(schema.masterIpos).values([
      {
        masterId: midnightPulse.id,
        totalSupply: 1000,
        mintedSupply: 250,
        mintPriceWei: '500000000000000000', // 0.5 ETH
        mintPriceCurrency: 'ETH',
        revenueShareNftHoldersBps: 5000, // 50%
        retainedArtistBps: 4000, // 40%
        retainedPlatformBps: 1000, // 10%
        status: 'closed',
        secondaryRoyaltyBps: 1000, // 10%
        moverAdvantageEnabled: true,
        firstMinterBonusBps: 300,
        secondMinterBonusBps: 200,
        thirdMinterBonusBps: 100,
      },
      {
        masterId: neonDreams.id,
        totalSupply: 500,
        mintedSupply: 50,
        mintPriceWei: '750000000000000000', // 0.75 ETH
        mintPriceCurrency: 'ETH',
        revenueShareNftHoldersBps: 6000, // 60%
        retainedArtistBps: 3000, // 30%
        retainedPlatformBps: 1000, // 10%
        status: 'live',
        secondaryRoyaltyBps: 1000,
        moverAdvantageEnabled: true,
      },
    ]);
    console.log(`  ✓ Created ${2} Master IPOs\n`);

    // ============================================================
    // 10. SUBSCRIPTIONS
    // ============================================================
    console.log('Creating subscriptions...');
    await db.insert(schema.subscriptions).values([
      {
        userId: alexUser.id,
        planId: proPlan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    ]);
    console.log(`  ✓ Created subscription\n`);

    // ============================================================
    // 11. V STUDIO SESSION
    // ============================================================
    console.log('Creating V Studio session...');
    const [vstudioSession] = await db
      .insert(schema.vstudioSessions)
      .values([
        {
          masterId: neonDreams.id,
          artistId: alexArtist.id,
          title: 'Help Choose the Cover Art!',
          description: 'Vote on the final cover art for Neon Dreams before the IPO launches.',
          slug: 'neon-dreams-cover-vote',
          sessionType: 'cover_art',
          status: 'live',
          isPublic: true,
          allowAnonymous: false,
          participantCount: 25,
          totalVotes: 42,
        },
      ])
      .returning();
    console.log(`  ✓ Created V Studio session\n`);

    // Create decision point
    console.log('Creating V Studio decision points...');
    await db.insert(schema.vstudioDecisionPoints).values([
      {
        vstudioSessionId: vstudioSession.id,
        type: 'poll',
        label: 'Which cover art do you prefer?',
        description: 'Vote for your favorite album artwork concept.',
        options: [
          { id: 'opt1', label: 'Neon City', imageUrl: 'https://example.com/neon1.jpg' },
          { id: 'opt2', label: 'Cyber Grid', imageUrl: 'https://example.com/neon2.jpg' },
          { id: 'opt3', label: 'Retro Wave', imageUrl: 'https://example.com/neon3.jpg' },
        ],
        eligibilityRule: 'authenticated',
        isActive: true,
        displayOrder: 0,
      },
    ]);
    console.log(`  ✓ Created decision point\n`);

    // ============================================================
    // COMPLETE
    // ============================================================
    console.log('✅ Database seed completed successfully!\n');
    console.log('Summary:');
    console.log('  - 4 roles');
    console.log('  - 2 subscription plans');
    console.log('  - 3 users (1 artist, 1 producer, 1 admin)');
    console.log('  - 3 masters (2 with IPOs)');
    console.log('  - 1 V Studio session');
    console.log('');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
