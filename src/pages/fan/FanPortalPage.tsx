import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  MusicNote,
  VideoCamera,
  Coins,
  MagnifyingGlass,
  ArrowRight,
  Play,
  TrendUp,
  Calendar,
} from '@phosphor-icons/react'
import { getActiveMasterIPOs } from '@/api/masterIPO'
import { getUpcomingSessions, getLiveSessions } from '@/api/vstudio'
import type { MasterIPO, VStudioSession } from '@/types'

export function FanPortalPage() {
  const [masterIPOs, setMasterIPOs] = useState<MasterIPO[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<VStudioSession[]>([])
  const [liveSessions, setLiveSessions] = useState<VStudioSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [ipos, upcoming, live] = await Promise.all([
          getActiveMasterIPOs(),
          getUpcomingSessions(),
          getLiveSessions(),
        ])
        setMasterIPOs(ipos)
        setUpcomingSessions(upcoming)
        setLiveSessions(live)
      } catch (error) {
        console.error('Failed to load data:', error)
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
      <div className="space-y-8 md:space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Discover & Invest in Music
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse Master IPOs, watch live V Studio sessions, and build your portfolio of music NFTs
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto mt-6">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search artists, masters, sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Live Sessions */}
        {liveSessions.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-xl font-bold">Live Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveSessions.map((session) => (
                <Link key={session.id} to={`/vstudio/session/${session.id}`}>
                  <Card className="border-red-500/30 hover:border-red-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <Play size={28} weight="fill" className="text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge className="bg-red-500/20 text-red-400 mb-2">LIVE</Badge>
                          <h3 className="font-semibold truncate">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">{session.artistName}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Master IPOs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MusicNote size={24} className="text-accent" />
              Featured Master IPOs
            </h2>
            <Link to="/marketplace/masters">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          
          {masterIPOs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <MusicNote size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No active Master IPOs at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masterIPOs.slice(0, 6).map((ipo) => (
                <Link key={ipo.id} to={`/master-ipo/${ipo.id}`}>
                  <Card className="border-border/60 hover:border-accent/40 transition-colors overflow-hidden">
                    {ipo.coverImageUrl && (
                      <div className="aspect-video relative">
                        <img
                          src={ipo.coverImageUrl}
                          alt={ipo.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-accent/20 backdrop-blur-sm">
                            <TrendUp size={12} className="mr-1" />
                            {ipo.nftHolderRevenueSharePercent}% Revenue
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{ipo.title}</h3>
                      <p className="text-sm text-muted-foreground">{ipo.artistName}</p>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="text-accent font-semibold">
                          {ipo.pricePerNFT} {ipo.currency}
                        </span>
                        <span className="text-muted-foreground">
                          {ipo.totalNFTSupply - ipo.nftsSold} left
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Sessions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <VideoCamera size={24} className="text-secondary" />
              Upcoming V Studio Sessions
            </h2>
          </div>
          
          {upcomingSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <VideoCamera size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No upcoming sessions scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.slice(0, 4).map((session) => (
                <Card key={session.id} className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <VideoCamera size={28} className="text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">{session.artistName}</p>
                        {session.scheduledStartTime && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar size={14} />
                            {new Date(session.scheduledStartTime).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">{session.gating.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/portfolio">
            <Card className="border-border/60 hover:border-accent/40 transition-colors h-full">
              <CardContent className="p-6 text-center">
                <Coins size={32} className="mx-auto text-accent mb-3" />
                <h3 className="font-semibold">My Portfolio</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  View your NFT holdings and Artist Coins
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dividends">
            <Card className="border-border/60 hover:border-accent/40 transition-colors h-full">
              <CardContent className="p-6 text-center">
                <TrendUp size={32} className="mx-auto text-secondary mb-3" />
                <h3 className="font-semibold">My Dividends</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Claim and track your dividend payouts
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/marketplace/masters">
            <Card className="border-border/60 hover:border-accent/40 transition-colors h-full">
              <CardContent className="p-6 text-center">
                <MusicNote size={32} className="mx-auto text-primary mb-3" />
                <h3 className="font-semibold">Browse All</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore all available Master IPOs
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>
      </div>
    </MainLayout>
  )
}
