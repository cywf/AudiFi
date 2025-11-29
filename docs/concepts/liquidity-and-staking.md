# Liquidity and Staking

> Economic Mechanics for Trading, Staking, and Dividends

## Overview

AudiFi incorporates DeFi mechanics to create liquid markets for music assets and reward long-term holders. This document covers liquidity pools, staking mechanisms, and dividend distribution.

---

## Liquidity Pools

### Concept

Liquidity pools are smart contracts that hold token reserves and enable automated trading. Instead of matching buyers with sellers, trades execute against the pool using algorithmic pricing.

### AudiFi Liquidity Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LIQUIDITY ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ARTIST ECOSYSTEM                           TRADING                        │
│   ────────────────                           ────────                       │
│                                                                             │
│   ┌─────────────────┐                  ┌─────────────────┐                 │
│   │  Artist Coin    │◄────────────────▶│   DEX POOLS     │                 │
│   │  (NOVA Token)   │                  │                 │                 │
│   └────────┬────────┘                  │  NOVA/ETH       │                 │
│            │                           │  NOVA/USDC      │                 │
│            │ created at                └─────────────────┘                 │
│            │ first IPO                          ▲                          │
│            ▼                                    │                          │
│   ┌─────────────────┐                          │                          │
│   │  Initial        │                          │                          │
│   │  Liquidity      │──────────────────────────┘                          │
│   │  Pool           │                                                      │
│   └─────────────────┘                                                      │
│                                                                             │
│   MASTER IPO                              NFT TRADING                       │
│   ──────────                              ────────────                      │
│                                                                             │
│   ┌─────────────────┐                  ┌─────────────────┐                 │
│   │  NFT Shares     │◄────────────────▶│  MARKETPLACE    │                 │
│   │  (ERC-721C)     │                  │                 │                 │
│   └─────────────────┘                  │  OpenSea        │                 │
│                                        │  AudiFi Native  │                 │
│                                        │  LooksRare      │                 │
│                                        └─────────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Artist Coin Liquidity

When an artist's first Master IPO launches:

1. **Pool Creation** - Artist Coin / ETH pool created
2. **Initial Liquidity** - Portion of Artist Coin allocated
3. **Trading Enabled** - Buy/sell Artist Coin via DEX

**Initial Pool Setup:**

```
NOVA COIN LIQUIDITY POOL
═════════════════════════

Pool Type: Uniswap V3 Style (concentrated liquidity)

Initial Allocation:
├── NOVA Tokens: 250,000 (25% of supply)
└── ETH: Provided by artist/platform

Initial Price: Set by artist (e.g., 1 NOVA = 0.001 ETH)

Trading Fees: 0.3% (standard) or 1% (reduced volatility)
```

### NFT Liquidity Options

> **Status:** 💡 EXPERIMENTAL

For NFT shares, liquidity is more complex:

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Marketplace Trading** | Traditional NFT sales | Simple | Illiquid, no AMM |
| **NFT Fractionalization** | Further split shares | High liquidity | Complexity |
| **NFTX-style Vaults** | Pool identical-tier NFTs | AMM pricing | Fungibility issues |
| **Blur-style Bidding** | Collection-wide orders | Price discovery | Gas intensive |

Current approach: Traditional marketplace trading with royalty enforcement.

---

## Staking

### Concept

Staking locks tokens in a smart contract to:
- Earn rewards (yield)
- Gain governance power
- Demonstrate commitment
- Access exclusive features

### Staking Options in AudiFi

```
AUDIFI STAKING OPTIONS
═══════════════════════

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   ARTIST COIN STAKING              NFT SHARE STAKING          │
│   ───────────────────              ─────────────────          │
│                                                                │
│   Stake: NOVA tokens               Stake: NFT shares          │
│   Earn: More NOVA + perks          Earn: Enhanced dividends   │
│   Period: Flexible or locked       Period: Lock required      │
│                                                                │
│   Benefits:                        Benefits:                   │
│   • Voting power multiplier       • Dividend boost (1.2x)     │
│   • V Studio priority access      • Governance rights         │
│   • LP reward share               • Early access              │
│   • Early IPO allocation          • Badge display             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Artist Coin Staking

**Mechanism:**

```
STAKING MECHANISM
═════════════════

User Action: Deposit NOVA tokens into staking contract
Lock Period: 30, 90, or 365 days (optional)

Rewards Calculation:
├── Base APY: 5-15% (varies by total staked)
├── Lock Bonus: +2% per 30 days locked (max +12%)
└── LP Bonus: +5% if also providing liquidity

Example:
├── User stakes: 1,000 NOVA
├── Lock period: 90 days
├── Base APY: 10%
├── Lock bonus: +6%
├── Total APY: 16%
└── Expected reward: 160 NOVA / year
```

**Voting Power:**

| Staking Status | Voting Multiplier |
|----------------|-------------------|
| Not staked | 1x |
| Staked (flexible) | 1.5x |
| Staked (30 days) | 2x |
| Staked (90 days) | 3x |
| Staked (365 days) | 5x |

### NFT Share Staking

**Mechanism:**

```
NFT STAKING MECHANISM
═════════════════════

User Action: Lock NFT share in staking contract
Minimum Lock: 30 days
Maximum Lock: Unlimited

Benefits:
├── Dividend Boost: 1.2x on revenue distributions
├── Staker Badge: On-chain verification
├── Priority Access: New IPO early window
└── Governance: Vote on master-level decisions
```

**Trade-off:**
- Staked NFTs cannot be traded
- Unstaking has cooldown period (7 days)
- Dividends still claimable while staked

---

## Dividends

### Concept

When a master generates revenue (streaming, sync, sales), that revenue is distributed to NFT shareholders proportionally.

### Dividend Flow

```
DIVIDEND DISTRIBUTION FLOW
══════════════════════════

Revenue Generation:
┌─────────────────┐
│ Streaming       │───┐
│ (Spotify, etc.) │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │    ┌─────────────────┐    ┌─────────────────┐
│ Sync Licensing  │───┼───▶│ Revenue Bridge  │───▶│ Dividend        │
│ (Film/TV/Ads)   │   │    │ (Off→On-chain)  │    │ Contract        │
└─────────────────┘   │    └─────────────────┘    └────────┬────────┘
                      │                                     │
┌─────────────────┐   │                                     │
│ Direct Sales    │───┘                                     ▼
│ (Downloads)     │                               ┌─────────────────┐
└─────────────────┘                               │ Per-Share       │
                                                  │ Calculation     │
                                                  └────────┬────────┘
                                                           │
           ┌───────────────────────────────────────────────┼───────┐
           │                                               │       │
           ▼                                               ▼       ▼
   ┌───────────────┐                              ┌───────────────┐
   │ NFT Holder 1  │                              │ NFT Holder N  │
   │ Claims: 0.5%  │                              │ Claims: 2.0%  │
   └───────────────┘                              └───────────────┘
```

### Calculation

```
DIVIDEND CALCULATION
════════════════════

Master: "Electric Dreams" by Nova
Total Shares: 1,000

Revenue Period: Q1 2025
Total Revenue: $10,000 (converted to ETH: 4 ETH)

Per-Share Dividend:
├── Base: 4 ETH / 1,000 shares = 0.004 ETH per share
└── With Staking Boost: 0.004 ETH × 1.2 = 0.0048 ETH per staked share

Holder Example:
├── Holder owns: 50 shares
├── Staked: 30 shares
├── Not staked: 20 shares
├── Staked dividend: 30 × 0.0048 = 0.144 ETH
├── Unstaked dividend: 20 × 0.004 = 0.08 ETH
└── Total: 0.224 ETH
```

### Claiming Dividends

**Options:**

| Method | Description | Gas Efficiency |
|--------|-------------|----------------|
| **Manual Claim** | User initiates claim | Per-user gas |
| **Auto-Compound** | Reinvest into staking | Single user gas |
| **Batch Distribution** | Platform pushes to all | Platform pays gas |
| **Lazy Claim** | Claim when transferring | Spread over time |

**Current Design:** Manual claim with batch distribution option for major payouts.

---

## Self-Sustaining Economics

### Goal

AudiFi aims for self-sustaining economics where:
- Gas fees are covered by platform revenue
- Artists don't need external funding
- Fans earn returns that justify participation
- Liquidity is sufficient for trading

### Revenue Sources

```
PLATFORM REVENUE MODEL
══════════════════════

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   Primary Revenue                  Secondary Revenue           │
│   ───────────────                  ─────────────────          │
│                                                                │
│   • IPO Platform Fee (2.5%)       • Trading Fees (0.5%)       │
│   • V Studio Premium              • Subscription Revenue       │
│   • Listing Fees                  • LP Fee Share               │
│                                                                │
│   Gas Subsidies                   Sustainability Metrics       │
│   ────────────                    ───────────────────         │
│                                                                │
│   Platform covers:                 Targets:                    │
│   • First mint for artists        • Break-even: Month 6       │
│   • Batch dividend distribution   • Self-sustaining: Year 1   │
│   • Contract deployments          • Profitable: Year 2        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Economic Flywheel

```
ECONOMIC FLYWHEEL
═════════════════

        ┌─────────────┐
        │   Artists   │
        │   Create    │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │   Master    │
        │   IPOs      │◀──────────────────────────┐
        └──────┬──────┘                           │
               │                                  │
               ▼                                  │
        ┌─────────────┐                           │
        │   Fans      │                           │
        │   Invest    │                           │
        └──────┬──────┘                           │
               │                                  │
               ▼                                  │
        ┌─────────────┐                           │
        │  Revenue    │                           │
        │  Generated  │                           │
        └──────┬──────┘                           │
               │                                  │
               ▼                                  │
        ┌─────────────┐                           │
        │  Dividends  │                           │
        │  Distributed│                           │
        └──────┬──────┘                           │
               │                                  │
               ▼                                  │
        ┌─────────────┐                           │
        │  Investors  │───────────────────────────┘
        │  Reinvest   │
        └─────────────┘
```

---

## Technical Implementation

### Smart Contract Architecture

```
LIQUIDITY & STAKING CONTRACTS
═════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│   │ STAKING         │    │ DIVIDEND        │    │ LIQUIDITY       │       │
│   │ CONTRACT        │    │ CONTRACT        │    │ ROUTER          │       │
│   │                 │    │                 │    │                 │       │
│   │ • stake()       │    │ • deposit()     │    │ • addLiquidity()│       │
│   │ • unstake()     │    │ • claim()       │    │ • removeLiq()   │       │
│   │ • getRewards()  │    │ • distribute()  │    │ • swap()        │       │
│   │ • compound()    │    │ • getBalance()  │    │                 │       │
│   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘       │
│            │                      │                      │                 │
│            └──────────────────────┼──────────────────────┘                 │
│                                   │                                        │
│                                   ▼                                        │
│                         ┌─────────────────┐                               │
│                         │ MASTER          │                               │
│                         │ CONTRACT        │                               │
│                         │                 │                               │
│                         │ • Owner state   │                               │
│                         │ • Share count   │                               │
│                         │ • Revenue data  │                               │
│                         └─────────────────┘                               │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Gas Optimization

| Operation | Estimated Gas | Optimization |
|-----------|---------------|--------------|
| Stake tokens | ~50k | Batch staking |
| Unstake tokens | ~50k | Lazy execution |
| Claim dividend | ~30k | Merkle proofs |
| Swap tokens | ~100k | Aggregator routing |
| Add liquidity | ~150k | Batched approval |

### Security Considerations

| Risk | Mitigation |
|------|------------|
| Impermanent loss | Education, insurance pools |
| Smart contract bugs | Audits, formal verification |
| Flash loan attacks | Price oracles, time locks |
| Rug pulls | Liquidity locks, transparency |

---

## Status

| Component | Status | Notes |
|-----------|--------|-------|
| Artist Coin Creation | 🔄 PLANNED | At first IPO |
| Liquidity Pool Setup | 🔄 PLANNED | Uniswap V3 integration |
| Token Staking | 🔄 PLANNED | Contract design complete |
| NFT Staking | 💡 EXPERIMENTAL | Design phase |
| Dividend Distribution | 🔄 PLANNED | Contract design complete |
| Frontend Display | ✅ CURRENT | Mock implementation |

---

## Related Documents

- [Token Model](./token-model.md) - Token standards
- [Master IPO](./master-ipo.md) - Share creation
- [Mover Advantage](./mover-advantage.md) - Royalty mechanics
- [Architecture Overview](../architecture/overview.md) - System design
- [Security Overview](../architecture/security-overview.md) - Contract security

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
