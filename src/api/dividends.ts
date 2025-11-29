import type { Dividend, DividendSummary, ArtistCoin, ArtistCoinHolding } from '@/types'

const DIVIDENDS_STORAGE_KEY = 'audifi.dividends'
const ARTIST_COINS_STORAGE_KEY = 'audifi.artistCoins'
const COIN_HOLDINGS_STORAGE_KEY = 'audifi.coinHoldings'

const mockDividends: Dividend[] = [
  {
    id: 'div_001',
    masterIPOId: 'master_ipo_001',
    masterTitle: 'Midnight Sessions',
    amount: 0.025,
    currency: 'ETH',
    status: 'CLAIMABLE',
    distributedAt: new Date('2024-12-01').toISOString(),
  },
  {
    id: 'div_002',
    masterIPOId: 'master_ipo_001',
    masterTitle: 'Midnight Sessions',
    amount: 0.018,
    currency: 'ETH',
    status: 'CLAIMED',
    distributedAt: new Date('2024-11-15').toISOString(),
    claimedAt: new Date('2024-11-16').toISOString(),
  },
  {
    id: 'div_003',
    masterIPOId: 'master_ipo_001',
    masterTitle: 'Midnight Sessions',
    amount: 0.032,
    currency: 'ETH',
    status: 'CLAIMED',
    distributedAt: new Date('2024-11-01').toISOString(),
    claimedAt: new Date('2024-11-02').toISOString(),
  },
]

const mockArtistCoins: ArtistCoin[] = [
  {
    id: 'coin_001',
    artistId: 'user_001',
    artistName: 'Alex Rivera',
    symbol: 'ALEX',
    totalSupply: 1000000,
    circulatingSupply: 250000,
    currentPrice: 0.0015,
    currency: 'ETH',
    liquidityPoolAddress: '0x1234...abcd',
    liquidityAmount: 50,
    createdAt: new Date('2024-09-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockCoinHoldings: ArtistCoinHolding[] = [
  {
    artistCoinId: 'coin_001',
    artistName: 'Alex Rivera',
    symbol: 'ALEX',
    amount: 5000,
    currentValue: 7.5,
    currency: 'ETH',
    purchasedAt: new Date('2024-10-15').toISOString(),
  },
]

function getStoredDividends(): Dividend[] {
  const stored = localStorage.getItem(DIVIDENDS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(DIVIDENDS_STORAGE_KEY, JSON.stringify(mockDividends))
  return mockDividends
}

function saveDividends(dividends: Dividend[]): void {
  localStorage.setItem(DIVIDENDS_STORAGE_KEY, JSON.stringify(dividends))
}

function getStoredArtistCoins(): ArtistCoin[] {
  const stored = localStorage.getItem(ARTIST_COINS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(ARTIST_COINS_STORAGE_KEY, JSON.stringify(mockArtistCoins))
  return mockArtistCoins
}

function getStoredCoinHoldings(): ArtistCoinHolding[] {
  const stored = localStorage.getItem(COIN_HOLDINGS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(COIN_HOLDINGS_STORAGE_KEY, JSON.stringify(mockCoinHoldings))
  return mockCoinHoldings
}

// Dividend operations

export async function getDividendsForUser(): Promise<DividendSummary> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dividends = getStoredDividends()
      const claimable = dividends
        .filter((d) => d.status === 'CLAIMABLE')
        .reduce((sum, d) => sum + d.amount, 0)
      const claimed = dividends
        .filter((d) => d.status === 'CLAIMED')
        .reduce((sum, d) => sum + d.amount, 0)

      resolve({
        totalClaimable: claimable,
        totalClaimed: claimed,
        totalHistorical: claimable + claimed,
        currency: 'ETH',
        dividends,
      })
    }, 400)
  })
}

export async function claimDividend(dividendId: string): Promise<Dividend> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const dividends = getStoredDividends()
      const index = dividends.findIndex((d) => d.id === dividendId)
      if (index === -1) {
        reject(new Error('Dividend not found'))
        return
      }

      if (dividends[index].status !== 'CLAIMABLE') {
        reject(new Error('Dividend is not claimable'))
        return
      }

      dividends[index] = {
        ...dividends[index],
        status: 'CLAIMED',
        claimedAt: new Date().toISOString(),
      }

      saveDividends(dividends)
      resolve(dividends[index])
    }, 1500)
  })
}

export async function claimAllDividends(): Promise<Dividend[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dividends = getStoredDividends()
      const now = new Date().toISOString()

      const updated = dividends.map((d) =>
        d.status === 'CLAIMABLE'
          ? { ...d, status: 'CLAIMED' as const, claimedAt: now }
          : d
      )

      saveDividends(updated)
      resolve(updated.filter((d) => d.claimedAt === now))
    }, 2000)
  })
}

// Artist Coin operations

export async function getArtistCoinByArtistId(artistId: string): Promise<ArtistCoin | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const coins = getStoredArtistCoins()
      resolve(coins.find((c) => c.artistId === artistId) || null)
    }, 300)
  })
}

export async function getAllArtistCoins(): Promise<ArtistCoin[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredArtistCoins())
    }, 300)
  })
}

export async function getCoinHoldingsForUser(): Promise<ArtistCoinHolding[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredCoinHoldings())
    }, 400)
  })
}

// For artists - revenue directed to dividend contracts
export async function getArtistRevenueStats(artistId: string): Promise<{
  totalRevenue: number
  dividendsPaid: number
  pendingDividends: number
  currency: string
  byMaster: { masterId: string; masterTitle: string; revenue: number; dividendsPaid: number }[]
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data - in production would fetch from contracts
      resolve({
        totalRevenue: 25.5,
        dividendsPaid: 12.3,
        pendingDividends: 1.8,
        currency: 'ETH',
        byMaster: [
          {
            masterId: 'master_ipo_001',
            masterTitle: 'Midnight Sessions',
            revenue: 25.5,
            dividendsPaid: 12.3,
          },
        ],
      })
    }, 400)
  })
}
