import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, MusicNote } from '@phosphor-icons/react'
import type { Track, TrackStatus } from '@/types'
import { cn } from '@/lib/utils'

interface TrackCardProps {
  track: Track
}

const statusConfig: Record<TrackStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-muted/80 text-muted-foreground' },
  MINTED: { label: 'Minted', className: 'bg-secondary/20 text-secondary-foreground' },
  LISTED: { label: 'Listed', className: 'bg-accent/20 text-accent-foreground' },
  SOLD: { label: 'Sold', className: 'bg-warning/20 text-warning-foreground' },
}

export function TrackCard({ track }: TrackCardProps) {
  const statusInfo = statusConfig[track.status]

  return (
    <Card className="overflow-hidden border-border/60 hover:border-accent/60 transition-all duration-200 group">
      <CardContent className="p-0">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {track.coverImageUrl ? (
            <img
              src={track.coverImageUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <MusicNote size={64} weight="duotone" className="text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={cn('font-medium shadow-lg', statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3 bg-card">
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
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {track.moodTags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{track.moodTags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <Link to={`/tracks/${track.id}`} className="block">
            <Button className="w-full gap-2 font-medium" variant="secondary" size="sm">
              <Eye size={18} />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
