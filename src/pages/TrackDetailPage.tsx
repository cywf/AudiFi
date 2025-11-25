import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  MusicNote, 
  ArrowLeft, 
  ShoppingCart, 
  Eye,
  Copy,
  CheckCircle
} from '@phosphor-icons/react'
import { getTrackById, simulatePurchase } from '@/api/tracks'
import { truncateAddress } from '@/lib/wallet'
import type { Track, TrackStatus } from '@/types'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const statusConfig: Record<TrackStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  MINTED: { label: 'Minted', className: 'bg-secondary/20 text-secondary' },
  LISTED: { label: 'Listed', className: 'bg-accent/20 text-accent' },
  SOLD: { label: 'Sold', className: 'bg-warning/20 text-warning' },
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

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="gap-2 -ml-4">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
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
                      <MusicNote size={96} className="text-muted-foreground opacity-30" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-12 bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40 rounded flex items-center px-2 gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-accent/60 rounded-sm"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Waveform visualization
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{track.title}</h1>
                  <p className="text-muted-foreground">{track.genre}</p>
                </div>
                <Badge className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
              </div>

              {track.description && (
                <p className="text-muted-foreground">{track.description}</p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {track.bpm && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">BPM</p>
                  <p className="font-semibold">{track.bpm}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Royalty</p>
                <p className="font-semibold">{track.royaltyPercent}%</p>
              </div>
              {track.releaseDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Release Date</p>
                  <p className="font-semibold">
                    {new Date(track.releaseDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {track.moodTags && track.moodTags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mood</p>
                <div className="flex flex-wrap gap-2">
                  {track.moodTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {track.ipfsHash && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">IPFS Hash</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono truncate">
                    {track.ipfsHash}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(track.ipfsHash!, 'IPFS hash')}
                  >
                    <Copy size={18} />
                  </Button>
                </div>
              </div>
            )}

            {track.ownerWalletAddress && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Owner</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono">
                    {truncateAddress(track.ownerWalletAddress)}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(track.ownerWalletAddress!, 'Wallet address')}
                  >
                    <Copy size={18} />
                  </Button>
                </div>
              </div>
            )}

            {track.currentPrice && (
              <Card className="bg-accent/10 border-accent/30">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-accent">
                      {track.currentPrice}
                    </span>
                    <span className="text-xl text-muted-foreground">
                      {track.currency}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Current price</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {isArtist ? (
                <>
                  <Button className="w-full" variant="secondary" disabled>
                    <Eye size={18} className="mr-2" />
                    View on OpenSea
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Marketplace integration coming soon
                  </p>
                </>
              ) : track.status === 'LISTED' ? (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => setShowPurchaseDialog(true)}
                >
                  <ShoppingCart size={20} />
                  Buy Now
                </Button>
              ) : track.status === 'SOLD' ? (
                <Button className="w-full" disabled>
                  Sold Out
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {purchaseComplete ? 'Purchase Complete!' : 'Confirm Purchase'}
            </DialogTitle>
            <DialogDescription>
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
              <p className="text-center text-muted-foreground">
                The NFT has been transferred to your wallet and the artist will receive {track.royaltyPercent}% on all future resales.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">{track.currentPrice} {track.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Artist Royalty</span>
                  <span className="font-semibold">{track.royaltyPercent}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This is a simulated purchase. In production, this would trigger a real blockchain transaction.
              </p>
            </div>
          )}

          <DialogFooter>
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
                >
                  Cancel
                </Button>
                <Button onClick={handlePurchase} disabled={purchasing}>
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
