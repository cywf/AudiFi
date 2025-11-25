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
  currency?: "ETH" | "USD"
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
  currency: "ETH" | "USD"
  timestamp: string
  marketplace: "NFT_TRACKS" | "OPENSEA" | "OTHER"
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
  currency?: "ETH" | "USD"
}
