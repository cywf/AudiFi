import { useState, useEffect, useCallback } from 'react'
import type { GatingStatus, SessionGating, NFTHolding, ArtistCoinHolding } from '@/types'
import { getConnectedWallet } from '@/lib/wallet'

/**
 * Hook for checking access gating status.
 * 
 * TODO: Connect to actual NFT/coin balance checking via smart contracts
 * when backend is ready. Currently uses mock data.
 */
export function useGatingStatus(gating: SessionGating | undefined): GatingStatus {
  const [status, setStatus] = useState<GatingStatus>({ hasAccess: true })
  
  useEffect(() => {
    if (!gating || gating.type === 'OPEN') {
      setStatus({ hasAccess: true })
      return
    }

    // Check if wallet is connected
    const walletAddress = getConnectedWallet()
    if (!walletAddress) {
      setStatus({
        hasAccess: false,
        requirement: gating,
        missingRequirements: ['Wallet not connected'],
        ctaType: 'CONNECT_WALLET',
      })
      return
    }

    // TODO: Check actual NFT/coin balances from smart contracts
    // For now, simulate access check with mock data
    const mockCheck = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const missingRequirements: string[] = []
      let ctaType: GatingStatus['ctaType'] = undefined

      if (gating.type === 'NFT' || gating.type === 'COMBINED') {
        // Mock: User doesn't have required NFTs in 50% of cases
        const hasNFT = Math.random() > 0.5
        if (!hasNFT && gating.requirements?.nftMasterIPOId) {
          missingRequirements.push(
            `Requires ${gating.requirements.nftMinAmount || 1} NFT(s) from Master IPO`
          )
          ctaType = 'BUY_NFT'
        }
      }

      if (gating.type === 'ARTIST_COIN' || gating.type === 'COMBINED') {
        // Mock: User doesn't have required coins in 50% of cases
        const hasCoins = Math.random() > 0.5
        if (!hasCoins && gating.requirements?.artistCoinId) {
          missingRequirements.push(
            `Requires ${gating.requirements.artistCoinMinAmount || 100} Artist Coins`
          )
          ctaType = ctaType || 'BUY_COIN'
        }
      }

      if (gating.type === 'SUBSCRIPTION') {
        // Mock: Check subscription tier
        const hasSubscription = true // Always pass for now
        if (!hasSubscription && gating.requirements?.subscriptionTier) {
          missingRequirements.push(
            `Requires ${gating.requirements.subscriptionTier} subscription`
          )
          ctaType = 'SUBSCRIBE'
        }
      }

      setStatus({
        hasAccess: missingRequirements.length === 0,
        requirement: gating,
        missingRequirements: missingRequirements.length > 0 ? missingRequirements : undefined,
        ctaType,
      })
    }

    mockCheck()
  }, [gating])

  return status
}

/**
 * Hook for fetching user's NFT holdings.
 * 
 * TODO: Connect to actual blockchain data when backend is ready.
 */
export function useNFTHoldings(): {
  holdings: NFTHolding[]
  loading: boolean
  error: string | null
  totalValue: number
} {
  const [holdings, setHoldings] = useState<NFTHolding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        setHoldings([
          {
            id: 'nft_holding_001',
            masterIPOId: 'master_ipo_001',
            masterTitle: 'Midnight Sessions',
            artistName: 'Alex Rivera',
            coverImageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400',
            quantity: 10,
            purchasePrice: 0.5,
            currentValue: 0.75,
            currency: 'ETH',
            minterPosition: 1, // First minter - gets 10% Mover Advantage
            purchasedAt: new Date('2024-11-15').toISOString(),
          },
          {
            id: 'nft_holding_002',
            masterIPOId: 'master_ipo_001',
            masterTitle: 'Midnight Sessions',
            artistName: 'Alex Rivera',
            coverImageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400',
            quantity: 5,
            purchasePrice: 0.6,
            currentValue: 0.75,
            currency: 'ETH',
            minterPosition: 4, // 4th+ minter - gets 1% Mover Advantage
            purchasedAt: new Date('2024-11-20').toISOString(),
          },
        ])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load NFT holdings')
      } finally {
        setLoading(false)
      }
    }

    fetchHoldings()
  }, [])

  const totalValue = holdings.reduce(
    (sum, h) => sum + h.quantity * h.currentValue,
    0
  )

  return { holdings, loading, error, totalValue }
}

/**
 * Hook for fetching user's Artist Coin holdings.
 * 
 * TODO: Connect to actual blockchain data when backend is ready.
 */
export function useArtistCoinHoldings(): {
  holdings: ArtistCoinHolding[]
  loading: boolean
  error: string | null
  totalValue: number
} {
  const [holdings, setHoldings] = useState<ArtistCoinHolding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        setHoldings([
          {
            artistCoinId: 'coin_001',
            artistName: 'Alex Rivera',
            symbol: 'ALEX',
            amount: 5000,
            currentValue: 7.5,
            currency: 'ETH',
            purchasedAt: new Date('2024-10-15').toISOString(),
          },
        ])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Artist Coin holdings')
      } finally {
        setLoading(false)
      }
    }

    fetchHoldings()
  }, [])

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)

  return { holdings, loading, error, totalValue }
}
