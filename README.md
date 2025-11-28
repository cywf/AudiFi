# NFT Tracks

**NFT Tracks** is a platform for independent music artists to mint their tracks as one-of-one NFTs, retain full ownership, and earn perpetual royalties on every resale. Dream it. Mint it. Get paid forever.

## 🎵 Overview

NFT Tracks empowers artists to:
- Upload music tracks and artwork
- Configure release metadata (genre, BPM, mood, description)
- Mint tracks as NFTs stored on IPFS
- List NFTs for sale
- Earn automatic royalties on all secondary market resales

This is the **frontend application** built with React + TypeScript, featuring mock APIs and integration placeholders for future Web3 and payment infrastructure.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── api/                    # Mock API layer
│   ├── user.ts            # User data operations
│   ├── tracks.ts          # Track CRUD operations
│   ├── subscription.ts    # Subscription/pricing data
│   └── marketplace.ts     # Marketplace listings and purchases
├── components/
│   ├── layout/            # Layout components
│   │   ├── MainLayout.tsx # Main app layout with nav
│   │   └── NavBar.tsx     # Landing page navigation
│   ├── dashboard/         # Dashboard-specific components
│   │   └── StatCard.tsx   # Stats display with earnings variant
│   ├── tracks/            # Track-related components
│   │   ├── TrackCard.tsx
│   │   ├── MarketplaceTrackCard.tsx
│   │   ├── MarketplaceFilters.tsx
│   │   └── PurchaseModal.tsx
│   ├── pricing/           # Pricing components
│   │   └── PricingTierCard.tsx
│   ├── wizard/            # Wizard/form components
│   │   └── StepIndicator.tsx
│   ├── profile/           # Profile components
│   │   ├── SocialMediaLinks.tsx
│   │   ├── MusicPlatformLinks.tsx
│   │   └── TwoFactorSetup.tsx
│   └── ui/                # shadcn UI components
├── constants/             # App constants
│   └── index.ts           # Genres, mood tags, config
├── lib/                   # Integration stubs and utilities
│   ├── wallet.ts          # MetaMask wallet stub
│   ├── payments.ts        # Stripe payment stub
│   └── utils.ts           # Utility functions (cn, etc.)
├── pages/                 # Route pages
│   ├── LandingPage.tsx    # Home page with hero
│   ├── DashboardPage.tsx  # Artist dashboard
│   ├── CreateTrackPage.tsx # Multi-step track creation wizard
│   ├── TrackDetailPage.tsx # Individual track view
│   ├── PricingPage.tsx    # Subscription tiers
│   ├── SettingsPage.tsx   # Account settings
│   ├── ProfilePage.tsx    # Artist profile management
│   ├── SignupPage.tsx     # Account creation
│   ├── HowItWorksPage.tsx # Educational page
│   ├── WhyNFTTracksPage.tsx # Value proposition
│   └── MarketplacePage.tsx # NFT marketplace
├── types/                 # TypeScript type definitions
│   └── index.ts
├── App.tsx               # Root app with routing
├── index.css             # CSS variables and base styles
├── main.css              # Tailwind imports and theme mapping
└── main.tsx              # App entry point
```

## 🎯 Key Features

### 1. Landing Page (`/`)
- Hero section with value proposition
- Feature showcase
- Call-to-action buttons

### 2. Dashboard (`/dashboard`)
- Overview stats (total tracks, sales, royalties)
- Track management grid
- Quick access to create new tracks

### 3. Create Track Wizard (`/tracks/new`)
Multi-step wizard with:
- **Step 1:** Track details (title, genre, BPM, mood tags, description, audio upload)
- **Step 2:** Artwork upload
- **Step 3:** Economics (pricing, royalties, release date)
- **Step 4:** Review and mint simulation

### 4. Track Detail Page (`/tracks/:id`)
- Complete track information
- Artwork and waveform visualization
- Ownership and IPFS hash display
- Purchase simulation for visitors

### 5. Pricing Page (`/pricing`)
- Free vs Pro tier comparison
- FAQ section
- Simulated Stripe checkout

### 6. Settings Page (`/settings`)
- Profile information
- Wallet connection (MetaMask stub)
- Subscription management

### 7. Marketplace (`/marketplace`)
- Browse and discover listed NFT tracks
- Filter by genre, blockchain, and price
- Multi-blockchain support (Ethereum/Solana simulation)
- Purchase flow with wallet connection

### 8. Profile Page (`/profile`)
- Artist profile customization
- Social media links
- Music platform links
- Two-factor authentication setup

### 9. How It Works (`/how-it-works`)
- Step-by-step guide to the minting process
- Animated visual walkthrough
- Benefits of the platform

### 10. Why NFT Tracks (`/why-nft-tracks`)
- Educational content about music industry challenges
- Explanation of the 10% perpetual royalty model
- Track-level ROI concept

### 11. Signup (`/signup`)
- Account creation flow
- Terms acceptance
- Profile initialization

## 🎨 Design System

### Colors (oklch)
- **Primary:** Deep Purple (`oklch(0.45 0.18 300)`) - Creative/artistic brand color
- **Secondary:** Dark Cyan (`oklch(0.55 0.12 200)`) - Technical/blockchain accent
- **Accent:** Bright Cyan (`oklch(0.75 0.15 200)`) - Call-to-action and highlights
- **Warning:** Warm Amber (`oklch(0.65 0.15 80)`) - Value/earnings displays
- **Background:** Dark Slate (`oklch(0.15 0.02 260)`)

### Typography
- **Font:** Inter (Google Fonts)
- **Scale:** 12px (caption) → 14px (body) → 18px (h3) → 24px (h2) → 36px (h1)

### Components
Built with **shadcn/ui v4** components, customized for the music/crypto aesthetic.

## 🔌 Mock APIs & Integrations

All data operations use mock APIs with simulated latency:

### Mock APIs
- `api/user.ts` - User profile management
- `api/tracks.ts` - Track CRUD and minting simulation
- `api/subscription.ts` - Pricing plans

### Integration Stubs
- `lib/wallet.ts` - MetaMask connection placeholder
- `lib/payments.ts` - Stripe checkout placeholder

### Data Persistence
Mock data is stored in `localStorage` for demo purposes. In production, this would connect to a real backend with Web3 integration.

## 🧪 Tech Stack

- **Framework:** React 19 + TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui v4
- **Icons:** Phosphor Icons
- **Notifications:** Sonner
- **Build Tool:** Vite

## 📝 Type Definitions

Key TypeScript interfaces:

```typescript
interface User {
  id: string
  name: string
  email: string
  walletAddress?: string
  subscriptionPlan: "FREE" | "PRO"
  createdAt: string
}

interface Track {
  id: string
  title: string
  description: string
  genre: string
  bpm?: number
  moodTags: string[]
  audioFileName: string
  coverImageUrl?: string
  artistId: string
  status: "DRAFT" | "MINTED" | "LISTED" | "SOLD"
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

interface SubscriptionPlan {
  id: string
  name: string
  pricePerMonthUSD: number
  maxTracks: number | null
  features: string[]
}
```

## 🔮 Future Integration Points

This frontend is designed for easy integration with:

1. **Web3 Backend**
   - Replace `lib/wallet.ts` with actual MetaMask/WalletConnect integration
   - Implement smart contract calls for minting and transfers
   - Connect to real blockchain networks (Ethereum, Polygon, etc.)

2. **IPFS Storage**
   - Replace simulated file uploads with actual IPFS pinning services
   - Store audio files and artwork on IPFS
   - Generate and store metadata JSON on IPFS

3. **Payment Processing**
   - Replace `lib/payments.ts` with actual Stripe integration
   - Implement webhook handlers for subscription events
   - Support both crypto and fiat payments

4. **Backend API**
   - Replace mock APIs with real REST/GraphQL endpoints
   - Implement authentication and authorization
   - Add database persistence (PostgreSQL, MongoDB, etc.)

## 🎭 Demo Data

The app includes sample tracks with realistic metadata:
- "Midnight Pulse" (Deep House, Minted)
- "Neon Dreams" (Synthwave, Listed)
- "Untitled Project" (Experimental, Draft)

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
