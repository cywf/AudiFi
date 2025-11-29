import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Coins,
  MusicNote,
  TrendUp,
  Trophy,
  ArrowUp,
  ArrowDown,
  History,
} from '@phosphor-icons/react'
import { useNFTHoldings, useArtistCoinHoldings } from '@/hooks/useGating'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function FanPortfolioPage() {
  const { holdings: nftHoldings, loading: nftLoading, totalValue: nftTotalValue } = useNFTHoldings()
  const {
    holdings: coinHoldings,
    loading: coinLoading,
    totalValue: coinTotalValue,
  } = useArtistCoinHoldings()

  const loading = nftLoading || coinLoading
  const totalPortfolioValue = nftTotalValue + coinTotalValue

  const getMoverAdvantageLabel = (position?: number) => {
    if (!position) return null
    switch (position) {
      case 1:
        return { label: '1st Minter', color: 'bg-accent/20 text-accent-foreground' }
      case 2:
        return { label: '2nd Minter', color: 'bg-secondary/20 text-secondary-foreground' }
      case 3:
        return { label: '3rd Minter', color: 'bg-primary/20 text-primary-foreground' }
      default:
        return { label: '4th+ Minter', color: 'bg-muted' }
    }
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Track your NFT holdings, Artist Coins, and overall portfolio value
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/60 md:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendUp size={28} className="text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPortfolioValue.toFixed(4)} ETH</p>
                  <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MusicNote size={28} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{nftTotalValue.toFixed(4)} ETH</p>
                  <p className="text-sm text-muted-foreground">NFT Holdings Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Coins size={28} className="text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coinTotalValue.toFixed(4)} ETH</p>
                  <p className="text-sm text-muted-foreground">Artist Coin Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Tabs */}
        <Tabs defaultValue="nfts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="nfts" className="gap-2 py-3">
              <MusicNote size={18} />
              NFT Holdings
            </TabsTrigger>
            <TabsTrigger value="coins" className="gap-2 py-3">
              <Coins size={18} />
              Artist Coins
            </TabsTrigger>
          </TabsList>

          {/* NFT Holdings Tab */}
          <TabsContent value="nfts">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>NFT Holdings</CardTitle>
                <CardDescription>
                  Your Master IPO NFT shares and Mover Advantage positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : nftHoldings.length === 0 ? (
                  <div className="text-center py-12">
                    <MusicNote size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground mb-4">You don't own any NFTs yet</p>
                    <Link to="/marketplace/masters">
                      <Button>Browse Master IPOs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nftHoldings.map((holding) => {
                      const moverAdvantage = getMoverAdvantageLabel(holding.minterPosition)
                      const profitLoss = (holding.currentValue - holding.purchasePrice) * holding.quantity
                      const isProfit = profitLoss >= 0

                      return (
                        <div
                          key={holding.id}
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                        >
                          {holding.coverImageUrl && (
                            <img
                              src={holding.coverImageUrl}
                              alt={holding.masterTitle}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{holding.masterTitle}</h3>
                              {moverAdvantage && (
                                <Badge className={moverAdvantage.color}>
                                  <Trophy size={12} className="mr-1" />
                                  {moverAdvantage.label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{holding.artistName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {holding.quantity} NFT{holding.quantity !== 1 ? 's' : ''} • Purchased{' '}
                              {new Date(holding.purchasedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {(holding.currentValue * holding.quantity).toFixed(4)} {holding.currency}
                            </p>
                            <p
                              className={`text-sm flex items-center justify-end gap-1 ${
                                isProfit ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {isProfit ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                              {Math.abs(profitLoss).toFixed(4)} {holding.currency}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Artist Coins Tab */}
          <TabsContent value="coins">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Artist Coin Holdings</CardTitle>
                <CardDescription>
                  Your Artist Coin investments and current values
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : coinHoldings.length === 0 ? (
                  <div className="text-center py-12">
                    <Coins size={48} className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground mb-4">
                      You don't own any Artist Coins yet
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Artist Coins let you support artists and participate in their success.
                      Coming soon to the marketplace!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coinHoldings.map((holding) => (
                      <div
                        key={holding.artistCoinId}
                        className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-secondary">
                            ${holding.symbol}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{holding.artistName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {holding.amount.toLocaleString()} {holding.symbol}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Purchased {new Date(holding.purchasedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {holding.currentValue.toFixed(4)} {holding.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mover Advantage Explanation */}
        <Card className="border-border/60 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy size={20} className="text-accent" />
              Understanding Mover Advantage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Early buyers benefit from resale royalties based on their minting position:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-lg font-bold text-accent">10%</p>
                <p className="text-xs text-muted-foreground">1st Minter</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="text-lg font-bold text-secondary">5%</p>
                <p className="text-xs text-muted-foreground">2nd Minter</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-lg font-bold text-primary">3%</p>
                <p className="text-xs text-muted-foreground">3rd Minter</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-lg font-bold">1%</p>
                <p className="text-xs text-muted-foreground">4th+ Minters</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              When any NFT is resold, 81% goes to the seller and 19% is distributed among early minters.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
