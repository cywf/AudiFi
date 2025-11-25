import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from '@phosphor-icons/react'
import type { SubscriptionPlan } from '@/types'
import { cn } from '@/lib/utils'

interface PricingTierCardProps {
  plan: SubscriptionPlan
  isCurrentPlan?: boolean
  onSelect: (planId: string) => void
  featured?: boolean
}

export function PricingTierCard({ plan, isCurrentPlan, onSelect, featured }: PricingTierCardProps) {
  return (
    <Card className={cn(
      'relative flex flex-col',
      featured && 'border-accent shadow-lg shadow-accent/20'
    )}>
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-accent text-accent-foreground font-semibold px-4">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">${plan.pricePerMonthUSD}</span>
          {plan.pricePerMonthUSD > 0 && (
            <span className="text-muted-foreground ml-2">/month</span>
          )}
        </div>
        <CardDescription className="mt-2">
          {plan.maxTracks === null
            ? 'Unlimited tracks'
            : `Up to ${plan.maxTracks} track${plan.maxTracks === 1 ? '' : 's'}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle size={20} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan}
          variant={featured ? 'default' : 'secondary'}
          className="w-full"
        >
          {isCurrentPlan ? 'Current Plan' : plan.pricePerMonthUSD === 0 ? 'Get Started' : 'Upgrade'}
        </Button>
      </CardFooter>
    </Card>
  )
}
