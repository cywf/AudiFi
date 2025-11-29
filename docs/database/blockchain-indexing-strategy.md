# Blockchain Indexing Strategy

**Document Version**: 1.0  
**Last Updated**: 2024-12

---

## Overview

This document describes the strategy for indexing blockchain data into the AudiFi database. It covers which events to index, how to handle chain reorganizations, and the mapping between on-chain events and database tables.

---

## 1. Indexing Architecture

### 1.1 Options Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Custom Indexer** | Full control, optimized for needs | Development overhead |
| **The Graph (Subgraph)** | Decentralized, proven | GraphQL only, hosting costs |
| **Third-party (Alchemy, Moralis)** | Quick to implement | Vendor lock-in, limitations |
| **Hybrid** | Best of both worlds | Complexity |

### 1.2 Recommended Approach: Hybrid

1. **The Graph Subgraph** for standard ERC-721/ERC-20 events
2. **Custom Indexer** for AudiFi-specific events (dividends, V Studio verification)
3. **Webhook listeners** for real-time updates during active IPOs

---

## 2. Contracts to Index

### 2.1 Master Contract (ERC-721C)

**Contract Type**: ERC-721 with custom royalty enforcement

| Event | Description | Priority |
|-------|-------------|----------|
| `Transfer` | NFT ownership changes | High |
| `Approval` | Approval for transfer | Low |
| `ApprovalForAll` | Operator approval | Low |
| `Mint` (custom) | New token minted | High |
| `Burn` (custom) | Token burned | Medium |

### 2.2 Dividend Contract

**Contract Type**: Custom dividend distribution

| Event | Description | Priority |
|-------|-------------|----------|
| `RevenueDeposited` | Revenue added to contract | High |
| `DividendsDistributed` | Dividends allocated | High |
| `DividendClaimed` | Holder claimed dividend | High |

### 2.3 Artist Coin (ERC-20)

**Contract Type**: Standard ERC-20

| Event | Description | Priority |
|-------|-------------|----------|
| `Transfer` | Token transfers | High |
| `Approval` | Allowance changes | Low |

### 2.4 Liquidity Pool Events

**Contract Type**: Uniswap V2/V3 or similar

| Event | Description | Priority |
|-------|-------------|----------|
| `Swap` | Token swaps | High |
| `Mint` | Liquidity added | Medium |
| `Burn` | Liquidity removed | Medium |

---

## 3. Event to Table Mapping

### 3.1 Master Contract Events

#### Transfer Event

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
```

**Database Operations**:

```typescript
async function handleTransfer(event: TransferEvent) {
  const { from, to, tokenId, txHash, blockNumber, logIndex, timestamp } = event;
  
  // 1. Update master_nfts ownership
  await db.update(masterNfts)
    .set({
      currentOwnerWallet: to,
      lastIndexedBlock: blockNumber,
      lastIndexedAt: new Date(),
    })
    .where(and(
      eq(masterNfts.contractAddress, event.address),
      eq(masterNfts.tokenId, tokenId),
    ));
  
  // 2. Insert transfer record
  await db.insert(nftTransfers).values({
    masterNftId: nftId,
    masterId: masterId,
    tokenId,
    chainId: event.chainId,
    contractAddress: event.address,
    fromWallet: from,
    toWallet: to,
    txHash,
    blockNumber,
    logIndex,
    blockTimestamp: timestamp,
    transferType: from === ZERO_ADDRESS ? 'mint' : 'transfer',
  });
  
  // 3. Check for Mover Advantage (first three mints)
  if (from === ZERO_ADDRESS) {
    await checkMoverAdvantage(event);
  }
}
```

#### Mint Event (if custom)

```solidity
event Minted(address indexed minter, uint256 indexed tokenId, uint256 price);
```

**Database Operations**:

```typescript
async function handleMint(event: MintEvent) {
  const { minter, tokenId, price, txHash, blockNumber, timestamp } = event;
  
  // 1. Create master_nfts record
  await db.insert(masterNfts).values({
    masterId,
    masterContractId,
    tokenId,
    chainId: event.chainId,
    contractAddress: event.address,
    currentOwnerWallet: minter,
    originalMinterWallet: minter,
    mintTxHash: txHash,
    mintedAtBlock: blockNumber,
    mintedAt: timestamp,
    mintPriceWei: price.toString(),
    isFirstMinter: tokenId === 1,
    isSecondMinter: tokenId === 2,
    isThirdMinter: tokenId === 3,
  });
  
  // 2. Update IPO minted supply
  await db.update(masterIpos)
    .set({
      mintedSupply: sql`${masterIpos.mintedSupply} + 1`,
    })
    .where(eq(masterIpos.masterId, masterId));
}
```

### 3.2 Dividend Contract Events

#### RevenueDeposited Event

```solidity
event RevenueDeposited(uint256 amount, address token, uint256 timestamp);
```

**Database Operations**:

```typescript
async function handleRevenueDeposited(event: RevenueDepositedEvent) {
  // 1. Update dividend_contracts totals
  await db.update(dividendContracts)
    .set({
      totalRevenueDeposited: sql`${dividendContracts.totalRevenueDeposited} + ${event.amount}`,
      lastIndexedBlock: event.blockNumber,
    })
    .where(eq(dividendContracts.contractAddress, event.address));
  
  // 2. Insert dividend event
  await db.insert(dividendEvents).values({
    dividendContractId,
    masterId,
    eventType: 'deposit',
    chainId: event.chainId,
    contractAddress: event.address,
    txHash: event.txHash,
    blockNumber: event.blockNumber,
    logIndex: event.logIndex,
    blockTimestamp: event.timestamp,
    totalAmount: event.amount.toString(),
    currency: event.token,
  });
}
```

#### DividendClaimed Event

```solidity
event DividendClaimed(address indexed holder, uint256 tokenId, uint256 amount);
```

**Database Operations**:

```typescript
async function handleDividendClaimed(event: DividendClaimedEvent) {
  // 1. Insert claim record
  await db.insert(dividendClaims).values({
    walletAddress: event.holder,
    masterId,
    dividendContractId,
    tokenId: event.tokenId,
    amountClaimed: event.amount.toString(),
    currency: 'ETH',
    txHash: event.txHash,
    blockNumber: event.blockNumber,
    blockTimestamp: event.timestamp,
    chainId: event.chainId,
  });
  
  // 2. Update wallet dividend balance
  await db.update(walletDividendBalances)
    .set({
      totalClaimed: sql`${walletDividendBalances.totalClaimed} + ${event.amount}`,
      claimableAmount: sql`${walletDividendBalances.claimableAmount} - ${event.amount}`,
      lastClaimedAt: event.timestamp,
      lastClaimTxHash: event.txHash,
    })
    .where(and(
      eq(walletDividendBalances.walletAddress, event.holder),
      eq(walletDividendBalances.masterId, masterId),
    ));
}
```

### 3.3 Artist Coin (ERC-20) Events

#### Transfer Event

```typescript
async function handleErc20Transfer(event: TransferEvent) {
  const { from, to, value, txHash, blockNumber } = event;
  
  // 1. Update sender balance
  if (from !== ZERO_ADDRESS) {
    await db.update(tokenHolders)
      .set({
        balance: sql`${tokenHolders.balance} - ${value}`,
      })
      .where(and(
        eq(tokenHolders.artistTokenId, tokenId),
        eq(tokenHolders.walletAddress, from),
      ));
  }
  
  // 2. Update/create recipient balance
  await db.insert(tokenHolders)
    .values({
      artistTokenId: tokenId,
      walletAddress: to,
      chainId: event.chainId,
      balance: value.toString(),
      firstAcquiredAt: event.timestamp,
      firstAcquiredTxHash: txHash,
    })
    .onConflictDoUpdate({
      target: [tokenHolders.artistTokenId, tokenHolders.walletAddress],
      set: {
        balance: sql`${tokenHolders.balance} + ${value}`,
      },
    });
}
```

---

## 4. Chain Reorganization Handling

### 4.1 The Problem

Blockchain reorganizations (reorgs) can invalidate recently indexed data. A block that was indexed may be replaced by a different block.

### 4.2 Mitigation Strategy

1. **Confirmation Depth**: Only consider blocks "final" after N confirmations
   - Ethereum: 12-64 blocks (~2-15 minutes)
   - Solana: Use finalized commitment

2. **Safe Block Tracking**: Store last "safe" block number

```typescript
interface IndexerState {
  lastIndexedBlock: bigint;
  lastSafeBlock: bigint; // lastIndexedBlock - CONFIRMATION_DEPTH
  lastIndexedAt: Date;
}
```

3. **Reorg Detection**: Compare expected parent hash with actual

```typescript
async function detectReorg(block: Block): Promise<boolean> {
  const stored = await getStoredBlockHash(block.number - 1);
  return stored !== block.parentHash;
}
```

4. **Rollback Procedure**:

```typescript
async function handleReorg(forkBlock: bigint) {
  // 1. Delete events from forked blocks
  await db.delete(nftTransfers)
    .where(gte(nftTransfers.blockNumber, forkBlock));
  
  await db.delete(dividendEvents)
    .where(gte(dividendEvents.blockNumber, forkBlock));
  
  // 2. Rebuild state from remaining events
  await rebuildAggregates(forkBlock);
  
  // 3. Re-index from fork point
  await reindexFromBlock(forkBlock);
}
```

### 4.3 Schema Support for Reorgs

Key fields for reorg handling:

```typescript
// All on-chain event tables include:
{
  blockNumber: numeric('block_number'),
  txHash: varchar('tx_hash'),
  logIndex: integer('log_index'), // Unique within transaction
}
```

Unique constraint: `(txHash, logIndex)` ensures idempotent processing.

---

## 5. Indexer Architecture

### 5.1 Components

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  RPC Provider   │────▶│    Indexer      │────▶│   PostgreSQL    │
│  (Alchemy/etc)  │     │    Service      │     │    Database     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Event Queue   │
                        │  (Redis/Bull)   │
                        └─────────────────┘
```

### 5.2 Indexer Modes

1. **Historical Sync**: Index all events from contract deployment
2. **Real-time Sync**: Subscribe to new events via WebSocket
3. **Backfill**: Re-index specific block ranges

### 5.3 Checkpointing

```typescript
interface Checkpoint {
  chainId: string;
  contractAddress: string;
  lastProcessedBlock: bigint;
  lastProcessedAt: Date;
  status: 'syncing' | 'live' | 'paused' | 'error';
}
```

Store in `master_contracts.last_indexed_block` and `dividend_contracts.last_indexed_block`.

---

## 6. Multi-Chain Considerations

### 6.1 Supported Chains

| Chain | Chain ID | Block Time | Confirmation Depth |
|-------|----------|------------|-------------------|
| Ethereum Mainnet | 1 | ~12s | 12-64 blocks |
| Polygon | 137 | ~2s | 128 blocks |
| Arbitrum | 42161 | ~0.25s | 1 block |
| Solana | solana | ~0.4s | Finalized commitment |

### 6.2 Chain-Specific Handling

- **Ethereum/EVM**: Use standard `eth_getLogs` and WebSocket subscriptions
- **Solana**: Use Anchor events or account subscription
- **L2s**: Account for L1 finality for high-value events

---

## 7. Error Handling

### 7.1 Error Categories

| Category | Example | Handling |
|----------|---------|----------|
| Transient | RPC timeout | Retry with backoff |
| Permanent | Invalid event data | Log and skip |
| Critical | Database unavailable | Pause and alert |

### 7.2 Retry Strategy

```typescript
const retryConfig = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 60000,
  factor: 2,
};
```

### 7.3 Dead Letter Queue

Events that fail after max retries go to a dead letter queue for manual investigation.

---

## 8. Monitoring & Alerting

### 8.1 Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Blocks Behind | Current block - last indexed | > 100 blocks |
| Events/Second | Processing throughput | < 10 (during sync) |
| Error Rate | Failed event processing | > 1% |
| Queue Depth | Pending events | > 10,000 |

### 8.2 Health Checks

```typescript
async function healthCheck(): Promise<HealthStatus> {
  const latestBlock = await getLatestBlock();
  const lastIndexed = await getLastIndexedBlock();
  const behind = latestBlock - lastIndexed;
  
  return {
    status: behind < 100 ? 'healthy' : 'degraded',
    blocksBehind: behind,
    lastIndexedAt: await getLastIndexedTime(),
  };
}
```

---

## 9. Implementation Timeline

### Phase 1: MVP (Month 1-2)
- [ ] Set up The Graph subgraph for ERC-721 events
- [ ] Implement basic Transfer/Mint indexing
- [ ] Manual refresh for aggregates

### Phase 2: Full Indexing (Month 3-4)
- [ ] Custom indexer for Dividend Contract events
- [ ] ERC-20 token indexing
- [ ] Real-time event processing

### Phase 3: Advanced (Month 5+)
- [ ] AMM/DEX integration
- [ ] Cross-chain indexing
- [ ] Historical analytics
