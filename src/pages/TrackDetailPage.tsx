import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AudioPlayer } from '@/components/audio/AudioPlayer'
import { 
  MusicNote, 
  ArrowLeft, 
  ShoppingCart, 
  Eye,
  Copy,
  CheckCircle,
  Tag,
  ShoppingCartSimple,
  ChartLine,
  ArrowsClockwise,
  Info
} from '@phosphor-icons/react'
import { getTrackById, simulatePurchase } from '@/api/tracks'
import { truncateAddress } from '@/lib/wallet'
import type { Track, TrackStatus } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Mock activity events for the track
interface ActivityEvent {
  id: string
  type: 'MINTED' | 'LISTED' | 'PRICE_CHANGE' | 'SOLD' | 'TRANSFER'
  timestamp: string
  details: string
  fromWallet?: string
  toWallet?: string
  price?: number
  currency?: string
}

const getActivityIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'MINTED':
      return <MusicNote size={16} weight="fill" className="text-primary" />
    case 'LISTED':
      return <Tag size={16} weight="fill" className="text-accent" />
    case 'PRICE_CHANGE':
      return <ChartLine size={16} weight="fill" className="text-secondary" />
    case 'SOLD':
      return <ShoppingCartSimple size={16} weight="fill" className="text-warning" />
    case 'TRANSFER':
      return <ArrowsClockwise size={16} weight="fill" className="text-muted-foreground" />
    default:
      return <Info size={16} className="text-muted-foreground" />
  }
}

const statusConfig: Record<TrackStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-muted/80 text-muted-foreground' },
  MINTED: { label: 'Minted', className: 'bg-secondary/20 text-secondary-foreground' },
  LISTED: { label: 'Listed', className: 'bg-accent/20 text-accent-foreground' },
  SOLD: { label: 'Sold', className: 'bg-warning/20 text-warning-foreground' },
}

export function TrackDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)

  useEffect(() => {
    async function loadTrack() {
      if (!id) return
      try {
        const data = await getTrackById(id)
        setTrack(data)
      } catch (error) {
        console.error('Failed to load track:', error)
        toast.error('Failed to load track')
      } finally {
        setLoading(false)
      }
    }
    loadTrack()
  }, [id])

  const handlePurchase = async () => {
    if (!track) return
    setPurchasing(true)
    try {
      const buyerWallet = '0x9876543210fedcba9876543210fedcba98765432'
      const updatedTrack = await simulatePurchase(track.id, buyerWallet)
      setTrack(updatedTrack)
      setPurchaseComplete(true)
      toast.success('Purchase successful!', {
        description: 'You are now the owner of this NFT track.',
      })
    } catch (error) {
      toast.error('Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
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

  if (!track) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Track not found</h2>
          <Link to="/dashboard">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft size={18} />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const statusInfo = statusConfig[track.status]
  const isArtist = track.artistId === 'user_001'
  const artistName = isArtist ? 'You' : 'Demo Artist'

  // Generate mock activity events based on track status
  const generateMockActivity = (track: Track): ActivityEvent[] => {
    const events: ActivityEvent[] = []
    const baseDate = new Date(track.createdAt)
    
    // Minted event always present for non-draft tracks
    if (track.status !== 'DRAFT') {
      events.push({
        id: '1',
        type: 'MINTED',
        timestamp: baseDate.toISOString(),
        details: 'Track minted as NFT',
      })
    }
    
    // Listed event for listed/sold tracks
    if (track.status === 'LISTED' || track.status === 'SOLD') {
      const listDate = new Date(baseDate)
      listDate.setHours(listDate.getHours() + 2)
      events.push({
        id: '2',
        type: 'LISTED',
        timestamp: listDate.toISOString(),
        details: `Listed for ${track.currentPrice} ${track.currency}`,
        price: track.currentPrice,
        currency: track.currency,
      })
    }
    
    // Sold event
    if (track.status === 'SOLD') {
      const soldDate = new Date(baseDate)
      soldDate.setDate(soldDate.getDate() + 1)
      events.push({
        id: '3',
        type: 'SOLD',
        timestamp: soldDate.toISOString(),
        details: `Sold for ${track.currentPrice} ${track.currency}`,
        price: track.currentPrice,
        currency: track.currency,
        toWallet: track.ownerWalletAddress,
      })
    }
    
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const activityEvents = generateMockActivity(track)

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 sm:-ml-4">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden border-border/60">
              <CardContent className="p-0">
                <div className="aspect-square relative bg-muted">
                  {track.coverImageUrl ? (
                    <img
                      src={track.coverImageUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MusicNote size={96} weight="duotone" className="text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Audio Player */}
            <AudioPlayer title={track.title} />
          </div>

          <div className="space-y-5 md:space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 md:mb-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 break-words">{track.title}</h1>
                  <Link to="/profile" className="text-muted-foreground text-sm sm:text-base hover:text-accent transition-colors">
                    by {artistName}
                  </Link>
                  <span className="text-muted-foreground text-sm"> • {track.genre}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className={cn('font-medium', statusInfo.className)}>
                        {statusInfo.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Track status: {statusInfo.label}</p>
                    </TooltipContent>
                  </Tooltip>
                  {track.blockchain && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {track.blockchain}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This track is on the {track.blockchain === 'ethereum' ? 'Ethereum' : 'Solana'} network</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {track.description && (
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{track.description}</p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {track.bpm && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">BPM</p>
                  <p className="font-semibold text-sm sm:text-base">{track.bpm}</p>
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Royalty</p>
                    <p className="font-semibold text-sm sm:text-base">{track.royaltyPercent}%</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Artist receives {track.royaltyPercent}% on every secondary sale</p>
                </TooltipContent>
              </Tooltip>
              {track.releaseDate && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Release Date</p>
                  <p className="font-semibold text-sm sm:text-base">
                    {new Date(track.releaseDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {track.moodTags && track.moodTags.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Mood</p>
                <div className="flex flex-wrap gap-2">
                  {track.moodTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {track.ipfsHash && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">IPFS Hash</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted/50 px-3 py-2 rounded font-mono truncate">
                    {track.ipfsHash}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(track.ipfsHash!, 'IPFS hash')}
                    className="shrink-0 h-9 w-9"
                  >
                    <Copy size={18} />
                  </Button>
                </div>
              </div>
            )}

            {track.ownerWalletAddress && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Current Owner</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs sm:text-sm bg-muted/50 px-3 py-2 rounded font-mono truncate">
                    {truncateAddress(track.ownerWalletAddress)}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(track.ownerWalletAddress!, 'Wallet address')}
                    className="shrink-0 h-9 w-9"
                  >
                    <Copy size={18} />
                  </Button>
                </div>
              </div>
            )}

            {track.currentPrice && (
              <Card className="bg-accent/10 border-accent/30">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl sm:text-4xl font-bold text-accent">
                      {track.currentPrice}
                    </span>
                    <span className="text-lg sm:text-xl text-muted-foreground">
                      {track.currency}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Current price</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {isArtist ? (
                <>
                  <Button className="w-full" variant="secondary" size="lg" disabled>
                    <Eye size={18} className="mr-2" />
                    View on OpenSea
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Marketplace integration coming soon
                  </p>
                </>
              ) : track.status === 'LISTED' ? (
                <Button
                  className="w-full gap-2 font-semibold"
                  size="lg"
                  onClick={() => setShowPurchaseDialog(true)}
                >
                  <ShoppingCart size={20} />
                  Buy Now
                </Button>
              ) : track.status === 'SOLD' ? (
                <Button className="w-full" size="lg" disabled>
                  Sold Out
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Activity Section */}
        {activityEvents.length > 0 && (
          <Card className="border-border/60 mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                    <div className="mt-0.5 p-2 rounded-full bg-muted">
                      {getActivityIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{event.details}</p>
                      {event.toWallet && (
                        <p className="text-xs text-muted-foreground mt-1">
                          To: {truncateAddress(event.toWallet)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {event.price && (
                      <span className="text-sm font-semibold text-accent shrink-0">
                        {event.price} {event.currency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {purchaseComplete ? 'Purchase Complete!' : 'Confirm Purchase'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {purchaseComplete
                ? 'You are now the proud owner of this NFT track.'
                : `You are about to purchase "${track.title}" for ${track.currentPrice} ${track.currency}`}
            </DialogDescription>
          </DialogHeader>

          {purchaseComplete ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle size={40} weight="fill" className="text-accent" />
              </div>
              <p className="text-center text-muted-foreground text-sm leading-relaxed">
                The NFT has been transferred to your wallet and the artist will receive {track.royaltyPercent}% on all future resales.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-muted/40 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">{track.currentPrice} {track.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Artist Royalty</span>
                  <span className="font-semibold">{track.royaltyPercent}%</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                This is a simulated purchase. In production, this would trigger a real blockchain transaction.
              </p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {purchaseComplete ? (
              <Button onClick={() => setShowPurchaseDialog(false)} className="w-full">
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseDialog(false)}
                  disabled={purchasing}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button onClick={handlePurchase} disabled={purchasing} className="w-full sm:w-auto">
                  {purchasing ? 'Processing...' : 'Confirm Purchase'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
