# AudiFi

**AudiFi** is a Web3 platform that empowers independent music artists to launch Master IPOs, giving fans the opportunity to own fractional NFT shares of their favorite tracks. Artists retain control, earn automatic dividends, and build direct relationships with their supporters.

> Own Your Music. Share the Success.

## 🎵 Overview

AudiFi enables artists to:
- **Launch Master IPOs** - Sell NFT shares of music masters to fans
- **V Studio Sessions** - Bring fans into the creative process with live production sessions
- **Automatic Dividends** - NFT holders receive payouts when masters generate revenue
- **Mover Advantage** - Early supporters earn royalties on every resale (10%/5%/3%/1%)

This is the **frontend application** built with React 19 + TypeScript, featuring mock APIs and integration placeholders for future Web3 and payment infrastructure.

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
│   ├── masterIPO.ts       # Master IPO operations
│   ├── subscription.ts    # Subscription/pricing data
│   └── marketplace.ts     # Marketplace listings and purchases
├── components/
│   ├── layout/            # Layout components
│   │   ├── MainLayout.tsx # Main app layout with nav
│   │   └── NavBar.tsx     # Landing page navigation
│   ├── audio/             # Audio components
│   │   └── AudioPlayer.tsx # Custom audio player
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── StatCard.tsx   # Stats display with earnings variant
│   │   └── StatCardSkeleton.tsx # Loading skeleton
│   ├── tracks/            # Track-related components
│   │   ├── TrackCard.tsx
│   │   ├── MarketplaceTrackCard.tsx
│   │   ├── MarketplaceFilters.tsx
│   │   ├── TrackCardSkeleton.tsx
│   │   └── PurchaseModal.tsx
│   ├── profile/           # Profile components
│   └── ui/                # shadcn UI components
├── pages/                 # Route pages
│   ├── LandingPage.tsx    # Home page with hero
│   ├── DashboardPage.tsx  # Artist dashboard
│   ├── MarketplacePage.tsx # NFT marketplace
│   ├── TrackDetailPage.tsx # Individual track view
│   ├── artist/            # Artist-specific pages
│   ├── fan/               # Fan portal pages
│   ├── vstudio/           # V Studio pages
│   └── master-ipo/        # Master IPO pages
├── types/                 # TypeScript type definitions
├── App.tsx               # Root app with routing
├── index.css             # CSS variables and base styles
└── main.css              # Tailwind imports and theme mapping
```

## 🎯 Main User Flows

### 1. Landing Page (`/`)
- Hero section with Master IPO value proposition
- Feature showcase (Master IPO, V Studio, Mover Advantage, Dividends)
- Call-to-action buttons

### 2. Artist Dashboard (`/artist`)
- Overview stats (total tracks, sales, royalties, supporters)
- Draft and published track sections
- Quick access to create new Master IPOs

### 3. Marketplace (`/marketplace/masters`)
- Browse and discover Master IPOs from artists
- Filter by genre, blockchain, and price
- Multi-blockchain support (Ethereum/Solana)
- Purchase NFT shares with wallet connection

### 4. Track Detail Page (`/tracks/:id`)
- Large cover art with audio player
- Artist info, genre, BPM, mood tags
- Ownership section with IPFS hash and blockchain badge
- Economics section (royalty percent, secondary resale)
- Activity section with event history
- Purchase button for listed tracks

### 5. Profile Page (`/profile`)
- Artist profile customization
- Social media and music platform links
- Two-factor authentication setup

### 6. Settings Page (`/settings`)
- Account information
- Wallet connection (MetaMask stub)
- Security settings

## 🎨 AudiFi Design System

### Colors (oklch)
| Token | Value | Usage |
|-------|-------|-------|
| **Primary** | `oklch(0.48 0.20 295)` | Deep purple - creative/artistic brand |
| **Secondary** | `oklch(0.58 0.14 210)` | Dark cyan - technical/blockchain accent |
| **Accent** | `oklch(0.72 0.17 195)` | Bright cyan - CTAs and highlights |
| **Warning** | `oklch(0.68 0.16 85)` | Warm amber - earnings/royalty displays |
| **Background** | `oklch(0.14 0.015 260)` | Dark slate background |

### Typography
- **Font:** Inter (Google Fonts)
- **Scale:** 12px (caption) → 14px (body) → 18px (h3) → 24px (h2) → 36px (h1)

### Components
Built with **shadcn/ui v4** components, customized for the music/crypto aesthetic:
- **Skeleton loaders** for marketplace and dashboard loading states
- **AudioPlayer** component for track playback
- **TooltipProvider** for contextual help (royalty badges, blockchain info)
- **Dialog/Modal** for purchase flows
- **Sonner** for toast notifications

### Motion
- **Transitions:** 150-250ms with ease-out
- **Hover effects:** Subtle lift and scale on cards (scale-[1.02])
- **Shadows:** Accent-tinted shadows on hover

## 🔌 Mock APIs & Integrations

All data operations use mock APIs with simulated latency:

### Mock APIs
- `api/user.ts` - User profile management
- `api/tracks.ts` - Track CRUD and minting simulation
- `api/masterIPO.ts` - Master IPO operations
- `api/marketplace.ts` - Marketplace listings and purchases
- `api/dividends.ts` - Dividend tracking and claims

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
- **Deployment:** Vercel

## 🔮 Future Integration Points

This frontend is designed for easy integration with:

1. **Web3 Backend**
   - MetaMask/WalletConnect integration
   - Smart contract calls for Master IPOs and NFT transfers
   - Multi-chain support (Ethereum, Solana)

2. **IPFS Storage**
   - Audio and artwork storage
   - NFT metadata JSON

3. **Payment Processing**
   - Stripe integration for fiat payments
   - Crypto payment support

4. **Backend API**
   - Real REST/GraphQL endpoints
   - Authentication and authorization
   - Database persistence

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
