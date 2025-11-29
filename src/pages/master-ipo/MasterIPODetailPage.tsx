import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  CurrencyEth,
  Users,
  ChartLine,
  TrendUp,
  Info,
  ShoppingCart,
} from '@phosphor-icons/react'
import { getMasterIPOById, simulatePurchaseNFT } from '@/api/masterIPO'
import { connectWallet, getConnectedWallet } from '@/lib/wallet'
import type { MasterIPO } from '@/types'
import { DEFAULT_MOVER_ADVANTAGE } from '@/types'
import { toast } from 'sonner'

export function MasterIPODetailPage() {
  const { id } = useParams<{ id: string }>()
  const [masterIPO, setMasterIPO] = useState<MasterIPO | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [walletConnected, setWalletConnected] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      try {
        const data = await getMasterIPOById(id)
        setMasterIPO(data)
        setWalletConnected(!!getConnectedWallet())
      } catch (error) {
        console.error('Failed to load Master IPO:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
      setWalletConnected(true)
      toast.success('Wallet connected')
    } catch (error) {
      toast.error('Failed to connect wallet')
    }
  }

  const handlePurchase = async () => {
    if (!masterIPO || !walletConnected) return

    setPurchasing(true)
    try {
      const wallet = getConnectedWallet()
      if (!wallet) throw new Error('Wallet not connected')

      const result = await simulatePurchaseNFT(masterIPO.id, quantity, wallet)
      
      // Refresh data
      const updated = await getMasterIPOById(masterIPO.id)
      setMasterIPO(updated)

      toast.success(`Successfully purchased ${quantity} NFT(s)!`, {
        description: `Transaction: ${result.transactionHash.slice(0, 20)}...`,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (!masterIPO) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Master IPO Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The Master IPO you're looking for doesn't exist.
          </p>
          <Link to="/marketplace/masters">
            <Button>Browse Master IPOs</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const progress = (masterIPO.nftsSold / masterIPO.totalNFTSupply) * 100
  const remaining = masterIPO.totalNFTSupply - masterIPO.nftsSold
  const totalCost = quantity * masterIPO.pricePerNFT

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <Link to="/marketplace/masters" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex gap-6">
              {masterIPO.coverImageUrl && (
                <img
                  src={masterIPO.coverImageUrl}
                  alt={masterIPO.title}
                  className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{masterIPO.title}</h1>
                    <p className="text-muted-foreground mt-1">by {masterIPO.artistName}</p>
                  </div>
                  <Badge
                    variant={masterIPO.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={masterIPO.status === 'ACTIVE' ? 'bg-secondary/20 text-secondary-foreground' : ''}
                  >
                    {masterIPO.status}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{masterIPO.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-border/60">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-accent">
                    {masterIPO.pricePerNFT} {masterIPO.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">Price per NFT</p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{remaining.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">NFTs Remaining</p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{masterIPO.nftHolderRevenueSharePercent}%</p>
                  <p className="text-xs text-muted-foreground">Revenue to Holders</p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{masterIPO.totalRaised.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{masterIPO.currency} Raised</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress */}
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">NFT Sale Progress</span>
                  <span className="text-muted-foreground">
                    {masterIPO.nftsSold.toLocaleString()} / {masterIPO.totalNFTSupply.toLocaleString()}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {progress.toFixed(1)}% sold
                </p>
              </CardContent>
            </Card>

            {/* Mover Advantage */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendUp size={24} className="text-accent" />
                  Mover Advantage
                </CardTitle>
                <CardDescription>
                  Early buyers earn more from secondary sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-accent">{DEFAULT_MOVER_ADVANTAGE.firstMinterPercent}%</p>
                    <p className="text-xs text-muted-foreground">1st Minter</p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <p className="text-2xl font-bold text-secondary">{DEFAULT_MOVER_ADVANTAGE.secondMinterPercent}%</p>
                    <p className="text-xs text-muted-foreground">2nd Minter</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{DEFAULT_MOVER_ADVANTAGE.thirdMinterPercent}%</p>
                    <p className="text-xs text-muted-foreground">3rd Minter</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{DEFAULT_MOVER_ADVANTAGE.fourthPlusMinterPercent}%</p>
                    <p className="text-xs text-muted-foreground">4th+ Minters</p>
                  </div>
                </div>
                <Alert className="mt-4 bg-accent/5 border-accent/20">
                  <Info size={16} className="text-accent" />
                  <AlertDescription className="text-xs">
                    When an NFT is resold, {DEFAULT_MOVER_ADVANTAGE.sellerPercent}% goes to the seller. The rest is split among
                    early minters based on their position.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Collaborators */}
            {masterIPO.collaborators.length > 0 && (
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={24} className="text-primary" />
                    Collaborators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {masterIPO.collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{collab.name}</p>
                          <p className="text-sm text-muted-foreground">{collab.role}</p>
                        </div>
                        <Badge variant="outline">{collab.revenueSharePercent}% revenue</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Purchase */}
          <div className="space-y-6">
            <Card className="border-border/60 sticky top-20">
              <CardHeader>
                <CardTitle>Purchase NFTs</CardTitle>
                <CardDescription>
                  Own a share of this master and earn dividends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {masterIPO.status !== 'ACTIVE' ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      This Master IPO is not currently active.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Quantity */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="flex-1 text-center text-xl font-bold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(remaining, quantity + 1))}
                          disabled={quantity >= remaining}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Max: {remaining.toLocaleString()} available
                      </p>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total</span>
                      <span className="text-2xl font-bold text-accent">
                        {totalCost.toFixed(4)} {masterIPO.currency}
                      </span>
                    </div>

                    {/* Actions */}
                    {!walletConnected ? (
                      <Button onClick={handleConnectWallet} className="w-full gap-2">
                        Connect Wallet
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePurchase}
                        disabled={purchasing || remaining === 0}
                        className="w-full gap-2"
                        size="lg"
                      >
                        {purchasing ? (
                          'Processing...'
                        ) : (
                          <>
                            <ShoppingCart size={20} />
                            Buy {quantity} NFT{quantity > 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    )}

                    <p className="text-xs text-center text-muted-foreground">
                      By purchasing, you agree to the terms of this Master IPO.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
