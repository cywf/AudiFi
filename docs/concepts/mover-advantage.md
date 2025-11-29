# Mover Advantage

> Tiered Royalty Structure Rewarding Early Supporters

## Overview

**Mover Advantage** is AudiFi's innovative royalty structure that rewards early believers in an artist's music. The earlier you mint or purchase an NFT share, the higher your ongoing royalty percentage on future resales of that share.

---

## The Structure

Mover Advantage creates four tiers based on minting order:

| Tier | Position | Royalty % | Description |
|------|----------|-----------|-------------|
| **Tier 1** | First 10 minters | 10% | Pioneer supporters |
| **Tier 2** | Minters 11-50 | 5% | Early adopters |
| **Tier 3** | Minters 51-100 | 3% | Growing community |
| **Tier 4** | Minters 101+ | 1% | General participants |

These percentages apply to **secondary sales** of that specific NFT share.

---

## How It Works

### Initial Purchase

```
MASTER IPO: "Electric Dreams" by Nova
══════════════════════════════════════

Initial Price: 0.1 ETH per share
Total Shares: 1,000

                    MINTING ORDER
    ┌─────────────────────────────────────────┐
    │                                         │
    │   #1-10      #11-50     #51-100   #101+ │
    │   (10%)      (5%)       (3%)      (1%)  │
    │    │           │          │         │   │
    │    ▼           ▼          ▼         ▼   │
    │  ┌───┐      ┌───┐      ┌───┐     ┌───┐ │
    │  │ T1│      │ T2│      │ T3│     │ T4│ │
    │  └───┘      └───┘      └───┘     └───┘ │
    │                                         │
    └─────────────────────────────────────────┘
```

### Secondary Sale Example

When a Tier 1 share is resold:

```
SECONDARY SALE: Tier 1 Share #7
════════════════════════════════

Seller (Original Holder): Sells for 0.5 ETH

               ROYALTY DISTRIBUTION
    ┌─────────────────────────────────────────┐
    │                                         │
    │   Sale Price: 0.5 ETH                   │
    │                                         │
    │   ┌────────────────────────────────────┐│
    │   │ Artist Royalty (10%): 0.05 ETH     ││
    │   │ (Mover Advantage Tier 1)           ││
    │   └────────────────────────────────────┘│
    │                                         │
    │   Seller Receives: 0.45 ETH            │
    │   New Owner: Inherits Tier 1 status    │
    │                                         │
    └─────────────────────────────────────────┘
```

### Comparison Across Tiers

For a 1 ETH resale:

| Tier | Royalty % | Artist Receives | Seller Receives |
|------|-----------|-----------------|-----------------|
| Tier 1 | 10% | 0.10 ETH | 0.90 ETH |
| Tier 2 | 5% | 0.05 ETH | 0.95 ETH |
| Tier 3 | 3% | 0.03 ETH | 0.97 ETH |
| Tier 4 | 1% | 0.01 ETH | 0.99 ETH |

---

## Incentive Structure

### For Artists

**Higher initial engagement:**
- Early supporters are more motivated to share and promote
- Creates urgency around IPO launches
- Builds dedicated fan base

**Ongoing revenue stream:**
- Higher royalties from most valuable shares
- Passive income on every resale
- Aligned incentives with early believers

### For Early Minters

**First-mover benefits:**
- Lower risk at initial price
- Higher resale value potential
- Community recognition (visible tier)
- Stronger connection to artist success

**Investment perspective:**
- Early shares often appreciate more
- High-royalty shares may trade at premium
- Demonstrates conviction to later buyers

### For Market Dynamics

**Healthy speculation:**
- Rewards research and discovery
- Discourages pure speculation (royalties reduce margins)
- Creates price discovery through tier premiums

**Secondary market behavior:**
- Tier 1 shares may command premium
- Active trading benefits artists
- Long-term holding still rewarded through dividends

---

## Smart Contract Implementation

### Technical Notes

> *For engineers*

#### ERC-2981 Integration

The royalty percentage is encoded per-token using ERC-2981:

```solidity
// Simplified example
function royaltyInfo(uint256 tokenId, uint256 salePrice)
    external
    view
    returns (address receiver, uint256 royaltyAmount)
{
    uint256 tier = getTier(tokenId);
    uint256 percentage = tierToPercentage(tier);
    
    return (artistAddress, (salePrice * percentage) / 100);
}

function tierToPercentage(uint256 tier) internal pure returns (uint256) {
    if (tier == 1) return 10;      // First 10
    if (tier == 2) return 5;       // 11-50
    if (tier == 3) return 3;       // 51-100
    return 1;                       // 101+
}
```

#### Tier Assignment

Tiers are assigned at mint time based on token ID order:

```solidity
function getTier(uint256 tokenId) public pure returns (uint256) {
    if (tokenId <= 10) return 1;
    if (tokenId <= 50) return 2;
    if (tokenId <= 100) return 3;
    return 4;
}
```

#### Metadata

Token metadata includes tier information:

```json
{
  "attributes": [
    {
      "trait_type": "Mover Tier",
      "value": "Tier 1"
    },
    {
      "trait_type": "Royalty Percentage",
      "value": "10%"
    },
    {
      "display_type": "number",
      "trait_type": "Mint Position",
      "value": 7
    }
  ]
}
```

---

## Tier Inheritance

When an NFT share is resold, the tier stays with the token:

```
OWNERSHIP TRANSFER
══════════════════

Share #3 (Tier 1 - 10%)
      │
      │ Sold from Alice to Bob
      │ (0.1 ETH → 0.5 ETH)
      ▼
Share #3 (Tier 1 - 10%)  ← Tier preserved
      │
      │ Sold from Bob to Carol
      │ (0.5 ETH → 1.0 ETH)
      ▼
Share #3 (Tier 1 - 10%)  ← Tier still preserved
```

The tier is a property of the token, not the holder.

---

## Market Implications

### Tier Premium

Tier 1 shares may trade at a premium because:
- Higher royalty = more value to artist
- Stronger signal of early support
- Rarity (only 10 exist)
- Collector appeal

### Trading Considerations

| Scenario | Impact |
|----------|--------|
| Artist goes viral | Tier 1 shares appreciate most |
| New album announcement | Early shares see increased demand |
| Artist hiatus | All tiers affected equally |
| General NFT market downturn | Higher tiers may hold value better |

### Arbitrage Prevention

High royalties on early shares discourage pure arbitrage:
- 10% fee on Tier 1 resales cuts into margins
- Encourages genuine support over quick flips
- Artists benefit from speculation anyway

---

## Edge Cases

### Tie-Breaking

If multiple mints occur in the same block:
- Transaction order within block determines tier
- Gas price may influence order
- Clear documentation of ordering rules

### Tier Boundaries

The current structure uses fixed boundaries:
- First 10: 10%
- Next 40: 5%
- Next 50: 3%
- Remainder: 1%

Future consideration: Dynamic boundaries based on total supply.

### Zero-Royalty Marketplaces

Some marketplaces bypass royalties:
- ERC-721C provides creator controls
- Operator filter can restrict
- Artist choice to enforce or not

---

## Configuration Options

Artists may have control over:

| Option | Default | Configurable |
|--------|---------|--------------|
| Tier 1 percentage | 10% | Yes (5-15%) |
| Tier 2 percentage | 5% | Yes (3-10%) |
| Tier 3 percentage | 3% | Yes (1-5%) |
| Tier 4 percentage | 1% | Yes (0.5-2%) |
| Tier boundaries | 10/50/100 | Yes |

---

## Visual Representation

### NFT Display

NFT shares display their tier prominently:

```
┌─────────────────────────────────────┐
│                                     │
│         [Cover Artwork]             │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  "Electric Dreams"           │   │
│  │   by Nova                    │   │
│  │                              │   │
│  │   Share #7 of 1,000          │   │
│  │                              │   │
│  │   ┌──────────────┐           │   │
│  │   │   TIER 1     │  10%      │   │
│  │   │   PIONEER    │  Royalty  │   │
│  │   └──────────────┘           │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Status

| Component | Status | Notes |
|-----------|--------|-------|
| Royalty Structure | 🔄 PLANNED | Percentages finalized |
| Smart Contract | 🔄 PLANNED | ERC-2981 integration |
| Tier Display | 🔄 PLANNED | UI design complete |
| Configuration | 💡 EXPERIMENTAL | Artist customization |
| Enforcement | 🔄 PLANNED | ERC-721C operator filter |

---

## Related Documents

- [Master IPO](./master-ipo.md) - Share minting context
- [Token Model](./token-model.md) - ERC standards
- [Liquidity and Staking](./liquidity-and-staking.md) - Trading mechanics
- [Architecture Overview](../architecture/overview.md) - System design

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
