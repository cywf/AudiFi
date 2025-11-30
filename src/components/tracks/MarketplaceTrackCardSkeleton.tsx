import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MarketplaceTrackCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-0">
        <div className="aspect-square relative">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute top-3 left-3">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="absolute top-3 right-3">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <div className="p-5 space-y-3 bg-card">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-7 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
