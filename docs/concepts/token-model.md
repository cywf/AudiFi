# Token Model

> ERC Token Standards and Their Usage in AudiFi

## Overview

AudiFi leverages multiple Ethereum token standards to create a comprehensive ecosystem for music ownership, trading, and governance. Each standard serves a specific purpose in the platform's architecture.

---

## Token Standards Summary

| Standard | Purpose in AudiFi | Token Type |
|----------|-------------------|------------|
| **ERC-2981** | Royalty information on NFTs | Interface |
| **ERC-721C** | Master-share NFTs | Non-Fungible |
| **ERC-1155C** | Utility tokens and passes | Semi-Fungible |
| **ERC-20** | Artist Coin | Fungible |

---

## ERC-2981: NFT Royalty Standard

### What It Is

ERC-2981 is an interface standard that allows NFTs to communicate royalty information to marketplaces. It doesn't enforce royalties—it provides a standard way to query them.

### How AudiFi Uses It

Every NFT share in AudiFi implements ERC-2981 to:
- Report royalty percentage (Mover Advantage tier)
- Specify royalty recipient (artist address)
- Enable compatible marketplace integration

### Implementation

```solidity
// Interface
interface IERC2981 {
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount);
}

// AudiFi Implementation
function royaltyInfo(uint256 tokenId, uint256 salePrice)
    external
    view
    returns (address receiver, uint256 royaltyAmount)
{
    uint256 tier = getMoverTier(tokenId);
    uint256 royaltyPercent = tierToRoyalty(tier); // 10%, 5%, 3%, or 1%
    
    return (
        artistAddress,
        (salePrice * royaltyPercent) / 100
    );
}
```

### Marketplace Support

ERC-2981 is recognized by:
- OpenSea
- Rarible
- LooksRare
- AudiFi Marketplace (native)

> **Note:** ERC-2981 support varies by marketplace. Always verify current support before listing.

> **Learn more:** [Mover Advantage](./mover-advantage.md)

---

## ERC-721C: Master-Share NFTs

### What It Is

ERC-721C is a creator-controlled NFT standard developed by Limit Break. It extends ERC-721 with:
- Programmable transfer restrictions
- Creator-controlled operator filtering
- On-chain royalty enforcement

### Why ERC-721C (vs. Standard ERC-721)

| Feature | ERC-721 | ERC-721C |
|---------|---------|----------|
| Royalty information | Optional (ERC-2981) | Built-in |
| Royalty enforcement | None | Creator-controlled |
| Transfer restrictions | None | Programmable |
| Operator filtering | None | Whitelist/blacklist |

### How AudiFi Uses It

Each Master IPO mints shares as ERC-721C tokens:

```
MASTER IPO: "Electric Dreams"
════════════════════════════════

Total Shares: 1,000 ERC-721C tokens

Token ID    Owner           Tier    Royalty
─────────────────────────────────────────────
#1          0xArtist...     1       10%
#2          0xFan1...       1       10%
...
#10         0xFan10...      1       10%
#11         0xFan11...      2       5%
...
#50         0xFan50...      2       5%
#51         0xFan51...      3       3%
...
#100        0xFan100...     3       3%
#101        0xFan101...     4       1%
...
#1000       0xFan1000...    4       1%
```

### Token Metadata

Each NFT share includes:

```json
{
  "name": "Electric Dreams Share #7",
  "description": "Fractional ownership in 'Electric Dreams' by Nova",
  "image": "ipfs://QmCoverArt...",
  "animation_url": "ipfs://QmAudioPreview...",
  "external_url": "https://audifi.io/masters/electric-dreams",
  "attributes": [
    {
      "trait_type": "Artist",
      "value": "Nova"
    },
    {
      "trait_type": "Track",
      "value": "Electric Dreams"
    },
    {
      "trait_type": "Share Number",
      "value": 7
    },
    {
      "trait_type": "Total Shares",
      "value": 1000
    },
    {
      "trait_type": "Mover Tier",
      "value": "Tier 1 (Pioneer)"
    },
    {
      "trait_type": "Royalty Percentage",
      "value": "10%"
    },
    {
      "trait_type": "Dividend Eligible",
      "value": "Yes"
    }
  ],
  "properties": {
    "master_contract": "0x...",
    "dividend_contract": "0x...",
    "artist_coin": "0x..."
  }
}
```

### Operator Filtering

ERC-721C allows AudiFi to:
- Block zero-royalty marketplaces
- Require royalty-compliant transfers
- Maintain artist revenue streams

---

## ERC-1155C: Utility Tokens and Passes

### What It Is

ERC-1155 is a multi-token standard that allows a single contract to manage multiple token types—both fungible and non-fungible. The "C" variant adds creator controls.

### How AudiFi Uses It

> **Status:** 🔄 PLANNED (early design phase)

ERC-1155C tokens will provide:

| Token Type | Purpose | Fungible? |
|------------|---------|-----------|
| **V Studio Pass** | Access to V Studio sessions | Yes |
| **Producer Badge** | Verified producer status | Yes |
| **Early Access Token** | Pre-IPO access | Yes |
| **Artist Membership** | Tiered fan membership | Yes |
| **Event Ticket** | Virtual/physical event access | Yes |
| **Achievement Badge** | On-chain achievements | No |

### Use Cases

#### V Studio Access Pass

```
V STUDIO GOLD PASS
═══════════════════

Token ID: 1001 (ERC-1155C)
Supply: Unlimited (purchasable)
Price: 10 USDC or 100 Artist Coin

Benefits:
• Unlimited V Studio session access
• 2x voting weight
• Early Master IPO notifications
• Producer submission rights
```

#### Artist Membership Tiers

```
NOVA FAN CLUB MEMBERSHIP
═════════════════════════

BRONZE (Token ID: 2001)
• Basic access
• 1x voting weight
• Public chat

SILVER (Token ID: 2002)
• V Studio access
• 2x voting weight
• Private Discord

GOLD (Token ID: 2003)
• All above + early IPO access
• 3x voting weight
• Monthly calls with Nova
```

---

## ERC-20: Artist Coin

### What It Is

ERC-20 is the standard for fungible tokens on Ethereum. Each token is identical and interchangeable.

### Artist Coin Overview

When an artist launches their **first** Master IPO, an Artist Coin is automatically created:

```
ARTIST COIN CREATION
════════════════════

Artist: Nova
First Master IPO: "Electric Dreams"

At IPO Launch:
┌────────────────────────────────────────────────┐
│                                                │
│   NOVA COIN (NOVA) Created                     │
│   ─────────────────────────                    │
│                                                │
│   Total Supply: 1,000,000 NOVA                 │
│                                                │
│   Initial Distribution:                        │
│   • Artist Treasury: 300,000 (30%)            │
│   • IPO Participants: 200,000 (20%)           │
│   • Liquidity Pool: 250,000 (25%)             │
│   • Community/Rewards: 250,000 (25%)          │
│                                                │
└────────────────────────────────────────────────┘
```

### Artist Coin Utility

| Use Case | Description |
|----------|-------------|
| **V Studio Access** | Required for certain voting tiers |
| **Governance** | Vote on artist ecosystem decisions |
| **Trading** | Trade on DEXs, liquidity pools |
| **Staking** | Stake for rewards and voting power |
| **Early Access** | Priority access to new IPOs |
| **Merchandise** | Exclusive merch purchases |
| **Events** | Virtual meet-and-greets |

### Token Economics

```
NOVA COIN ECONOMICS
═══════════════════

Supply: Fixed at creation (deflationary mechanics optional)

Utility Demand:
• V Studio access → Holders needed
• IPO priority → Incentivizes holding
• Governance → Active participation

Market Dynamics:
• Trading pairs: NOVA/ETH, NOVA/USDC
• Liquidity from initial pool
• Price discovery through market
```

### Artist Ecosystem Health

Artist Coin serves as a "health indicator" for an artist's ecosystem:

| Metric | Healthy Signal | Warning Signal |
|--------|----------------|----------------|
| Trading Volume | Consistent activity | Declining or zero |
| Holder Count | Growing | Declining |
| Price Trend | Stable or up | Steep decline |
| V Studio Participation | High | Low |
| IPO Success | Quick sellouts | Unsold shares |

---

## Token Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TOKEN ECOSYSTEM RELATIONSHIPS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          ┌──────────────────┐                               │
│                          │   ARTIST COIN    │                               │
│                          │    (ERC-20)      │                               │
│                          └────────┬─────────┘                               │
│                                   │                                         │
│                    ┌──────────────┼──────────────┐                         │
│                    │              │              │                         │
│                    ▼              ▼              ▼                         │
│           ┌───────────┐   ┌───────────┐   ┌───────────┐                   │
│           │ LIQUIDITY │   │ GOVERNANCE│   │  ACCESS   │                   │
│           │   POOL    │   │  VOTING   │   │  GATING   │                   │
│           └─────┬─────┘   └───────────┘   └─────┬─────┘                   │
│                 │                               │                          │
│                 │                               │                          │
│                 ▼                               ▼                          │
│     ┌─────────────────────────────────────────────────────────┐           │
│     │                    NFT SHARES (ERC-721C)                │           │
│     │                                                         │           │
│     │  Share #1    Share #2    Share #3   ...   Share #N     │           │
│     │  (Tier 1)    (Tier 1)    (Tier 1)        (Tier 4)      │           │
│     │                                                         │           │
│     │  ┌──────────────────────────────────────────────────┐  │           │
│     │  │ ERC-2981 Royalty Info │ Mover Advantage Tiers    │  │           │
│     │  └──────────────────────────────────────────────────┘  │           │
│     └──────────────────────────────────┬──────────────────────┘           │
│                                        │                                   │
│                                        ▼                                   │
│                            ┌───────────────────┐                          │
│                            │ UTILITY TOKENS    │                          │
│                            │   (ERC-1155C)     │                          │
│                            │                   │                          │
│                            │ • V Studio Pass   │                          │
│                            │ • Memberships     │                          │
│                            │ • Badges          │                          │
│                            └───────────────────┘                          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Cross-Token Interactions

### NFT + Artist Coin

- NFT holders may receive Artist Coin airdrops
- Staking both may provide bonus yields
- Combined holdings increase governance power

### ERC-1155 + NFT Shares

- Utility tokens may unlock NFT features
- Membership tiers affect dividend rates
- Badges display on NFT holder profiles

### All Tokens + V Studio

- Artist Coin required for premium voting
- NFT shares required for exclusive decisions
- ERC-1155 passes for general access

---

## Implementation Status

| Token Type | Status | Notes |
|------------|--------|-------|
| ERC-2981 (Royalty Interface) | 🔄 PLANNED | Standard implementation |
| ERC-721C (NFT Shares) | 🔄 PLANNED | Limit Break integration |
| ERC-1155C (Utility) | 💡 EXPERIMENTAL | Design phase |
| ERC-20 (Artist Coin) | 🔄 PLANNED | Standard with extensions |
| Frontend Display | ✅ CURRENT | Mock implementations |

---

## Security Considerations

### Smart Contract Auditing

All token contracts will undergo:
- Professional security audit
- Formal verification (if applicable)
- Bug bounty program

### Known Risks

| Risk | Mitigation |
|------|------------|
| Royalty bypass | ERC-721C operator filtering |
| Contract bugs | Audit + upgradeable patterns |
| Key compromise | Multi-sig treasury |
| Liquidity drain | Timelock + limits |

---

## Related Documents

- [Master IPO](./master-ipo.md) - NFT share context
- [Mover Advantage](./mover-advantage.md) - Royalty tiers
- [Liquidity and Staking](./liquidity-and-staking.md) - Token economics
- [V Studio](./vstudio.md) - Access gating
- [Security Overview](../architecture/security-overview.md) - Contract security

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
