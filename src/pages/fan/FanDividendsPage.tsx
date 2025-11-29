import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TrendUp,
  CheckCircle,
  Clock,
  CurrencyEth,
  ArrowRight,
  Wallet,
  Info,
} from '@phosphor-icons/react'
import { getDividendsForUser, claimDividend, claimAllDividends } from '@/api/dividends'
import { getConnectedWallet, connectWallet } from '@/lib/wallet'
import type { DividendSummary, Dividend } from '@/types'
import { toast } from 'sonner'

export function FanDividendsPage() {
  const [dividendData, setDividendData] = useState<DividendSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimingAll, setClaimingAll] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)

  useEffect(() => {
    loadData()
    setWalletConnected(!!getConnectedWallet())
  }, [])

  async function loadData() {
    try {
      const data = await getDividendsForUser()
      setDividendData(data)
    } catch (error) {
      console.error('Failed to load dividends:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
      setWalletConnected(true)
      toast.success('Wallet connected')
    } catch (error) {
      toast.error('Failed to connect wallet')
    }
  }

  const handleClaimDividend = async (dividendId: string) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setClaiming(dividendId)
    try {
      await claimDividend(dividendId)
      await loadData()
      toast.success('Dividend claimed successfully!')
    } catch (error) {
      toast.error('Failed to claim dividend')
    } finally {
      setClaiming(null)
    }
  }

  const handleClaimAll = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setClaimingAll(true)
    try {
      const claimed = await claimAllDividends()
      await loadData()
      toast.success(`Claimed ${claimed.length} dividend(s)!`)
    } catch (error) {
      toast.error('Failed to claim dividends')
    } finally {
      setClaimingAll(false)
    }
  }

  const claimableDividends = dividendData?.dividends.filter((d) => d.status === 'CLAIMABLE') || []
  const claimedDividends = dividendData?.dividends.filter((d) => d.status === 'CLAIMED') || []

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Dividends</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Claim your revenue share from Master IPO holdings
          </p>
        </div>

        {/* Wallet Connection */}
        {!walletConnected && (
          <Alert className="bg-warning/10 border-warning/30">
            <Wallet size={18} className="text-warning" />
            <AlertDescription className="flex items-center justify-between">
              <span>Connect your wallet to claim dividends</span>
              <Button size="sm" onClick={handleConnectWallet}>
                Connect Wallet
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                      <CurrencyEth size={28} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dividendData?.totalClaimable.toFixed(4) || '0.0000'} {dividendData?.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">Claimable Now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <CheckCircle size={28} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dividendData?.totalClaimed.toFixed(4) || '0.0000'} {dividendData?.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Claimed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendUp size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dividendData?.totalHistorical.toFixed(4) || '0.0000'} {dividendData?.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">All-Time Earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Claimable Dividends */}
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={20} className="text-accent" />
                    Claimable Dividends
                  </CardTitle>
                  <CardDescription>Revenue share ready to claim</CardDescription>
                </div>
                {claimableDividends.length > 1 && (
                  <Button
                    onClick={handleClaimAll}
                    disabled={claimingAll || !walletConnected}
                    className="gap-2"
                  >
                    {claimingAll ? 'Claiming...' : 'Claim All'}
                    <ArrowRight size={16} />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {claimableDividends.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No dividends to claim right now</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dividends are distributed when your Master IPOs generate revenue
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {claimableDividends.map((dividend) => (
                      <div
                        key={dividend.id}
                        className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{dividend.masterTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Distributed {new Date(dividend.distributedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-accent">
                            {dividend.amount.toFixed(4)} {dividend.currency}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleClaimDividend(dividend.id)}
                            disabled={claiming === dividend.id || !walletConnected}
                          >
                            {claiming === dividend.id ? 'Claiming...' : 'Claim'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Claimed History */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-secondary" />
                  Claimed History
                </CardTitle>
                <CardDescription>Your past dividend claims</CardDescription>
              </CardHeader>
              <CardContent>
                {claimedDividends.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No claimed dividends yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {claimedDividends.map((dividend) => (
                      <div
                        key={dividend.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{dividend.masterTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Claimed {dividend.claimedAt && new Date(dividend.claimedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-medium">
                            {dividend.amount.toFixed(4)} {dividend.currency}
                          </p>
                          <Badge variant="secondary">
                            <CheckCircle size={12} className="mr-1" />
                            Claimed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info */}
            <Alert className="bg-muted/30">
              <Info size={18} className="text-muted-foreground" />
              <AlertDescription className="text-sm text-muted-foreground">
                Dividends are distributed based on your NFT holdings in each Master IPO. The more NFTs
                you hold, the larger your share of the revenue. Distributions typically occur monthly
                or when significant revenue is generated.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </MainLayout>
  )
}
