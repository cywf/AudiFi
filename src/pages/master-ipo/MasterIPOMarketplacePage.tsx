import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MusicNote,
  MagnifyingGlass,
  CurrencyEth,
  ArrowRight,
  TrendUp,
} from '@phosphor-icons/react'
import { getActiveMasterIPOs } from '@/api/masterIPO'
import type { MasterIPO } from '@/types'

export function MasterIPOMarketplacePage() {
  const [masterIPOs, setMasterIPOs] = useState<MasterIPO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getActiveMasterIPOs()
        setMasterIPOs(data)
      } catch (error) {
        console.error('Failed to load Master IPOs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredIPOs = masterIPOs
    .filter((ipo) =>
      ipo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ipo.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ipo.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.pricePerNFT - b.pricePerNFT
        case 'price-desc':
          return b.pricePerNFT - a.pricePerNFT
        case 'progress':
          return (b.nftsSold / b.totalNFTSupply) - (a.nftsSold / a.totalNFTSupply)
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MusicNote size={28} weight="duotone" className="text-accent" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Master IPO Marketplace</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Discover and invest in Master IPOs from independent artists
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, artist, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="progress">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredIPOs.length === 0 ? (
          <div className="text-center py-20">
            <MusicNote size={64} className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Master IPOs Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'No Master IPOs match your search. Try different keywords.'
                : 'There are no active Master IPOs at the moment. Check back soon!'}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{filteredIPOs.length}</strong> Master IPO{filteredIPOs.length !== 1 ? 's' : ''} available
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIPOs.map((ipo) => {
                const progress = (ipo.nftsSold / ipo.totalNFTSupply) * 100
                const remaining = ipo.totalNFTSupply - ipo.nftsSold

                return (
                  <Card key={ipo.id} className="border-border/60 overflow-hidden hover:border-accent/40 transition-colors group">
                    {/* Cover Image */}
                    {ipo.coverImageUrl && (
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={ipo.coverImageUrl}
                          alt={ipo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <Badge className="bg-accent/20 text-accent-foreground backdrop-blur-sm">
                            <TrendUp size={14} className="mr-1" />
                            {ipo.nftHolderRevenueSharePercent}% Revenue Share
                          </Badge>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-5">
                      {/* Title & Artist */}
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{ipo.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">by {ipo.artistName}</p>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {ipo.description}
                      </p>

                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {ipo.nftsSold.toLocaleString()} / {ipo.totalNFTSupply.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Price & Stats */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <CurrencyEth size={18} className="text-accent" />
                          <span className="font-bold text-lg">{ipo.pricePerNFT}</span>
                          <span className="text-sm text-muted-foreground">/{ipo.currency}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {remaining.toLocaleString()} left
                        </span>
                      </div>

                      {/* CTA */}
                      <Link to={`/master-ipo/${ipo.id}`}>
                        <Button className="w-full gap-2">
                          View Details
                          <ArrowRight size={16} />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
