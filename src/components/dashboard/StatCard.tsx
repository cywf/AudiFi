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
  /** Use 'earnings' variant for sales/royalties to display in warm amber */
  variant?: 'default' | 'earnings'
  className?: string
}

export function StatCard({ label, value, icon, trend, variant = 'default', className }: StatCardProps) {
  const isEarnings = variant === 'earnings'
  
  return (
    <Card className={cn(
      'border-border/60 hover:border-accent/40 transition-all duration-200 shadow-sm hover:shadow-md', 
      isEarnings && 'hover:border-warning/40',
      className
    )}>
      <CardContent className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <div className="flex items-end gap-2">
              <p className={cn(
                'text-2xl sm:text-3xl font-bold tracking-tight truncate',
                isEarnings && 'text-warning'
              )}>
                {value}
              </p>
              {trend && (
                <p
                  className={cn(
                    'text-xs font-semibold mb-1',
                    trend.positive ? 'text-accent' : 'text-destructive'
                  )}
                >
                  {trend.value}
                </p>
              )}
            </div>
          </div>
          {icon && (
            <div className={cn(
              'shrink-0',
              isEarnings ? 'text-warning/40' : 'text-primary/30'
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
