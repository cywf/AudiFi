import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { MarketplaceTrackCard } from '@/components/tracks/MarketplaceTrackCard'
import { MarketplaceFiltersPanel } from '@/components/tracks/MarketplaceFilters'
import { PurchaseModal } from '@/components/tracks/PurchaseModal'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Storefront, Info } from '@phosphor-icons/react'
import { getMarketplaceListings, getAvailableGenres, type MarketplaceFilters } from '@/api/marketplace'
import type { Track } from '@/types'

export function MarketplacePage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<MarketplaceFilters>({ sortBy: 'newest' })
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)

  const genres = getAvailableGenres()

  const loadTracks = async () => {
    setLoading(true)
    try {
      const data = await getMarketplaceListings(filters)
      setTracks(data)
    } catch (error) {
      console.error('Failed to load marketplace tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTracks()
  }, [filters])

  const handlePurchaseClick = (track: Track) => {
    setSelectedTrack(track)
    setPurchaseModalOpen(true)
  }

  const handlePurchaseComplete = () => {
    loadTracks()
  }

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Storefront size={28} weight="duotone" className="text-accent" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">NFT Tracks Marketplace</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Discover and purchase unique music NFTs directly from independent artists
              </p>
            </div>
          </div>

          <Alert className="bg-accent/5 border-accent/20">
            <Info size={18} className="text-accent" />
            <AlertDescription className="text-sm">
              All purchases include <strong>{tracks[0]?.royaltyPercent || 10}% perpetual royalties</strong> to the original artist on every resale. 
              Artists retain full ownership rights and earn forever.
            </AlertDescription>
          </Alert>
        </div>

        <MarketplaceFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          genres={genres}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Storefront size={40} className="text-muted-foreground" weight="duotone" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-xl">No Tracks Found</h3>
              <p className="text-muted-foreground max-w-md">
                No tracks match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{tracks.length}</strong> {tracks.length === 1 ? 'track' : 'tracks'} available
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tracks.map((track) => (
                <MarketplaceTrackCard
                  key={track.id}
                  track={track}
                  onPurchase={handlePurchaseClick}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <PurchaseModal
        track={selectedTrack}
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </MainLayout>
  )
}
