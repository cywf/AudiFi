# Master IPO

> The "IPO for Music Masters" - Fractional Ownership of Music Revenue Rights

## Overview

**Master IPO** is AudiFi's core mechanism for enabling artists to raise capital by selling fractional ownership in their music masters. Similar to how a company's Initial Public Offering (IPO) allows public investment in a business, a Master IPO allows fans and investors to own shares of a music master's revenue stream.

---

## What is a Master?

In the traditional music industry, a **master recording** (or simply "master") is the original, final recording of a song or album. It's the definitive version from which all copies, streams, and licenses originate.

**Master ownership determines:**
- Who controls distribution and licensing
- Who receives royalties from sales and streams
- Who can authorize derivative works
- Long-term asset value

Historically, masters have been controlled by record labels, leaving artists with limited ownership of their own work.

---

## The Master IPO Model

### Concept

AudiFi transforms masters from illiquid, opaquely-owned assets into transparently tradeable securities:

```
TRADITIONAL MODEL                    AUDIFI MODEL
─────────────────                    ────────────

  ┌─────────────┐                    ┌─────────────┐
  │   ARTIST    │                    │   ARTIST    │
  └──────┬──────┘                    └──────┬──────┘
         │ signs away                       │ retains control
         ▼                                  ▼
  ┌─────────────┐                    ┌─────────────┐
  │    LABEL    │                    │ MASTER IPO  │
  │  (owns 80%+)│                    └──────┬──────┘
  └──────┬──────┘                           │
         │                                  │ fractional shares
         ▼                                  ▼
  ┌─────────────┐                    ┌─────────────┐
  │   OPAQUE    │                    │   PUBLIC    │
  │  ROYALTIES  │                    │ SHAREHOLDERS│
  └─────────────┘                    └─────────────┘
```

### How It Works

#### 1. Master Registration

The artist registers their master on-chain:

- Upload master audio to IPFS
- Create Master Contract with metadata
- Set ownership/revenue configuration
- Define share structure

#### 2. Share Configuration

The artist determines:

| Parameter | Description | Example |
|-----------|-------------|---------|
| **Total Shares** | Number of NFT shares to mint | 1,000 shares |
| **Artist Retention** | Shares kept by artist | 300 shares (30%) |
| **Public Offering** | Shares available for sale | 700 shares (70%) |
| **Initial Price** | Price per share | 0.01 ETH |
| **Royalty Split** | Revenue per share | 0.07% per share |

#### 3. NFT Minting

Shares are minted as ERC-721C tokens:

- Each NFT represents a fractional ownership stake
- Token includes royalty configuration (ERC-2981)
- Metadata links to master and dividend contract
- Tradeable on secondary markets

#### 4. Revenue Distribution

When the master generates revenue:

1. Revenue flows to the Dividend Contract
2. Contract calculates per-share dividend
3. NFT holders can claim their portion
4. On-chain, transparent distribution

---

## Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MASTER IPO LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CREATE              2. CONFIGURE            3. OFFER                    │
│  ────────              ───────────            ───────                       │
│                                                                             │
│  ┌─────────┐          ┌─────────┐          ┌─────────┐                     │
│  │ Upload  │    ──▶   │ Set     │    ──▶   │ Mint &  │                     │
│  │ Master  │          │ Terms   │          │ Sell    │                     │
│  └─────────┘          └─────────┘          └─────────┘                     │
│      │                    │                    │                            │
│      │                    │                    │                            │
│      ▼                    ▼                    ▼                            │
│  - IPFS storage       - Share count       - NFT creation                   │
│  - Metadata           - Pricing           - Public sale                    │
│  - Contract deploy    - Royalty %         - Artist Coin (first IPO)       │
│                       - Mover Advantage                                     │
│                                                                             │
│  4. DISTRIBUTE          5. TRADE              6. EARN                       │
│  ────────────          ───────              ──────                          │
│                                                                             │
│  ┌─────────┐          ┌─────────┐          ┌─────────┐                     │
│  │ Primary │    ──▶   │ Second- │    ──▶   │ Revenue │                     │
│  │ Sale    │          │ ary     │          │ Sharing │                     │
│  └─────────┘          └─────────┘          └─────────┘                     │
│      │                    │                    │                            │
│      │                    │                    │                            │
│      ▼                    ▼                    ▼                            │
│  - Funds to artist    - Marketplace       - Streaming royalties           │
│  - Shares to buyers   - Mover Advantage   - Sync licensing                 │
│  - IPO complete       - Price discovery   - Automatic dividends            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Contract Architecture

### Master Contract

**Purpose:** Represents the registered master recording

**Key Functions:**
- `registerMaster()` - Creates the master record
- `getMasterMetadata()` - Returns IPFS hash and metadata
- `getShareholderCount()` - Number of unique shareholders
- `updateRoyaltyConfig()` - Artist-only royalty updates

**Key Properties:**
- IPFS hash of master audio
- Artist address
- Total supply of shares
- Link to Dividend Contract
- V Studio session reference (if applicable)

### Dividend Contract

**Purpose:** Handles revenue distribution to shareholders

**Key Functions:**
- `depositRevenue()` - Receives revenue from streaming/sales
- `claimDividend()` - Shareholders claim their portion
- `getClaimableAmount()` - Check pending dividends
- `getDistributionHistory()` - View past distributions

**Key Properties:**
- Master Contract reference
- Revenue balance
- Per-share dividend amount
- Claim records per address

### Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CONTRACT ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐       ┌─────────────────┐                    │
│   │  MASTER CONTRACT│◄─────▶│DIVIDEND CONTRACT│                    │
│   │                 │       │                 │                    │
│   │ - IPFS hash     │       │ - Revenue pool  │                    │
│   │ - Metadata      │       │ - Per-share div │                    │
│   │ - Artist addr   │       │ - Claim records │                    │
│   └────────┬────────┘       └────────┬────────┘                    │
│            │                         │                             │
│            │ mints                   │ distributes to               │
│            ▼                         ▼                             │
│   ┌─────────────────┐       ┌─────────────────┐                    │
│   │   NFT SHARES    │◄─────▶│  SHAREHOLDERS   │                    │
│   │   (ERC-721C)    │       │                 │                    │
│   │                 │       │ - Wallet addr   │                    │
│   │ - Token ID      │       │ - Share count   │                    │
│   │ - Royalty info  │       │ - Claim history │                    │
│   │ - Metadata URI  │       │                 │                    │
│   └─────────────────┘       └─────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Revenue Sources

Masters can generate revenue from multiple sources:

| Source | Description | Typical Flow |
|--------|-------------|--------------|
| **Primary Sale** | Initial IPO share sales | Direct to artist |
| **Secondary Sales** | Resale of NFT shares | Mover Advantage split |
| **Streaming** | Plays on streaming platforms | To Dividend Contract |
| **Sync Licensing** | Use in films, ads, games | To Dividend Contract |
| **Downloads** | Digital purchase | To Dividend Contract |
| **Physical** | Vinyl, CD sales | To Dividend Contract |

---

## First Master IPO: Artist Coin Creation

When an artist launches their **first** Master IPO, the platform automatically:

1. Creates their Artist Coin (ERC-20)
2. Establishes an initial liquidity pool
3. Links the coin to their artist profile
4. Enables ecosystem participation

This means every artist in AudiFi has both:
- NFT shares (per-master ownership)
- Artist Coin (overall ecosystem token)

> **Learn more:** [Token Model](./token-model.md)

---

## V Studio Integration

Before a Master IPO, the track can go through V Studio:

1. Artist uploads near-final master
2. Community votes on final decisions
3. Master is "locked" with final changes
4. Auto-mastering applied if needed
5. Master IPO launches with final version

> **Learn more:** [V Studio](./vstudio.md)

---

## Technical Notes

> *This section contains implementation details for engineers*

### Smart Contract Standards

- **ERC-721C:** NFT shares with creator-controlled royalties
- **ERC-2981:** Royalty information for marketplaces
- **ERC-165:** Interface detection

### Metadata Structure

```json
{
  "name": "Master Share - [Track Title]",
  "description": "Fractional ownership in [Track Title] by [Artist]",
  "image": "ipfs://[Cover Art CID]",
  "animation_url": "ipfs://[Audio Preview CID]",
  "attributes": [
    { "trait_type": "Artist", "value": "[Artist Name]" },
    { "trait_type": "Track", "value": "[Track Title]" },
    { "trait_type": "Share Number", "value": "[N] of [Total]" },
    { "trait_type": "Mover Tier", "value": "Tier 1" },
    { "trait_type": "Royalty %", "value": "10%" }
  ],
  "external_url": "https://audifi.io/masters/[master-id]",
  "master_contract": "0x...",
  "dividend_contract": "0x..."
}
```

### Gas Optimization

- Batch minting for initial share creation
- Lazy minting option for on-demand
- Claim batching for dividend distribution
- L2 deployment consideration (Polygon, Base, etc.)

---

## Status

| Component | Status | Notes |
|-----------|--------|-------|
| Master Registration | 🔄 PLANNED | Contract design complete |
| NFT Share Minting | 🔄 PLANNED | ERC-721C implementation |
| Dividend Distribution | 🔄 PLANNED | Contract design complete |
| Revenue Integration | 🔄 PLANNED | Requires streaming API |
| Frontend UI | ✅ CURRENT | Mock implementation live |

---

## Related Documents

- [Token Model](./token-model.md) - ERC standards used
- [Mover Advantage](./mover-advantage.md) - Royalty structure
- [V Studio](./vstudio.md) - Pre-IPO collaboration
- [Liquidity and Staking](./liquidity-and-staking.md) - DeFi mechanics
- [Architecture Overview](../architecture/overview.md) - System design

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
