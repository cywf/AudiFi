import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  MusicNote,
  CurrencyEth,
  TrendUp,
  ChartLine,
  Coins,
  VideoCamera,
  ArrowRight,
} from '@phosphor-icons/react'
import { getMasterIPOsForArtist } from '@/api/masterIPO'
import { getSessionsForArtist } from '@/api/vstudio'
import { getArtistRevenueStats } from '@/api/dividends'
import type { MasterIPO, VStudioSession } from '@/types'

export function ArtistDashboardPage() {
  const [masterIPOs, setMasterIPOs] = useState<MasterIPO[]>([])
  const [sessions, setSessions] = useState<VStudioSession[]>([])
  const [revenueStats, setRevenueStats] = useState<{
    totalRevenue: number
    dividendsPaid: number
    pendingDividends: number
    currency: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [iposData, sessionsData, statsData] = await Promise.all([
          getMasterIPOsForArtist('user_001'),
          getSessionsForArtist('user_001'),
          getArtistRevenueStats('user_001'),
        ])
        setMasterIPOs(iposData)
        setSessions(sessionsData)
        setRevenueStats(statsData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const activeMasters = masterIPOs.filter((m) => m.status === 'ACTIVE')
  const totalNFTsSold = masterIPOs.reduce((sum, m) => sum + m.nftsSold, 0)
  const totalRaised = masterIPOs.reduce((sum, m) => sum + m.totalRaised, 0)

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Artist Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Manage your Master IPOs, V Studio sessions, and track your revenue
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link to="/master-ipo/create" className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold">
                <Plus size={20} weight="bold" />
                Create Master IPO
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          <StatCard
            label="Active Master IPOs"
            value={activeMasters.length}
            icon={<MusicNote size={28} weight="duotone" />}
          />
          <StatCard
            label="Total NFTs Sold"
            value={totalNFTsSold.toLocaleString()}
            icon={<Coins size={28} weight="duotone" />}
          />
          <StatCard
            label="Total Raised"
            value={`${totalRaised.toFixed(2)} ETH`}
            icon={<CurrencyEth size={28} weight="duotone" />}
            variant="earnings"
            trend={{ value: '+24% this month', positive: true }}
          />
          <StatCard
            label="Dividends Paid"
            value={`${revenueStats?.dividendsPaid.toFixed(2) || '0.00'} ETH`}
            icon={<TrendUp size={28} weight="duotone" />}
            variant="earnings"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Master IPOs */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Your Master IPOs</CardTitle>
                <CardDescription>Manage your music releases</CardDescription>
              </div>
              <Link to="/artist/masters">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {masterIPOs.length === 0 ? (
                <div className="text-center py-8">
                  <MusicNote size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">No Master IPOs yet</p>
                  <Link to="/master-ipo/create">
                    <Button size="sm" className="gap-2">
                      <Plus size={16} />
                      Create Your First Master IPO
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {masterIPOs.slice(0, 3).map((master) => (
                    <Link
                      key={master.id}
                      to={`/master-ipo/${master.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      {master.coverImageUrl && (
                        <img
                          src={master.coverImageUrl}
                          alt={master.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{master.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {master.nftsSold.toLocaleString()} / {master.totalNFTSupply.toLocaleString()} NFTs sold
                        </p>
                      </div>
                      <Badge
                        variant={master.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={master.status === 'ACTIVE' ? 'bg-secondary/20 text-secondary-foreground' : ''}
                      >
                        {master.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* V Studio Sessions */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">V Studio Sessions</CardTitle>
                <CardDescription>Schedule and manage live sessions</CardDescription>
              </div>
              <Link to="/vstudio/setup">
                <Button variant="ghost" size="sm" className="gap-1">
                  New Session
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <VideoCamera size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">No V Studio sessions yet</p>
                  <Link to="/vstudio/setup">
                    <Button size="sm" className="gap-2">
                      <Plus size={16} />
                      Schedule Your First Session
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 3).map((session) => (
                    <Link
                      key={session.id}
                      to={session.status === 'LIVE' ? `/vstudio/session/${session.id}` : `/vstudio/setup`}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                        <VideoCamera size={24} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.scheduledStartTime
                            ? new Date(session.scheduledStartTime).toLocaleDateString()
                            : 'Not scheduled'}
                        </p>
                      </div>
                      <Badge
                        variant={session.status === 'LIVE' ? 'default' : 'secondary'}
                        className={
                          session.status === 'LIVE'
                            ? 'bg-red-500/20 text-red-400 animate-pulse'
                            : ''
                        }
                      >
                        {session.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Analytics Preview */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ChartLine size={24} className="text-accent" />
                Revenue Overview
              </CardTitle>
              <CardDescription>
                Track your earnings and dividend distributions
              </CardDescription>
            </div>
            <Link to="/artist/revenue">
              <Button variant="outline" size="sm" className="gap-1">
                View Details
                <ArrowRight size={16} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-accent">
                  {revenueStats?.totalRevenue.toFixed(2) || '0.00'} ETH
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-secondary">
                  {revenueStats?.dividendsPaid.toFixed(2) || '0.00'} ETH
                </p>
                <p className="text-sm text-muted-foreground">Dividends Paid to Holders</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-warning">
                  {revenueStats?.pendingDividends.toFixed(2) || '0.00'} ETH
                </p>
                <p className="text-sm text-muted-foreground">Pending Dividends</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
