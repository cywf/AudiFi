# AudiFi Analytics Schema

**Document Version**: 1.0  
**Last Updated**: 2024-12

---

## Overview

This document describes the analytics and reporting structures for AudiFi. These structures are designed to support dashboards, reports, and data-driven features without impacting the performance of operational queries.

---

## 1. Analytics Strategy

### 1.1 Approach

AudiFi uses a hybrid analytics approach:

1. **Materialized Views** - Pre-aggregated data refreshed on schedule
2. **Cached Aggregates** - Columns on tables that cache computed values
3. **Denormalized Tables** - Purpose-built analytics tables

### 1.2 Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| Materialized Views | Easy to implement, SQL-based | Refresh overhead, stale data |
| Cached Aggregates | Real-time, in-table | Consistency challenges |
| Denormalized Tables | Flexible, performant | ETL complexity |

For MVP, we primarily use **cached aggregates** and plan **materialized views** for Phase 2.

---

## 2. Cached Aggregates (Current)

The following tables have cached aggregate columns that are updated by triggers or background jobs:

### 2.1 Artist Statistics

Table: `artists`

| Column | Type | Description | Update Trigger |
|--------|------|-------------|----------------|
| `total_masters` | integer | Count of masters | On master create/delete |
| `total_sales` | integer | Count of NFT sales | On NFT transfer (sale) |
| `follower_count` | integer | Count of followers | On follow/unfollow |

### 2.2 Master IPO Statistics

Table: `master_ipos`

| Column | Type | Description | Update Trigger |
|--------|------|-------------|----------------|
| `minted_supply` | integer | Total tokens minted | On mint event |

### 2.3 V Studio Session Statistics

Table: `vstudio_sessions`

| Column | Type | Description | Update Trigger |
|--------|------|-------------|----------------|
| `participant_count` | integer | Unique participants | On participant join |
| `total_votes` | integer | Total votes cast | On vote submission |
| `peak_concurrent_viewers` | integer | Max concurrent viewers | Real-time tracking |

### 2.4 Token Market Data

Table: `artist_tokens`

| Column | Type | Description | Update Trigger |
|--------|------|-------------|----------------|
| `last_price_usd` | numeric | Most recent price | Price feed/swap events |
| `market_cap_usd` | numeric | Current market cap | Derived from price |
| `volume_24h_usd` | numeric | 24h trading volume | Aggregated from swaps |
| `holders_count` | numeric | Unique holders | On transfer events |

---

## 3. Planned Materialized Views (Phase 2)

### 3.1 Artist Performance Summary

```sql
CREATE MATERIALIZED VIEW mv_artist_performance AS
SELECT 
  a.id AS artist_id,
  a.artist_name,
  COUNT(DISTINCT m.id) AS total_masters,
  COUNT(DISTINCT mi.id) AS total_ipos,
  SUM(mi.minted_supply) AS total_nfts_minted,
  -- Revenue aggregates
  COALESCE(SUM(re.amount_usd), 0) AS total_revenue_usd,
  COALESCE(SUM(de.total_amount), 0) AS total_dividends_distributed,
  -- V Studio engagement
  COUNT(DISTINCT vs.id) AS total_vstudio_sessions,
  SUM(vs.total_votes) AS total_vstudio_votes,
  -- Time metrics
  MIN(m.created_at) AS first_master_created_at,
  MAX(m.created_at) AS last_master_created_at
FROM artists a
LEFT JOIN masters m ON m.artist_id = a.id
LEFT JOIN master_ipos mi ON mi.master_id = m.id
LEFT JOIN revenue_events re ON re.master_id = m.id AND re.status = 'distributed'
LEFT JOIN dividend_events de ON de.master_id = m.id AND de.event_type = 'distribution'
LEFT JOIN vstudio_sessions vs ON vs.artist_id = a.id
GROUP BY a.id, a.artist_name;

-- Refresh daily
CREATE INDEX idx_mv_artist_performance_id ON mv_artist_performance(artist_id);
```

**Refresh Strategy**: Daily at 00:00 UTC, or on-demand after significant events.

### 3.2 Master IPO Metrics

```sql
CREATE MATERIALIZED VIEW mv_master_ipo_metrics AS
SELECT 
  m.id AS master_id,
  m.title,
  a.artist_name,
  mi.total_supply,
  mi.minted_supply,
  ROUND(mi.minted_supply::numeric / mi.total_supply * 100, 2) AS percent_minted,
  -- Holder metrics
  COUNT(DISTINCT mn.current_owner_wallet) AS unique_holders,
  -- Secondary market
  COUNT(DISTINCT nt.id) FILTER (WHERE nt.transfer_type = 'sale') AS secondary_sales_count,
  COALESCE(SUM(nt.sale_price_wei) FILTER (WHERE nt.transfer_type = 'sale'), 0) AS total_secondary_volume_wei,
  -- Dividend metrics
  COALESCE(SUM(de.total_amount), 0) AS total_dividends_distributed
FROM masters m
JOIN artists a ON a.id = m.artist_id
LEFT JOIN master_ipos mi ON mi.master_id = m.id
LEFT JOIN master_nfts mn ON mn.master_id = m.id
LEFT JOIN nft_transfers nt ON nt.master_id = m.id
LEFT JOIN dividend_events de ON de.master_id = m.id AND de.event_type = 'distribution'
WHERE m.status = 'live'
GROUP BY m.id, m.title, a.artist_name, mi.total_supply, mi.minted_supply;

-- Refresh every 15 minutes
CREATE INDEX idx_mv_master_ipo_id ON mv_master_ipo_metrics(master_id);
```

### 3.3 V Studio Engagement Metrics

```sql
CREATE MATERIALIZED VIEW mv_vstudio_engagement AS
SELECT 
  vs.id AS session_id,
  vs.title,
  m.title AS master_title,
  a.artist_name,
  vs.status,
  vs.participant_count,
  vs.total_votes,
  -- Decision point breakdown
  COUNT(DISTINCT vdp.id) AS decision_points_count,
  COUNT(DISTINCT vv.id) AS votes_count,
  -- Engagement quality
  AVG(vp.total_time_seconds) AS avg_time_per_participant,
  -- Timing
  vs.scheduled_start_at,
  vs.actual_start_at,
  vs.actual_end_at
FROM vstudio_sessions vs
JOIN masters m ON m.id = vs.master_id
JOIN artists a ON a.id = vs.artist_id
LEFT JOIN vstudio_decision_points vdp ON vdp.vstudio_session_id = vs.id
LEFT JOIN vstudio_votes vv ON vv.vstudio_session_id = vs.id
LEFT JOIN vstudio_participants vp ON vp.vstudio_session_id = vs.id
GROUP BY vs.id, vs.title, m.title, a.artist_name, vs.status, 
         vs.participant_count, vs.total_votes, 
         vs.scheduled_start_at, vs.actual_start_at, vs.actual_end_at;

-- Refresh every 5 minutes for live sessions
CREATE INDEX idx_mv_vstudio_session_id ON mv_vstudio_engagement(session_id);
CREATE INDEX idx_mv_vstudio_status ON mv_vstudio_engagement(status);
```

---

## 4. Dashboard Query Patterns

### 4.1 Artist Dashboard

**Query: Get artist overview**
```typescript
// Uses cached aggregates on artists table
const artistStats = await db.query.artists.findFirst({
  where: eq(artists.userId, userId),
  with: {
    masters: {
      with: {
        ipo: true,
      },
    },
  },
});
```

**Indexes Required:**
- `artists.user_id` (exists)
- `masters.artist_id` (exists)

### 4.2 Portfolio Dashboard

**Query: Get holder's NFTs and dividends**
```typescript
const portfolio = await db.query.masterNfts.findMany({
  where: eq(masterNfts.currentOwnerWallet, walletAddress),
  with: {
    master: true,
    masterContract: true,
  },
});

const dividends = await db.query.walletDividendBalances.findMany({
  where: eq(walletDividendBalances.walletAddress, walletAddress),
});
```

**Indexes Required:**
- `master_nfts.current_owner_wallet` (exists)
- `wallet_dividend_balances.wallet_address` (exists)

### 4.3 Marketplace Listings

**Query: Get active listings with filters**
```typescript
const listings = await db.query.masterNfts.findMany({
  where: and(
    eq(masterNfts.listingStatus, 'listed'),
    genre ? eq(masters.genre, genre) : undefined,
    blockchain ? eq(masterNfts.chainId, blockchain) : undefined,
  ),
  orderBy: desc(masterNfts.listedAt),
  limit: 20,
  offset: page * 20,
});
```

**Indexes Required:**
- `master_nfts.listing_status` (exists)
- `master_nfts.listed_at` (add if not present)

---

## 5. Time-Series Considerations

For high-frequency time-series data (swap events, price history), consider:

### 5.1 PostgreSQL TimescaleDB Extension

```sql
-- If using TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable('pool_events', 'block_timestamp');
SELECT create_hypertable('nft_transfers', 'block_timestamp');
```

### 5.2 Retention Policies

```sql
-- Keep raw events for 90 days, then aggregate
SELECT add_retention_policy('pool_events', INTERVAL '90 days');
```

### 5.3 Continuous Aggregates

```sql
-- Hourly price candles
CREATE MATERIALIZED VIEW hourly_price_candles
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 hour', block_timestamp) AS bucket,
  artist_token_id,
  first(amount_usd, block_timestamp) AS open,
  max(amount_usd) AS high,
  min(amount_usd) AS low,
  last(amount_usd, block_timestamp) AS close,
  sum(amount_usd) AS volume
FROM pool_events
WHERE event_type = 'swap'
GROUP BY bucket, artist_token_id;
```

---

## 6. ETL/Indexer Jobs (Future)

For complex analytics, implement background ETL jobs:

### 6.1 Daily Aggregation Job

```typescript
// Pseudo-code for daily aggregation
async function runDailyAggregation() {
  // 1. Refresh materialized views
  await db.execute(sql`REFRESH MATERIALIZED VIEW mv_artist_performance`);
  await db.execute(sql`REFRESH MATERIALIZED VIEW mv_master_ipo_metrics`);
  
  // 2. Update cached aggregates
  await updateArtistStatistics();
  await updateMarketCapitalization();
  
  // 3. Archive old data
  await archiveOldEngagementEvents();
}
```

### 6.2 Real-time Event Processing

```typescript
// Using a message queue for real-time updates
async function processBlockchainEvent(event: BlockchainEvent) {
  switch (event.type) {
    case 'Transfer':
      await updateNftOwnership(event);
      await updateHolderCounts(event);
      break;
    case 'Swap':
      await updateTokenPrice(event);
      await updateTradingVolume(event);
      break;
    case 'DividendClaimed':
      await updateDividendBalances(event);
      break;
  }
}
```

---

## 7. External Analytics Integration

For advanced analytics, export data to external warehouses:

### 7.1 Data Export Options

- **BigQuery**: For large-scale analytics and ML
- **Snowflake**: For business intelligence
- **Amplitude/Mixpanel**: For user behavior analytics

### 7.2 Export Strategy

1. Daily batch export of dimension tables
2. Streaming export of event tables
3. Incremental updates using `updated_at` watermarks

---

## 8. Monitoring Dashboard Queries

The following queries should be monitored for performance:

| Query | Target | Alert Threshold |
|-------|--------|-----------------|
| Artist dashboard load | < 100ms | > 500ms |
| Marketplace listing | < 200ms | > 1s |
| Portfolio valuation | < 300ms | > 1.5s |
| V Studio live metrics | < 50ms | > 200ms |

Use `EXPLAIN ANALYZE` regularly to validate query plans and index usage.
