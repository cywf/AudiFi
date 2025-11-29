/**
 * AudiFi Backend Types
 * Core type definitions for the Master IPO + V Studio platform
 */

// =============================================================================
// USER & AUTHENTICATION
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  walletAddresses: WalletAssociation[];
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'artist' | 'producer' | 'fan' | 'admin';

export type TwoFactorMethod = 'totp' | 'passkey';

export interface WalletAssociation {
  address: string;
  chain: BlockchainNetwork;
  isPrimary: boolean;
  linkedAt: string;
}

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: string;
  refreshToken?: string;
}

// =============================================================================
// MASTER & MASTER IPO
// =============================================================================

/**
 * A "Master" represents a music track or album registered on AudiFi.
 * When launched as an IPO, it gets a Master Contract (ERC-721C) deployed.
 */
export interface Master {
  id: string;
  title: string;
  description: string;
  artistId: string;
  type: MasterType;
  
  // Metadata
  genre: string;
  bpm?: number;
  duration?: number; // in seconds
  releaseDate?: string;
  moodTags: string[];
  
  // Media
  audioFileUrl?: string;
  coverImageUrl?: string;
  ipfsAudioHash?: string;
  ipfsCoverHash?: string;
  ipfsMetadataHash?: string;
  
  // Rights & Ownership
  rightsConfirmed: boolean;
  rightsConfirmationDate?: string;
  
  // IPO Status
  ipoStatus: MasterIPOStatus;
  ipoId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type MasterType = 'track' | 'album';

export type MasterIPOStatus = 
  | 'draft'           // Master created, not yet configured for IPO
  | 'configuring'     // IPO parameters being set
  | 'pending_launch'  // Ready to launch, awaiting trigger
  | 'launching'       // Contract deployment in progress
  | 'live'            // IPO active, minting available
  | 'completed'       // All NFTs minted
  | 'canceled';       // IPO canceled before completion

/**
 * Configuration for a Master IPO launch
 */
export interface MasterIPO {
  id: string;
  masterId: string;
  artistId: string;
  
  // Supply Configuration
  totalSupply: number;           // 1 to 1,000,000 NFTs
  mintedCount: number;
  mintPrice: string;             // Price in native token (wei/lamports)
  currency: IPOCurrency;
  
  // Revenue Share (the Mover Advantage model)
  artistRoyaltyPercent: number;  // 10% on resales
  firstMinterPercent: number;    // 5% on resales
  secondMinterPercent: number;   // 3% on resales
  thirdMinterPercent: number;    // 1% on resales
  sellerPercent: number;         // 81% on resales
  
  // Contract Addresses (populated after deployment)
  masterContractAddress?: string;
  dividendContractAddress?: string;
  artistCoinAddress?: string;
  
  // Chain Configuration
  blockchain: BlockchainNetwork;
  
  // Timing
  launchDate?: string;
  endDate?: string;
  
  // Status
  status: MasterIPOStatus;
  
  createdAt: string;
  updatedAt: string;
}

export type IPOCurrency = 'ETH' | 'MATIC' | 'BASE_ETH';

export type BlockchainNetwork = 
  | 'ethereum'
  | 'polygon'
  | 'base'
  | 'ethereum_goerli'
  | 'ethereum_sepolia'
  | 'polygon_mumbai'
  | 'base_goerli';

// =============================================================================
// MOVER ADVANTAGE & RESALE
// =============================================================================

/**
 * The "Mover Advantage" model for NFT resales
 * Distribution: Artist 10%, 1st Minter 5%, 2nd Minter 3%, 3rd Minter 1%, Seller 81%
 */
export interface MoverAdvantageConfig {
  artistPercent: 10;
  firstMinterPercent: 5;
  secondMinterPercent: 3;
  thirdMinterPercent: 1;
  sellerPercent: 81;
}

export interface MasterNFTHolder {
  tokenId: number;
  ownerAddress: string;
  mintOrder: number;        // 1st, 2nd, 3rd, etc.
  mintedAt: string;
  isMoverAdvantageEligible: boolean;  // true for 1st, 2nd, 3rd minters
  moverAdvantagePercent?: number;     // 5%, 3%, or 1%
}

// =============================================================================
// ARTIST COIN
// =============================================================================

/**
 * ERC-20 token created for an artist on their first Master IPO
 */
export interface ArtistCoin {
  id: string;
  artistId: string;
  name: string;
  symbol: string;
  contractAddress?: string;
  blockchain: BlockchainNetwork;
  totalSupply: string;       // BigNumber as string
  circulatingSupply: string; // BigNumber as string
  decimals: number;
  
  // Liquidity Pool Info
  liquidityPoolAddress?: string;
  liquidityPoolType?: LiquidityPoolType;
  
  createdAt: string;
  updatedAt: string;
}

export type LiquidityPoolType = 'uniswap_v2' | 'uniswap_v3' | 'sushiswap';

export interface ArtistCoinMetrics {
  artistCoinId: string;
  priceUsd?: number;
  priceEth?: number;
  volume24h?: number;
  liquidityUsd?: number;
  holders?: number;
  marketCap?: number;
  lastUpdated: string;
}

// =============================================================================
// DIVIDENDS & REVENUE
// =============================================================================

export interface DividendContract {
  id: string;
  masterId: string;
  masterIpoId: string;
  contractAddress?: string;
  blockchain: BlockchainNetwork;
  
  // Revenue Tracking
  totalRevenueReceived: string;  // BigNumber as string
  totalDividendsPaid: string;    // BigNumber as string
  pendingDividends: string;      // BigNumber as string
  
  createdAt: string;
  updatedAt: string;
}

export interface RevenueEvent {
  id: string;
  masterId: string;
  dividendContractId: string;
  amount: string;              // BigNumber as string
  currency: string;
  source: RevenueSource;
  transactionHash?: string;
  processedAt?: string;
  createdAt: string;
}

export type RevenueSource = 
  | 'streaming'
  | 'sale'
  | 'resale_royalty'
  | 'license'
  | 'merchandise'
  | 'manual';

export interface DividendClaim {
  id: string;
  userId: string;
  walletAddress: string;
  masterId: string;
  tokenId: number;
  amount: string;              // BigNumber as string
  status: ClaimStatus;
  transactionHash?: string;
  claimedAt?: string;
  createdAt: string;
}

export type ClaimStatus = 'available' | 'pending' | 'claimed' | 'failed';

// =============================================================================
// V STUDIO
// =============================================================================

export interface VStudioSession {
  id: string;
  artistId: string;
  masterId?: string;           // Optional link to a Master being developed
  
  title: string;
  description?: string;
  
  // Lifecycle
  status: VStudioSessionStatus;
  scheduledStartTime?: string;
  actualStartTime?: string;
  endTime?: string;
  
  // Eligibility Configuration
  eligibility: VStudioEligibility;
  
  // Associated IPO (if session leads to launch)
  linkedIpoId?: string;
  
  // Engagement Stats
  peakViewers?: number;
  totalUniqueViewers?: number;
  
  createdAt: string;
  updatedAt: string;
}

export type VStudioSessionStatus = 
  | 'setup'           // Session being configured
  | 'scheduled'       // Scheduled for future time
  | 'live'            // Currently streaming
  | 'decision_lock'   // In final decision phase
  | 'ipo_launching'   // IPO launch triggered from session
  | 'completed'       // Session ended
  | 'canceled';

export interface VStudioEligibility {
  // Who can participate
  requireNFTOwnership: boolean;
  requiredNFTContractAddresses?: string[];
  
  requireArtistCoin: boolean;
  requiredArtistCoinAmount?: string;  // Minimum amount to hold
  
  requireSubscription: boolean;
  minimumSubscriptionTier?: SubscriptionPlan;
  
  // Public sessions have no requirements
  isPublic: boolean;
}

export interface VStudioDecisionPoint {
  id: string;
  sessionId: string;
  
  question: string;
  options: VStudioPollOption[];
  
  status: DecisionPointStatus;
  
  // Timing
  openedAt?: string;
  closedAt?: string;
  
  // Results
  winningOptionId?: string;
  totalVotes?: number;
  
  createdAt: string;
  updatedAt: string;
}

export type DecisionPointStatus = 'pending' | 'open' | 'closed' | 'finalized';

export interface VStudioPollOption {
  id: string;
  text: string;
  voteCount: number;
  votePercentage?: number;
}

export interface VStudioVote {
  id: string;
  decisionPointId: string;
  optionId: string;
  userId: string;
  walletAddress?: string;
  votedAt: string;
}

// =============================================================================
// SUBSCRIPTIONS & PAYMENTS
// =============================================================================

export interface SubscriptionPlanConfig {
  id: string;
  name: SubscriptionPlan;
  pricePerMonthUsd: number;
  pricePerYearUsd?: number;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  features: string[];
  maxMasters: number | null;    // null = unlimited
  maxVStudioSessions: number | null;
  vStudioFeatures: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEvent {
  id: string;
  userId: string;
  type: PaymentEventType;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type PaymentEventType = 
  | 'subscription'
  | 'nft_mint'
  | 'artist_coin_purchase'
  | 'one_time';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

// =============================================================================
// ANALYTICS
// =============================================================================

export interface ArtistAnalytics {
  artistId: string;
  period: AnalyticsPeriod;
  
  // Master Performance
  totalMasters: number;
  totalNFTsMinted: number;
  totalNFTsSold: number;
  
  // Revenue
  totalRevenueUsd: number;
  dividendsDistributedUsd: number;
  pendingDividendsUsd: number;
  
  // V Studio
  totalSessions: number;
  totalSessionMinutes: number;
  averageViewers: number;
  
  // Token Metrics (if Artist Coin exists)
  artistCoinHolders?: number;
  artistCoinPriceUsd?: number;
  artistCoinMarketCap?: number;
  
  calculatedAt: string;
}

export interface MasterAnalytics {
  masterId: string;
  period: AnalyticsPeriod;
  
  mintedCount: number;
  holdersCount: number;
  
  primarySalesUsd: number;
  secondarySalesUsd: number;
  royaltiesGeneratedUsd: number;
  
  dividendsDistributedUsd: number;
  
  calculatedAt: string;
}

export interface VStudioAnalytics {
  sessionId: string;
  
  // Engagement
  uniqueViewers: number;
  peakConcurrentViewers: number;
  averageConcurrentViewers: number;
  totalWatchMinutes: number;
  
  // Interaction
  totalDecisionPoints: number;
  totalVotes: number;
  averageVotesPerDecision: number;
  
  // Conversion (if linked to IPO)
  ipoConversionRate?: number;  // % of viewers who minted
  
  calculatedAt: string;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year' | 'all_time';

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}
