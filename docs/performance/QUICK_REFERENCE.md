# Performance Optimization Quick Reference

## 🚀 Quick Wins (30 min - 2 hours each)

### 1. Disable Artificial Delays
**File**: `.env.local` (create if not exists)
```bash
VITE_SIMULATE_API_LATENCY=false
VITE_API_LATENCY_MS=0
```
**Impact**: 2-6 seconds faster workflows

### 2. Add localStorage Cache
**Files**: `src/api/masterIPO.ts`, `src/api/vstudio.ts`, `src/api/dividends.ts`
**Pattern**:
```typescript
let cache: T[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5000;

function getStored(): T[] {
  if (cache && (Date.now() - cacheTime) < CACHE_TTL) return cache;
  const stored = localStorage.getItem(KEY);
  cache = stored ? JSON.parse(stored) : defaults;
  cacheTime = Date.now();
  return cache;
}
```
**Impact**: 80-90% faster API calls

### 3. Memoize Large Components
**Files**: Large components with lists
**Pattern**:
```typescript
import { memo } from 'react';

export const MyComponent = memo(function MyComponent({ data }) {
  // Component code
});
```
**Impact**: 60-80% fewer re-renders

---

## 📊 Performance Issues by File

### Frontend API (`src/api/`)

| File | Issue | Lines | Impact | Fix Time |
|------|-------|-------|--------|----------|
| `masterIPO.ts` | Repeated JSON.parse | 59-66 | High | 30 min |
| `masterIPO.ts` | 300-500ms delays | All functions | High | 10 min |
| `vstudio.ts` | Repeated JSON.parse | 98-118 | High | 30 min |
| `vstudio.ts` | 300-500ms delays | All functions | High | 10 min |
| `dividends.ts` | Repeated JSON.parse | 68-97 | High | 30 min |
| `dividends.ts` | 1500-2000ms delays | 146, 164 | High | 10 min |

### Hooks (`src/hooks/`)

| File | Issue | Lines | Impact | Fix Time |
|------|-------|-------|--------|----------|
| `useVStudioSession.ts` | 3s polling | 56-58 | Critical | 8 hours* |

*Requires backend WebSocket implementation

### Components (`src/components/`, `src/pages/`)

| File | Issue | Lines | Impact | Fix Time |
|------|-------|-------|--------|----------|
| `App.tsx` | No code splitting | 1-93 | High | 2 hours |
| `MarketplacePage.tsx` | No memoization | 33-35 | Medium | 1 hour |
| Large list components | No React.memo | Various | Medium | 3 hours |

### Backend Services (`server/src/services/`)

| File | Issue | Lines | Impact | Fix Time |
|------|-------|-------|--------|----------|
| `masterIPOService.ts` | O(n) array searches | 192-194 | Medium | 3 hours |
| `masterIPOService.ts` | No secondary indexes | Throughout | Medium | 2 hours |

---

## 🎯 Prioritized Action Items

### Week 1: Critical Fixes (6 hours)
- [ ] Add `.env.local` to disable delays (10 min)
- [ ] Implement localStorage caching in `masterIPO.ts` (45 min)
- [ ] Implement localStorage caching in `vstudio.ts` (45 min)
- [ ] Implement localStorage caching in `dividends.ts` (45 min)
- [ ] Add React.memo to 5 largest components (3 hours)
- [ ] Test and validate changes (45 min)

### Week 2: React Optimization (12 hours)
- [ ] Implement route-based code splitting (3 hours)
- [ ] Add useMemo for expensive computations (3 hours)
- [ ] Add useCallback for event handlers (2 hours)
- [ ] Add debouncing to filter inputs (2 hours)
- [ ] Test and validate changes (2 hours)

### Week 3-4: Architecture (20 hours)
- [ ] Design WebSocket protocol (4 hours)
- [ ] Implement WebSocket server (8 hours)
- [ ] Update useVStudioSession hook (2 hours)
- [ ] Add secondary indexes to services (4 hours)
- [ ] Test and validate changes (2 hours)

### Week 5: Polish (8 hours)
- [ ] Setup bundle analyzer (1 hour)
- [ ] Optimize bundle size (3 hours)
- [ ] Performance testing (2 hours)
- [ ] Document benchmarks (2 hours)

---

## 📈 Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Load | 4-6s | 1-2s | 60-75% |
| Time to Interactive | 5-8s | 2-3s | 50-62% |
| API Latency | 300-2000ms | 10-50ms | 90-98% |
| Re-renders | 10-20 | 2-4 | 80% |
| Bundle Size | 2-5MB | 0.8-1.5MB | 60-70% |

---

## 🔧 Code Templates

### localStorage Cache Pattern
```typescript
// Add at top of API file
let cachedData: T[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000;

function getStoredData(): T[] {
  const now = Date.now();
  if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedData;
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  cachedData = stored ? JSON.parse(stored) : mockData;
  cacheTimestamp = now;
  
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
  }
  
  return cachedData;
}

function invalidateCache(): void {
  cachedData = null;
  cacheTimestamp = 0;
}

function saveData(data: T[]): void {
  cachedData = data;
  cacheTimestamp = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

### Delay Helper Pattern
```typescript
// Add at top of API file
const SIMULATE_LATENCY = import.meta.env.VITE_SIMULATE_API_LATENCY === 'true';
const LATENCY_MS = parseInt(import.meta.env.VITE_API_LATENCY_MS || '0', 10);

function delay(ms: number): Promise<void> {
  if (!SIMULATE_LATENCY || LATENCY_MS === 0) {
    return Promise.resolve();
  }
  return new Promise(resolve => setTimeout(resolve, LATENCY_MS || ms));
}

// Use in API functions
export async function getData(id: string): Promise<Data> {
  await delay(300);
  // ... rest of function
}
```

### Code Splitting Pattern
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LandingPage = lazy(() => 
  import('@/pages/LandingPage').then(m => ({ default: m.LandingPage }))
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### React.memo Pattern
```typescript
import { memo, useMemo, useCallback } from 'react';

export const MyListComponent = memo(function MyListComponent({ items, onItemClick }) {
  // Memoize expensive computations
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  
  // Memoize callbacks
  const handleClick = useCallback((item) => {
    onItemClick(item);
  }, [onItemClick]);
  
  return (
    <div>
      {sortedItems.map(item => (
        <ItemCard key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
});

// Memoize child components too
const ItemCard = memo(function ItemCard({ item, onClick }) {
  return (
    <div onClick={() => onClick(item)}>
      {item.name}
    </div>
  );
});
```

### Secondary Index Pattern
```typescript
// server/src/services/masterIPOService.ts
const masters: Map<string, Master> = new Map();
const mastersByArtist: Map<string, Set<string>> = new Map();

export async function createMaster(data: CreateMasterData): Promise<Master> {
  const master = { id: `master_${uuidv4()}`, ...data };
  
  // Primary index
  masters.set(master.id, master);
  
  // Secondary index
  if (!mastersByArtist.has(master.artistId)) {
    mastersByArtist.set(master.artistId, new Set());
  }
  mastersByArtist.get(master.artistId)!.add(master.id);
  
  return master;
}

export async function getMastersByArtist(artistId: string): Promise<Master[]> {
  const masterIds = mastersByArtist.get(artistId) || new Set();
  return Array.from(masterIds).map(id => masters.get(id)!).filter(Boolean);
}
```

---

## 🧪 Testing Commands

```bash
# Build and check bundle size
npm run build
ls -lh dist/assets/*.js

# Run with bundle analyzer
npm install --save-dev rollup-plugin-visualizer
npm run build  # Opens visualization

# Profile React components
# Use React DevTools Profiler in browser

# Performance testing
# Use Chrome DevTools Performance tab
# Record key user flows
```

---

## 📚 Additional Resources

- Full analysis: `docs/performance/PERFORMANCE_ANALYSIS.md`
- React Performance: https://react.dev/learn/render-and-commit
- Vite Optimization: https://vitejs.dev/guide/features.html
- React Query: https://tanstack.com/query/latest
