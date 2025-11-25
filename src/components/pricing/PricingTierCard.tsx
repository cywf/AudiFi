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
      'relative flex flex-col border-border/60 transition-all duration-300',
      featured && 'border-accent/60 shadow-xl shadow-accent/10 scale-[1.02] ring-2 ring-accent/20'
    )}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-accent to-secondary text-accent-foreground font-semibold px-5 py-1.5 shadow-lg">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-6">
        <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
        <div className="mt-5">
          <span className="text-4xl md:text-5xl font-bold">${plan.pricePerMonthUSD}</span>
          {plan.pricePerMonthUSD > 0 && (
            <span className="text-muted-foreground ml-2 text-sm">/month</span>
          )}
        </div>
        <CardDescription className="mt-3 text-sm">
          {plan.maxTracks === null
            ? 'Unlimited tracks'
            : `Up to ${plan.maxTracks} track${plan.maxTracks === 1 ? '' : 's'}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-1 px-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 py-2.5">
            <CheckCircle size={18} weight="fill" className="text-accent mt-0.5 shrink-0" />
            <span className="text-sm text-foreground/90 leading-relaxed">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter className="pt-6 px-6 pb-6">
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan}
          variant={featured ? 'default' : 'secondary'}
          size="lg"
          className="w-full font-semibold"
        >
          {isCurrentPlan ? 'Current Plan' : plan.pricePerMonthUSD === 0 ? 'Get Started' : 'Upgrade'}
        </Button>
      </CardFooter>
    </Card>
  )
}
