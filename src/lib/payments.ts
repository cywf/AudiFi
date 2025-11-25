export async function startSubscriptionCheckout(planId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[STUB] Would redirect to Stripe checkout for plan: ${planId}`)
      resolve()
    }, 800)
  })
}

export async function openCustomerPortal(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[STUB] Would open Stripe Customer Portal')
      resolve()
    }, 500)
  })
}
