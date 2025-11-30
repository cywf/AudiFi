import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StatCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}
