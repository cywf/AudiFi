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
  DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  MINTED: { label: 'Minted', className: 'bg-secondary/20 text-secondary' },
  LISTED: { label: 'Listed', className: 'bg-accent/20 text-accent' },
  SOLD: { label: 'Sold', className: 'bg-warning/20 text-warning' },
}

export function TrackCard({ track }: TrackCardProps) {
  const statusInfo = statusConfig[track.status]

  return (
    <Card className="overflow-hidden hover:border-accent/50 transition-colors group">
      <CardContent className="p-0">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {track.coverImageUrl ? (
            <img
              src={track.coverImageUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MusicNote size={64} className="text-muted-foreground opacity-30" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={cn('font-semibold', statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 truncate">{track.title}</h3>
            <p className="text-sm text-muted-foreground">
              {track.genre}
              {track.bpm && ` • ${track.bpm} BPM`}
            </p>
          </div>

          {track.currentPrice && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-accent">
                {track.currentPrice}
              </span>
              <span className="text-sm text-muted-foreground">{track.currency}</span>
            </div>
          )}

          {track.moodTags && track.moodTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {track.moodTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Link to={`/tracks/${track.id}`}>
            <Button className="w-full gap-2" variant="secondary">
              <Eye size={18} />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
