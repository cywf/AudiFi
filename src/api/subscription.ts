import type { SubscriptionPlan } from '@/types'

const mockPlans: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    name: 'Free',
    pricePerMonthUSD: 0,
    maxTracks: 1,
    features: [
      'Create and deploy 1 NFT Track',
      'Basic analytics',
      'IPFS storage',
      'Perpetual royalties',
      'Community support',
    ],
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    pricePerMonthUSD: 15,
    maxTracks: null,
    features: [
      'Unlimited NFT Tracks',
      'Advanced analytics and insights',
      'Royalty tracking dashboard',
      'Priority support',
      'Early access to new features',
      'Custom smart contract options',
    ],
  },
]

export async function getPlans(): Promise<SubscriptionPlan[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPlans)
    }, 200)
  })
}

export async function getCurrentUserPlan(): Promise<SubscriptionPlan> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedUser = localStorage.getItem('currentUser')
      const user = storedUser ? JSON.parse(storedUser) : { subscriptionPlan: 'FREE' }
      const plan = mockPlans.find(p => p.id === `plan_${user.subscriptionPlan.toLowerCase()}`)
      resolve(plan || mockPlans[0])
    }, 200)
  })
}
