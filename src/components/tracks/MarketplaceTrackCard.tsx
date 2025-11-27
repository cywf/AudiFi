import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, MusicNote } from '@phosphor-icons/react'
import type { Track } from '@/types'
import { cn } from '@/lib/utils'

interface MarketplaceTrackCardProps {
  track: Track
  onPurchase: (track: Track) => void
}

export function MarketplaceTrackCard({ track, onPurchase }: MarketplaceTrackCardProps) {
  const SolanaIcon = () => (
    <svg width="12" height="12" viewBox="0 0 397.7 311.7" fill="currentColor">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
    </svg>
  )

  return (
    <Card className={cn(
      'overflow-hidden border-border/60 transition-all duration-300 group',
      'hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1',
      'ring-1 ring-accent/20 shadow-md shadow-accent/5'
    )}>
      <CardContent className="p-0">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {track.coverImageUrl ? (
            <img
              src={track.coverImageUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <MusicNote size={64} weight="duotone" className="text-muted-foreground/30" />
            </div>
          )}
          {track.royaltyPercent && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-warning/90 text-warning-foreground font-medium shadow-lg text-xs backdrop-blur-sm">
                {track.royaltyPercent}% Royalty
              </Badge>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge 
              variant="secondary" 
              className={cn(
                "font-medium shadow-lg text-xs backdrop-blur-sm flex items-center gap-1",
                track.blockchain === 'solana' 
                  ? "bg-purple-500/90 text-white border-purple-400/50" 
                  : "bg-blue-500/90 text-white border-blue-400/50"
              )}
            >
              {track.blockchain === 'solana' ? (
                <>
                  <SolanaIcon />
                  Solana
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 784.37 1277.39" fill="currentColor">
                    <polygon points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54"/>
                    <polygon points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33"/>
                    <polygon points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89"/>
                    <polygon points="392.07,1277.38 392.07,956.52 -0,724.89"/>
                    <polygon points="392.07,882.29 784.13,650.54 392.07,472.33"/>
                    <polygon points="-0,650.54 392.07,882.29 392.07,472.33"/>
                  </svg>
                  Ethereum
                </>
              )}
            </Badge>
          </div>
        </div>

        <div className="p-5 space-y-3 bg-card">
          <div className="min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{track.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {track.genre}
              {track.bpm && ` • ${track.bpm} BPM`}
            </p>
          </div>

          {track.currentPrice && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-accent">
                {track.currentPrice}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">{track.currency}</span>
            </div>
          )}

          {track.moodTags && track.moodTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {track.moodTags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs rounded-full bg-muted/50 hover:bg-muted transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {track.moodTags.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs rounded-full bg-muted/50"
                >
                  +{track.moodTags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <Button 
            className="w-full gap-2 font-medium" 
            size="sm"
            onClick={() => onPurchase(track)}
          >
            <ShoppingCart size={18} />
            Purchase NFT
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
