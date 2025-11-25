import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { TrackCard } from '@/components/tracks/TrackCard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Plus, MusicNote, CurrencyEth, TrendUp } from '@phosphor-icons/react'
import { getTracksForCurrentUser } from '@/api/tracks'
import type { Track } from '@/types'

export function DashboardPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTracks() {
      try {
        const data = await getTracksForCurrentUser()
        setTracks(data)
      } catch (error) {
        console.error('Failed to load tracks:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTracks()
  }, [])

  const totalSales = tracks
    .filter(t => t.status === 'SOLD' && t.currentPrice)
    .reduce((sum, t) => sum + (t.currentPrice || 0), 0)

  const totalRoyalties = totalSales * 0.1

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your NFT tracks and track your earnings
            </p>
          </div>
          <Link to="/tracks/new" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold">
              <Plus size={20} weight="bold" />
              Create New Track
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            label="Total Tracks"
            value={tracks.length}
            icon={<MusicNote size={28} weight="duotone" />}
          />
          <StatCard
            label="Primary Sales"
            value={`${totalSales.toFixed(2)} ETH`}
            icon={<CurrencyEth size={28} weight="duotone" />}
            trend={{ value: '+12% this month', positive: true }}
          />
          <StatCard
            label="Total Royalties"
            value={`${totalRoyalties.toFixed(3)} ETH`}
            icon={<TrendUp size={28} weight="duotone" />}
            trend={{ value: '+8% this month', positive: true }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">Your Tracks</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <div className="mb-6 text-muted-foreground/50">
                <MusicNote size={64} weight="duotone" className="mx-auto" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">No tracks yet</h3>
              <p className="text-muted-foreground mb-6 md:mb-8 text-sm sm:text-base">
                Create your first NFT track to get started
              </p>
              <Link to="/tracks/new">
                <Button size="lg" className="gap-2 font-semibold">
                  <Plus size={20} weight="bold" />
                  Create Your First Track
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
