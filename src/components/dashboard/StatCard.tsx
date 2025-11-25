import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('border-border/60 hover:border-accent/40 transition-colors', className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{value}</p>
            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-accent' : 'text-destructive'
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground/40 shrink-0">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
