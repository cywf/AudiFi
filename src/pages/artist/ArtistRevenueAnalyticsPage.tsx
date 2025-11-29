import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartLine, CurrencyEth, TrendUp, Users } from '@phosphor-icons/react'
import { getArtistRevenueStats } from '@/api/dividends'
import { getMasterIPOsForArtist } from '@/api/masterIPO'
import type { MasterIPO } from '@/types'

export function ArtistRevenueAnalyticsPage() {
  const [masterIPOs, setMasterIPOs] = useState<MasterIPO[]>([])
  const [revenueStats, setRevenueStats] = useState<{
    totalRevenue: number
    dividendsPaid: number
    pendingDividends: number
    currency: string
    byMaster: { masterId: string; masterTitle: string; revenue: number; dividendsPaid: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [iposData, statsData] = await Promise.all([
          getMasterIPOsForArtist('user_001'),
          getArtistRevenueStats('user_001'),
        ])
        setMasterIPOs(iposData)
        setRevenueStats(statsData)
      } catch (error) {
        console.error('Failed to load revenue data:', error)
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

  const totalNFTHolders = masterIPOs.reduce((sum, m) => sum + m.nftsSold, 0)

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Track your earnings and dividend distributions to NFT holders
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CurrencyEth size={28} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {revenueStats?.totalRevenue.toFixed(2) || '0.00'} ETH
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <TrendUp size={28} className="text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {revenueStats?.dividendsPaid.toFixed(2) || '0.00'} ETH
                  </p>
                  <p className="text-sm text-muted-foreground">Dividends Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <ChartLine size={28} className="text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {revenueStats?.pendingDividends.toFixed(2) || '0.00'} ETH
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Dividends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users size={28} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalNFTHolders.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total NFT Holders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Master */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Revenue by Master</CardTitle>
            <CardDescription>
              Breakdown of revenue and dividends for each Master IPO
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueStats?.byMaster && revenueStats.byMaster.length > 0 ? (
              <div className="space-y-4">
                {revenueStats.byMaster.map((item) => {
                  const master = masterIPOs.find((m) => m.id === item.masterId)
                  return (
                    <div
                      key={item.masterId}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {master?.coverImageUrl && (
                          <img
                            src={master.coverImageUrl}
                            alt={item.masterTitle}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.masterTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {master?.nftsSold.toLocaleString() || 0} NFT holders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-accent">{item.revenue.toFixed(2)} ETH</p>
                        <p className="text-sm text-muted-foreground">
                          {item.dividendsPaid.toFixed(2)} ETH paid to holders
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ChartLine size={48} className="mx-auto mb-4 opacity-50" />
                <p>No revenue data yet. Start selling NFTs to see analytics.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon: Chart */}
        <Card className="border-border/60 border-dashed">
          <CardContent className="p-12 text-center">
            <ChartLine size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Revenue Charts Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Detailed charts and analytics will be available once the backend APIs are connected.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
