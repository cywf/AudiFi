# Performance Issues by Location

This document maps specific code locations to performance issues for easy reference during implementation.

## Frontend API Layer

### src/api/masterIPO.ts

**Line 59-66: Inefficient localStorage parsing**
```typescript
function getStoredMasterIPOs(): MasterIPO[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)  // ❌ Parsed on every call
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMasterIPOs))
  return mockMasterIPOs
}
```
**Issue**: Called 9 times across the file, JSON.parse runs each time  
**Fix**: Add in-memory cache with TTL  
**Effort**: 30 minutes

---

**Line 72-78: Artificial delay - getMasterIPOsForArtist**
```typescript
return new Promise((resolve) => {
  setTimeout(() => {  // ❌ 400ms delay
    const masterIPOs = getStoredMasterIPOs()
    resolve(masterIPOs.filter((m) => m.artistId === artistId))
  }, 400)
})
```
**Issue**: Artificial 400ms delay  
**Fix**: Add environment flag to disable  
**Effort**: 5 minutes

---

**Line 81-88: Artificial delay - getMasterIPOById**
```typescript
return new Promise((resolve) => {
  setTimeout(() => {  // ❌ 300ms delay
    const masterIPOs = getStoredMasterIPOs()
    resolve(masterIPOs.find((m) => m.id === id) || null)
  }, 300)
})
```
**Issue**: Artificial 300ms delay  
**Fix**: Add environment flag to disable  
**Effort**: 5 minutes

---

**Line 90-97: Artificial delay - getActiveMasterIPOs**
```typescript
return new Promise((resolve) => {
  setTimeout(() => {  // ❌ 400ms delay
    const masterIPOs = getStoredMasterIPOs()
    resolve(masterIPOs.filter((m) => m.status === 'ACTIVE'))
  }, 400)
})
```
**Issue**: Artificial 400ms delay  
**Fix**: Add environment flag to disable  
**Effort**: 5 minutes

---

**Line 99-127: Artificial delay - createMasterIPO**
```typescript
return new Promise((resolve) => {
  setTimeout(() => {  // ❌ 500ms delay
    const masterIPOs = getStoredMasterIPOs()
    // ... create logic
    saveMasterIPOs(masterIPOs)
    resolve(newMasterIPO)
  }, 500)
})
```
**Issue**: Artificial 500ms delay  
**Fix**: Add environment flag to disable  
**Effort**: 5 minutes

---

### src/api/vstudio.ts

**Line 98-105: Inefficient localStorage parsing - sessions**
```typescript
function getStoredSessions(): VStudioSession[] {
  const stored = localStorage.getItem(SESSIONS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)  // ❌ Parsed on every call
  }
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(mockSessions))
  return mockSessions
}
```
**Issue**: Called 12 times, JSON.parse runs each time  
**Fix**: Add in-memory cache with TTL  
**Effort**: 30 minutes

---

**Line 111-118: Inefficient localStorage parsing - recaps**
```typescript
function getStoredRecaps(): SessionRecap[] {
  const stored = localStorage.getItem(RECAPS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)  // ❌ Parsed on every call
  }
  localStorage.setItem(RECAPS_STORAGE_KEY, JSON.stringify(mockRecaps))
  return mockRecaps
}
```
**Issue**: Called 5 times, JSON.parse runs each time  
**Fix**: Add in-memory cache with TTL  
**Effort**: 30 minutes

---

**Line 126-133: Artificial delay - getSessionsForArtist**
```typescript
return new Promise((resolve) => {
  setTimeout(() => {  // ❌ 400ms delay
    const sessions = getStoredSessions()
    resolve(sessions.filter((s) => s.artistId === artistId))
  }, 400)
})
```
**Issue**: Artificial 400ms delay  
**Fix**: Add environment flag to disable  
**Effort**: 5 minutes

---

**Line 273-307: Artificial delay + inefficient vote logic**
```typescript
export async function submitVote(
  sessionId: string,
  decisionPointId: string,
  optionId: string
): Promise<DecisionPoint> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {  // ❌ 200ms delay
      const sessions = getStoredSessions()
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId)  // ❌ O(n)
      // ... nested findIndex calls
      dp.options[optionIndex].votes += 1
      sessions[sessionIndex].decisionPoints[dpIndex] = dp
      saveSessions(sessions)
      resolve(dp)
    }, 200)
  })
}
```
**Issues**: 
1. Artificial 200ms delay
2. Multiple O(n) findIndex operations
**Fix**: Add environment flag + track winning option incrementally  
**Effort**: 45 minutes

---

**Line 309-344: O(n) vote counting**
```typescript
export async function endDecisionPoint(
  sessionId: string,
  decisionPointId: string
): Promise<DecisionPoint> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {  // ❌ 300ms delay
      // ... find logic
      const dp = session.decisionPoints[dpIndex]
      const winningOption = dp.options.reduce((a, b) => 
        (a.votes > b.votes ? a : b)  // ❌ O(n) scan
      )
      // ...
    }, 300)
  })
}
```
**Issues**:
1. Artificial 300ms delay
2. O(n) scan to find max votes
**Fix**: Track winning option during voting  
**Effort**: 30 minutes

---

### src/api/dividends.ts

**Line 68-75: Inefficient localStorage parsing - dividends**
```typescript
function getStoredDividends(): Dividend[] {
  const stored = localStorage.getItem(DIVIDENDS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)  // ❌ Parsed on every call
  }
  localStorage.setItem(DIVIDENDS_STORAGE_KEY, JSON.stringify(mockDividends))
  return mockDividends
}
```
**Issue**: Called 8 times, JSON.parse runs each time  
**Fix**: Add in-memory cache with TTL  
**Effort**: 30 minutes

---

**Line 123-148: Artificial delay - claimDividend**
```typescript
export async function claimDividend(dividendId: string): Promise<Dividend> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {  // ❌ 1500ms delay
      const dividends = getStoredDividends()
      const index = dividends.findIndex((d) => d.id === dividendId)  // ❌ O(n)
      // ... claim logic
    }, 1500)
  })
}
```
**Issues**:
1. Artificial 1500ms delay (very slow!)
2. O(n) findIndex
**Fix**: Add environment flag + use Map for O(1) lookup  
**Effort**: 30 minutes

---

**Line 150-166: Artificial delay - claimAllDividends**
```typescript
export async function claimAllDividends(): Promise<Dividend[]> {
  return new Promise((resolve) => {
    setTimeout(() => {  // ❌ 2000ms delay (slowest!)
      const dividends = getStoredDividends()
      const now = new Date().toISOString()
      const updated = dividends.map((d) =>  // ❌ O(n) scan
        d.status === 'CLAIMABLE'
          ? { ...d, status: 'CLAIMED' as const, claimedAt: now }
          : d
      )
      saveDividends(updated)
      resolve(updated.filter((d) => d.claimedAt === now))  // ❌ O(n) filter
    }, 2000)
  })
}
```
**Issues**:
1. Artificial 2000ms delay (slowest function!)
2. O(n) map + O(n) filter
**Fix**: Add environment flag + track claimable in separate collection  
**Effort**: 45 minutes

---

## React Components

### src/App.tsx

**Line 1-40: No code splitting**
```typescript
import { LandingPage } from '@/pages/LandingPage'
import { HowItWorksPage } from '@/pages/HowItWorksPage'
import { WhyAudiFiPage } from '@/pages/WhyAudiFiPage'
import { PricingPage } from '@/pages/PricingPage'
// ... 20+ more imports ❌
```
**Issue**: All pages bundled in main chunk, large initial load  
**Fix**: Use React.lazy() for route-based code splitting  
**Effort**: 2-3 hours  
**Impact**: 60-70% smaller initial bundle

---

### src/pages/MarketplacePage.tsx

**Line 21-35: No memoization + eager refetch**
```typescript
const loadTracks = async () => {
  setLoading(true)
  try {
    const data = await getMarketplaceListings(filters)  // ❌ Called on every filter change
    setTracks(data)
  } catch (error) {
    console.error('Failed to load marketplace tracks:', error)
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  loadTracks()  // ❌ No debouncing
}, [filters])
```
**Issues**:
1. No debouncing - API called on every keystroke
2. No memoization of sorted/filtered results
**Fix**: Add debouncing + useMemo for sorting  
**Effort**: 1 hour

---

**Line 104-111: No memoized child components**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {tracks.map((track) => (
    <MarketplaceTrackCard  // ❌ Re-renders on every parent render
      key={track.id}
      track={track}
      onPurchase={handlePurchaseClick}  // ❌ New function on every render
    />
  ))}
</div>
```
**Issues**:
1. Child components re-render unnecessarily
2. Event handler recreated on every render
**Fix**: Wrap MarketplaceTrackCard in React.memo, use useCallback  
**Effort**: 30 minutes

---

### src/hooks/useVStudioSession.ts

**Line 52-59: Polling instead of WebSocket**
```typescript
useEffect(() => {
  fetchSession()

  // TODO: Replace with WebSocket connection for real-time updates
  // Polling every 3 seconds as a placeholder
  const pollInterval = setInterval(fetchSession, 3000)  // ❌ Polling!
  return () => clearInterval(pollInterval)
}, [fetchSession])
```
**Issue**: Polls API every 3 seconds, unnecessary load  
**Fix**: Replace with WebSocket connection  
**Effort**: 8 hours (includes backend WebSocket server)  
**Impact**: 99% reduction in API calls, real-time updates

---

## Backend Services

### server/src/services/masterIPOService.ts

**Line 192-194: O(n) array filter**
```typescript
export async function getMastersByArtist(artistId: string): Promise<Master[]> {
  return Array.from(masters.values()).filter((m) => m.artistId === artistId);
  // ❌ O(n) - scans all masters
}
```
**Issue**: Linear scan of all masters  
**Fix**: Add secondary index Map<artistId, Set<masterId>>  
**Effort**: 2 hours  
**Impact**: 10-100x faster

---

**Line 371-373: O(n) array find**
```typescript
export async function getMasterIPOByMasterId(masterId: string): Promise<MasterIPO | null> {
  return Array.from(masterIPOs.values()).find((ipo) => ipo.masterId === masterId) || null;
  // ❌ O(n) - scans all IPOs
}
```
**Issue**: Linear scan of all IPOs  
**Fix**: Add secondary index Map<masterId, ipoId>  
**Effort**: 30 minutes  
**Impact**: 10-100x faster

---

**Line 569-585: Mover Advantage calculation in critical path**
```typescript
export async function mintNFT(
  ipoId: string,
  minterAddress: string,
  _quantity: number = 1
): Promise<{ tokenId: number; holder: MasterNFTHolder }> {
  // ... validation
  const newMintOrder = ipo.mintedCount + 1;
  
  // ❌ Recalculated on every mint
  let moverAdvantagePercent: number | undefined;
  let isMoverAdvantageEligible = false;
  
  if (newMintOrder === 1) {
    isMoverAdvantageEligible = true;
    moverAdvantagePercent = MOVER_ADVANTAGE_CONFIG.firstMinterPercent;
  } else if (newMintOrder === 2) {
    // ... more conditionals
  }
  // ...
}
```
**Issue**: Could be a lookup table  
**Fix**: Pre-compute Mover Advantage tiers  
**Effort**: 15 minutes  
**Impact**: Minor, but cleaner code

---

## Summary Statistics

| Category | Files | Issues | Total Effort |
|----------|-------|--------|--------------|
| localStorage Cache | 3 | 6 | 2 hours |
| Artificial Delays | 3 | 25+ | 2 hours |
| React Optimization | 10+ | 15+ | 10 hours |
| Backend Indexes | 1 | 3 | 3 hours |
| WebSocket Migration | 1 | 1 | 8 hours |
| **TOTAL** | **18+** | **50+** | **25 hours** |

## Implementation Order

1. **Quick wins** (2-4 hours): Disable delays, add caches
2. **React optimization** (10 hours): Memo, code splitting, debouncing
3. **Backend indexes** (3 hours): Secondary indexes
4. **WebSocket** (8 hours): Real-time updates (requires backend)

Total: ~25 hours of focused work spread over 2-3 weeks
