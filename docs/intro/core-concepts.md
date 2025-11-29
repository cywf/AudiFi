# Core Concepts

> A glossary and quick reference for key AudiFi terminology and concepts

## Overview

This document provides brief definitions of all core AudiFi concepts with links to detailed documentation. Use this as a reference guide and starting point for deeper exploration.

---

## Concept Map

```
                           ┌────────────────┐
                           │    ARTIST      │
                           │    COIN        │
                           │   (ERC-20)     │
                           └───────┬────────┘
                                   │
                                   │ created on
                                   │ first IPO
                                   ▼
┌──────────────┐    upload    ┌────────────────┐    shares     ┌──────────────┐
│   V STUDIO   │◀────────────│   MASTER IPO   │──────────────▶│  NFT SHARES  │
│              │              │                │               │  (ERC-721C)  │
└──────┬───────┘              └───────┬────────┘               └──────┬───────┘
       │                              │                               │
       │ voting &                     │ registers                     │ royalties
       │ decisions                    ▼                               ▼
       │                      ┌────────────────┐               ┌──────────────┐
       └─────────────────────▶│    MASTER      │──────────────▶│  DIVIDEND    │
                              │   CONTRACT     │               │  CONTRACT    │
                              └────────────────┘               └──────────────┘
                                      │
                                      │ resales trigger
                                      ▼
                              ┌────────────────┐
                              │     MOVER      │
                              │   ADVANTAGE    │
                              └────────────────┘
```

---

## Glossary

### A

#### Artist Coin
**Type:** ERC-20 Token  
**Status:** 🔄 PLANNED

A fungible token unique to each artist, automatically created when they launch their first Master IPO. Artist Coin:
- Represents the artist's overall ecosystem value
- Can be used for governance and access
- Connects to liquidity pools with NFT shares
- Signals artist reputation and community health

> **Learn more:** [Token Model - Artist Coin](../concepts/token-model.md#erc-20-artist-coin)

---

### D

#### Decision Point
**Type:** V Studio Feature  
**Status:** 🔄 PLANNED

A specific creative element within a V Studio session that is opened for voting. Examples include:
- Hook selection
- Arrangement choices
- Effects and mix decisions
- Artwork selection
- Tracklist ordering

> **Learn more:** [V Studio](../concepts/vstudio.md)

#### Dividend Contract
**Type:** Smart Contract  
**Status:** 🔄 PLANNED

A smart contract responsible for tracking and distributing royalties to NFT shareholders. When revenue is generated from a master (sales, streams, licensing), the Dividend Contract calculates each shareholder's portion and handles distribution.

> **Learn more:** [Master IPO - Contracts](../concepts/master-ipo.md#contract-architecture)

---

### L

#### Liquidity Pool
**Type:** DeFi Mechanism  
**Status:** 🔄 PLANNED

Automated market maker pools that provide trading liquidity for Artist Coin and NFT shares. Each Master IPO can optionally connect to a liquidity pool, enabling:
- Price discovery
- Easy trading
- Yield generation

> **Learn more:** [Liquidity and Staking](../concepts/liquidity-and-staking.md)

---

### M

#### Master
**Type:** Core Concept  
**Status:** ✅ CURRENT

In the music industry, a "master" or "master recording" is the original, final recording of a song from which all copies are made. Whoever owns the master controls:
- How the recording is distributed
- Who can license it
- Revenue from its use

In AudiFi, masters are registered on-chain and their ownership can be fractionalized.

#### Master Contract
**Type:** Smart Contract  
**Status:** 🔄 PLANNED

A smart contract representing a registered master recording. Contains:
- Master metadata and IPFS hash
- Ownership configuration
- Revenue share structure
- Link to associated Dividend Contract

> **Learn more:** [Master IPO](../concepts/master-ipo.md)

#### Master IPO
**Type:** Core Feature  
**Status:** 🔄 PLANNED

The process of offering fractional ownership in a music master to the public. Similar to how companies go public with stock, artists "go public" with their masters:

1. **Register** - Upload master to IPFS, create Master Contract
2. **Configure** - Set share count, pricing, royalty structure
3. **Mint** - Create NFT shares representing ownership
4. **Distribute** - Sell shares to fans and investors

> **Learn more:** [Master IPO](../concepts/master-ipo.md)

#### Mover Advantage
**Type:** Economic Model  
**Status:** 🔄 PLANNED

A tiered royalty structure that rewards early supporters:
- **First 10 minters:** 10% royalty on resales
- **Next 40 minters:** 5% royalty on resales
- **Next 50 minters:** 3% royalty on resales
- **All subsequent:** 1% royalty on resales

This incentivizes early discovery and investment while ensuring all holders benefit from secondary sales.

> **Learn more:** [Mover Advantage](../concepts/mover-advantage.md)

---

### N

#### NFT Share
**Type:** ERC-721C Token  
**Status:** 🔄 PLANNED

A non-fungible token representing fractional ownership in a music master. Each NFT share:
- Entitles holder to proportional revenue share
- Can be traded on secondary markets
- Carries Mover Advantage royalties
- May grant V Studio access

> **Learn more:** [Token Model - ERC-721C](../concepts/token-model.md#erc-721c)

---

### S

#### Staking
**Type:** DeFi Mechanism  
**Status:** 🔄 PLANNED

The process of locking NFT shares to earn additional rewards. Staked shares:
- Generate yield from liquidity provision
- May receive bonus dividend allocations
- Demonstrate long-term commitment

> **Learn more:** [Liquidity and Staking](../concepts/liquidity-and-staking.md)

---

### V

#### V Studio
**Type:** Core Feature  
**Status:** 🔄 PLANNED

An interactive environment where the "final 10-20%" of a track is completed collaboratively:

**Roles:**
- **Artist:** Uploads near-final track, defines decision points
- **Producer:** Provides professional input, earns for contributions
- **Viewer:** Votes on decisions (may require NFT/Artist Coin/subscription)

**Flow:**
1. Artist uploads near-complete track
2. Decision points are defined
3. Voting/collaboration period
4. Final master is locked
5. Master IPO launches

> **Learn more:** [V Studio](../concepts/vstudio.md)

---

## Token Standards Reference

| Standard | Usage in AudiFi | Status |
|----------|-----------------|--------|
| **ERC-2981** | NFT royalty standard for on-chain royalty info | 🔄 PLANNED |
| **ERC-721C** | Master-share NFTs with creator controls | 🔄 PLANNED |
| **ERC-1155C** | Multi-token utilities and passes | 🔄 PLANNED |
| **ERC-20** | Artist Coin fungible tokens | 🔄 PLANNED |

> **Learn more:** [Token Model](../concepts/token-model.md)

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ CURRENT | Implemented and live |
| 🔄 PLANNED | Approved design, not yet implemented |
| 💡 EXPERIMENTAL | Early-stage thinking, subject to change |

---

## Related Documents

- [What is AudiFi?](./what-is-audifi.md)
- [Master IPO](../concepts/master-ipo.md)
- [V Studio](../concepts/vstudio.md)
- [Token Model](../concepts/token-model.md)
- [Mover Advantage](../concepts/mover-advantage.md)
- [Liquidity and Staking](../concepts/liquidity-and-staking.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
