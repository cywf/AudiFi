export interface User {
  id: string
  name: string
  email: string
  walletAddress?: string
  subscriptionPlan: "FREE" | "PRO"
  createdAt: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  pricePerMonthUSD: number
  maxTracks: number | null
  features: string[]
}

export type TrackStatus = "DRAFT" | "MINTED" | "LISTED" | "SOLD"

export interface Track {
  id: string
  title: string
  description: string
  genre: string
  bpm?: number
  moodTags: string[]
  audioFileName: string
  coverImageUrl?: string
  artistId: string
  status: TrackStatus
  ipfsHash?: string
  ownerWalletAddress?: string
  currentPrice?: number
  currency?: "ETH" | "SOL" | "USD"
  blockchain?: "ethereum" | "solana"
  royaltyPercent: number
  releaseDate?: string
  allowSecondaryResale?: boolean
  createdAt: string
  updatedAt: string
}

export interface SaleEvent {
  id: string
  trackId: string
  fromWallet: string
  toWallet: string
  price: number
  currency: "ETH" | "SOL" | "USD"
  blockchain: "ethereum" | "solana"
  timestamp: string
  marketplace: "NFT_TRACKS" | "OPENSEA" | "MAGIC_EDEN" | "OTHER"
}

export interface CreateTrackPayload {
  title: string
  description: string
  genre: string
  bpm?: number
  moodTags: string[]
  audioFileName: string
  coverImageUrl?: string
  royaltyPercent: number
  releaseDate?: string
  allowSecondaryResale?: boolean
  currentPrice?: number
  currency?: "ETH" | "SOL" | "USD"
  blockchain?: "ethereum" | "solana"
}

export interface UserProfile {
  displayName: string
  bio: string
  avatarUrl: string
  socialMedia: {
    instagram: string
    twitter: string
    tiktok: string
    youtube: string
  }
  musicPlatforms: {
    spotify: string
    appleMusic: string
    soundcloud: string
    bandcamp: string
  }
  twoFactorEnabled: boolean
}

// ============================================
// Master IPO Types
// ============================================

export type MasterIPOStatus = "DRAFT" | "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED"

export interface MasterIPO {
  id: string
  title: string
  artistId: string
  artistName: string
  description: string
  coverImageUrl?: string
  audioPreviewUrl?: string
  
  // Share configuration
  totalNFTSupply: number // 1 - 1,000,000
  nftHolderRevenueSharePercent: number // % of master revenue to NFT holders
  artistRetainedPercent: number // % retained by artist
  
  // IPO details
  pricePerNFT: number
  currency: "ETH" | "SOL" | "USD"
  blockchain: "ethereum" | "solana"
  
  // Legal
  rightsConfirmed: boolean
  collaborators: Collaborator[]
  
  // Status
  status: MasterIPOStatus
  launchedAt?: string
  completedAt?: string
  
  // Stats
  nftsSold: number
  totalRaised: number
  
  createdAt: string
  updatedAt: string
}

export interface Collaborator {
  id: string
  name: string
  role: string // e.g., "Producer", "Featured Artist", "Songwriter"
  revenueSharePercent: number
  walletAddress?: string
}

export interface CreateMasterIPOPayload {
  title: string
  description: string
  coverImageUrl?: string
  audioPreviewUrl?: string
  totalNFTSupply: number
  nftHolderRevenueSharePercent: number
  artistRetainedPercent: number
  pricePerNFT: number
  currency: "ETH" | "SOL" | "USD"
  blockchain: "ethereum" | "solana"
  rightsConfirmed: boolean
  collaborators: Omit<Collaborator, 'id'>[]
}

// ============================================
// Mover Advantage Types
// ============================================

export interface MoverAdvantage {
  firstMinterPercent: number // 10%
  secondMinterPercent: number // 5%
  thirdMinterPercent: number // 3%
  fourthPlusMinterPercent: number // 1%
  sellerPercent: number // 81%
}

export const DEFAULT_MOVER_ADVANTAGE: MoverAdvantage = {
  firstMinterPercent: 10,
  secondMinterPercent: 5,
  thirdMinterPercent: 3,
  fourthPlusMinterPercent: 1,
  sellerPercent: 81,
}

// ============================================
// Dividend Types
// ============================================

export interface Dividend {
  id: string
  masterIPOId: string
  masterTitle: string
  amount: number
  currency: "ETH" | "SOL" | "USD"
  status: "CLAIMABLE" | "CLAIMED" | "EXPIRED"
  distributedAt: string
  claimedAt?: string
}

export interface DividendSummary {
  totalClaimable: number
  totalClaimed: number
  totalHistorical: number
  currency: "ETH" | "SOL" | "USD"
  dividends: Dividend[]
}

// ============================================
// Artist Coin Types
// ============================================

export interface ArtistCoin {
  id: string
  artistId: string
  artistName: string
  symbol: string // e.g., "ALEX", "BEAT"
  totalSupply: number
  circulatingSupply: number
  currentPrice: number
  currency: "ETH" | "SOL" | "USD"
  
  // Liquidity pool info
  liquidityPoolAddress?: string
  liquidityAmount?: number
  
  createdAt: string
  updatedAt: string
}

export interface ArtistCoinHolding {
  artistCoinId: string
  artistName: string
  symbol: string
  amount: number
  currentValue: number
  currency: "ETH" | "SOL" | "USD"
  purchasedAt: string
}

// ============================================
// V Studio Types
// ============================================

export type VStudioSessionStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"

export interface VStudioSession {
  id: string
  title: string
  description: string
  artistId: string
  artistName: string
  
  // Track being worked on
  masterInProgress?: {
    id: string
    title: string
    coverImageUrl?: string
  }
  
  // Session config
  scheduledStartTime?: string
  actualStartTime?: string
  endTime?: string
  status: VStudioSessionStatus
  
  // Access gating
  gating: SessionGating
  
  // Decision points
  decisionPoints: DecisionPoint[]
  
  // Stream info
  streamUrl?: string
  
  createdAt: string
  updatedAt: string
}

export interface SessionGating {
  type: "OPEN" | "NFT" | "ARTIST_COIN" | "SUBSCRIPTION" | "COMBINED"
  requirements?: {
    nftMasterIPOId?: string
    nftMinAmount?: number
    artistCoinId?: string
    artistCoinMinAmount?: number
    subscriptionTier?: "FREE" | "PRO"
  }
}

export type DecisionPointType = "POLL" | "SLIDER" | "RANKING"

export interface DecisionPoint {
  id: string
  sessionId: string
  type: DecisionPointType
  question: string
  options: DecisionOption[]
  durationSeconds: number
  status: "PENDING" | "ACTIVE" | "COMPLETED"
  result?: string
  gating: SessionGating
  createdAt: string
  startedAt?: string
  endedAt?: string
}

export interface DecisionOption {
  id: string
  label: string
  votes: number
}

export interface CreateVStudioSessionPayload {
  title: string
  description: string
  masterInProgressId?: string
  scheduledStartTime?: string
  gating: SessionGating
  decisionPoints: Omit<DecisionPoint, 'id' | 'sessionId' | 'createdAt' | 'startedAt' | 'endedAt'>[]
}

// ============================================
// Session Recap Types
// ============================================

export interface SessionRecap {
  id: string
  sessionId: string
  sessionTitle: string
  artistName: string
  duration: number // in minutes
  totalViewers: number
  peakViewers: number
  decisionPoints: DecisionPointResult[]
  keyMoments: KeyMoment[]
  finalMasterLocked: boolean
  masterIPOLaunched: boolean
  masterIPOId?: string
  createdAt: string
}

export interface DecisionPointResult {
  id: string
  question: string
  winningOption: string
  totalVotes: number
  optionResults: { label: string; votes: number; percentage: number }[]
}

export interface KeyMoment {
  timestamp: number // seconds from start
  description: string
  type: "DECISION" | "HIGHLIGHT" | "MILESTONE"
}

// ============================================
// Auth Types
// ============================================

export interface MagicLinkRequest {
  email: string
}

export interface MagicLinkVerification {
  token: string
  email: string
}

export interface TwoFactorSetupData {
  secret: string
  qrCodeUrl: string
}

// ============================================
// Gating Types
// ============================================

export interface GatingStatus {
  hasAccess: boolean
  requirement?: SessionGating
  missingRequirements?: string[]
  ctaType?: "SUBSCRIBE" | "CONNECT_WALLET" | "BUY_NFT" | "BUY_COIN"
}

// ============================================
// Fan Portfolio Types
// ============================================

export interface FanPortfolio {
  nftHoldings: NFTHolding[]
  artistCoinHoldings: ArtistCoinHolding[]
  dividends: DividendSummary
  votingHistory: VotingHistoryItem[]
}

export interface NFTHolding {
  id: string
  masterIPOId: string
  masterTitle: string
  artistName: string
  coverImageUrl?: string
  quantity: number
  purchasePrice: number
  currentValue: number
  currency: "ETH" | "SOL" | "USD"
  minterPosition?: number // 1st, 2nd, 3rd, 4th+ for Mover Advantage
  purchasedAt: string
}

export interface VotingHistoryItem {
  id: string
  sessionId: string
  sessionTitle: string
  decisionPointId: string
  question: string
  votedOption: string
  outcome: "WON" | "LOST"
  votedAt: string
}
