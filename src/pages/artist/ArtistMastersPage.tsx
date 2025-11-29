import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, MusicNote, ArrowRight, CurrencyEth } from '@phosphor-icons/react'
import { getMasterIPOsForArtist } from '@/api/masterIPO'
import type { MasterIPO } from '@/types'

export function ArtistMastersPage() {
  const [masterIPOs, setMasterIPOs] = useState<MasterIPO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMasterIPOsForArtist('user_001')
        setMasterIPOs(data)
      } catch (error) {
        console.error('Failed to load masters:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Master IPOs</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Manage your music releases and track NFT sales
            </p>
          </div>
          <Link to="/master-ipo/create">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold">
              <Plus size={20} weight="bold" />
              Create New Master IPO
            </Button>
          </Link>
        </div>

        {/* Masters Grid */}
        {masterIPOs.length === 0 ? (
          <div className="text-center py-20">
            <MusicNote size={64} className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Master IPOs Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first Master IPO to start selling NFT shares of your music and earning dividends.
            </p>
            <Link to="/master-ipo/create">
              <Button size="lg" className="gap-2">
                <Plus size={20} />
                Create Your First Master IPO
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {masterIPOs.map((master) => {
              const progress = (master.nftsSold / master.totalNFTSupply) * 100
              return (
                <Card key={master.id} className="border-border/60 overflow-hidden hover:border-accent/40 transition-colors">
                  {master.coverImageUrl && (
                    <div className="aspect-video relative">
                      <img
                        src={master.coverImageUrl}
                        alt={master.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className="absolute top-3 right-3"
                        variant={master.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {master.status}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-1">{master.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {master.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">NFTs Sold</span>
                        <span className="font-medium">
                          {master.nftsSold.toLocaleString()} / {master.totalNFTSupply.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <CurrencyEth size={16} className="text-accent" />
                        <span className="font-semibold">{master.totalRaised.toFixed(2)} ETH</span>
                        <span className="text-muted-foreground">raised</span>
                      </div>
                      <span className="text-muted-foreground">
                        {master.nftHolderRevenueSharePercent}% to holders
                      </span>
                    </div>

                    <Link to={`/master-ipo/${master.id}`}>
                      <Button variant="outline" className="w-full gap-2">
                        View Details
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
