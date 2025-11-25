import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { PricingTierCard } from '@/components/pricing/PricingTierCard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getPlans, getCurrentUserPlan } from '@/api/subscription'
import { startSubscriptionCheckout } from '@/lib/payments'
import type { SubscriptionPlan } from '@/types'
import { toast } from 'sonner'

export function PricingPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [plansData, userPlan] = await Promise.all([
          getPlans(),
          getCurrentUserPlan(),
        ])
        setPlans(plansData)
        setCurrentPlan(userPlan)
      } catch (error) {
        console.error('Failed to load pricing data:', error)
        toast.error('Failed to load pricing information')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSelectPlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    if (plan.pricePerMonthUSD === 0) {
      navigate('/tracks/new')
      return
    }

    try {
      await startSubscriptionCheckout(planId)
      toast.success('Stripe checkout would open here', {
        description: 'This is a simulated payment flow. In production, you would be redirected to Stripe.',
      })
    } catch (error) {
      toast.error('Failed to start checkout')
    }
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade when you're ready to scale. No hidden fees.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <PricingTierCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan?.id === plan.id}
                onSelect={handleSelectPlan}
                featured={index === 1}
              />
            ))}
          </div>
        )}

        <div className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept credit cards via Stripe and cryptocurrency payments through MetaMask. All transactions are secure and encrypted."
            />
            <FAQItem
              question="Can I switch plans anytime?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
            />
            <FAQItem
              question="What happens to my tracks if I downgrade?"
              answer="Your existing minted tracks remain on the blockchain forever. You'll just be limited in creating new tracks based on your plan tier."
            />
            <FAQItem
              question="Do I really get royalties on every resale?"
              answer="Absolutely. Smart contracts automatically enforce royalty payments, so you receive your percentage on every secondary market transaction. Forever."
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">{question}</h3>
      <p className="text-muted-foreground">{answer}</p>
    </div>
  )
}
