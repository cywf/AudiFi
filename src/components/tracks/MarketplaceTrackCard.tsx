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
