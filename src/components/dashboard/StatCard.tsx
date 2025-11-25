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
    <Card className={cn('bg-card/50 backdrop-blur-sm', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
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
            <div className="text-muted-foreground opacity-50">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
