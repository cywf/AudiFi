/**
 * Payments & Subscription Service
 * 
 * Handles:
 * - Stripe subscription management
 * - Subscription plan catalog
 * - Payment webhook processing
 * - Web3 payment hooks coordination
 * 
 * TODO: Integrate with:
 * - Actual Stripe API
 * - Web3 wallet payment flows
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  SubscriptionPlanConfig,
  UserSubscription,
  PaymentEvent,
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentEventType,
  PaymentStatus
} from '../types/index.js';

// =============================================================================
// SUBSCRIPTION PLAN CATALOG
// =============================================================================

export const SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: 'plan_free',
    name: 'FREE',
    pricePerMonthUsd: 0,
    pricePerYearUsd: 0,
    features: [
      'Create and deploy 1 Master IPO',
      'Basic analytics dashboard',
      'IPFS storage for media',
      '10% artist royalty on resales',
      'Community support',
    ],
    maxMasters: 1,
    maxVStudioSessions: 1,
    vStudioFeatures: [
      'Basic streaming',
      '1 decision point per session',
    ],
  },
  {
    id: 'plan_pro',
    name: 'PRO',
    pricePerMonthUsd: 29,
    pricePerYearUsd: 290, // 2 months free
    stripePriceIdMonthly: 'price_pro_monthly', // TODO: Replace with actual Stripe price ID
    stripePriceIdYearly: 'price_pro_yearly',
    features: [
      'Unlimited Master IPOs',
      'Advanced analytics and insights',
      'Priority IPFS pinning',
      'Custom royalty configurations',
      'Artist Coin creation',
      'Liquidity pool integration',
      'Priority support',
      'Early access to new features',
    ],
    maxMasters: null, // Unlimited
    maxVStudioSessions: null,
    vStudioFeatures: [
      'HD streaming',
      'Unlimited decision points',
      'Custom eligibility rules',
      'Direct IPO launch from session',
      'Session recording',
      'Viewer analytics',
    ],
  },
  {
    id: 'plan_enterprise',
    name: 'ENTERPRISE',
    pricePerMonthUsd: 199,
    pricePerYearUsd: 1990,
    stripePriceIdMonthly: 'price_enterprise_monthly',
    stripePriceIdYearly: 'price_enterprise_yearly',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom smart contract options',
      'White-label options',
      'API access',
      'Custom integrations',
      'SLA guarantees',
      'Legal review support',
    ],
    maxMasters: null,
    maxVStudioSessions: null,
    vStudioFeatures: [
      'Everything in Pro',
      '4K streaming',
      'Multi-host sessions',
      'Custom branding',
      'Private sessions',
    ],
  },
];

// =============================================================================
// IN-MEMORY STORE (Replace with database in production)
// =============================================================================

const userSubscriptions: Map<string, UserSubscription> = new Map();
const paymentEvents: Map<string, PaymentEvent[]> = new Map(); // userId -> events

// Initialize with sample data
function initializeSampleData(): void {
  const sampleSub: UserSubscription = {
    id: 'sub_sample_001',
    userId: 'user_dev_001',
    plan: 'PRO',
    status: 'active',
    stripeSubscriptionId: 'sub_stripe_sample',
    stripeCustomerId: 'cus_stripe_sample',
    currentPeriodStart: '2024-11-01T00:00:00Z',
    currentPeriodEnd: '2024-12-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };
  
  userSubscriptions.set(sampleSub.userId, sampleSub);
}

initializeSampleData();

// =============================================================================
// SUBSCRIPTION PLAN QUERIES
// =============================================================================

/**
 * Get all subscription plans
 */
export async function getPlans(): Promise<SubscriptionPlanConfig[]> {
  return SUBSCRIPTION_PLANS;
}

/**
 * Get a specific plan by ID
 */
export async function getPlanById(planId: string): Promise<SubscriptionPlanConfig | null> {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId) || null;
}

/**
 * Get a plan by name
 */
export async function getPlanByName(name: SubscriptionPlan): Promise<SubscriptionPlanConfig | null> {
  return SUBSCRIPTION_PLANS.find((p) => p.name === name) || null;
}

// =============================================================================
// USER SUBSCRIPTION MANAGEMENT
// =============================================================================

/**
 * Get a user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  return userSubscriptions.get(userId) || null;
}

/**
 * Create a subscription for a user
 * 
 * TODO: Integrate with actual Stripe API
 */
export async function createSubscription(data: {
  userId: string;
  planName: SubscriptionPlan;
  paymentMethodId?: string;
  billingPeriod?: 'monthly' | 'yearly';
}): Promise<{
  subscription: UserSubscription;
  clientSecret?: string;  // For Stripe payment confirmation
}> {
  // Check if user already has a subscription
  const existing = userSubscriptions.get(data.userId);
  if (existing && existing.status === 'active') {
    throw new Error('User already has an active subscription');
  }

  const plan = await getPlanByName(data.planName);
  if (!plan) {
    throw new Error('Plan not found');
  }

  // For free plan, just create the subscription directly
  if (plan.name === 'FREE') {
    const subscription: UserSubscription = {
      id: `sub_${uuidv4()}`,
      userId: data.userId,
      plan: 'FREE',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userSubscriptions.set(data.userId, subscription);
    
    return { subscription };
  }

  // TODO: Create Stripe subscription
  // 1. Create or get Stripe customer
  // 2. Create Stripe subscription
  // 3. Return client secret for payment confirmation

  const subscription: UserSubscription = {
    id: `sub_${uuidv4()}`,
    userId: data.userId,
    plan: data.planName,
    status: 'trialing', // Or 'active' if payment confirmed
    stripeSubscriptionId: `sub_stripe_${uuidv4().substring(0, 14)}`,
    stripeCustomerId: `cus_stripe_${uuidv4().substring(0, 14)}`,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(
      Date.now() + (data.billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
    cancelAtPeriodEnd: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  userSubscriptions.set(data.userId, subscription);

  // Mock client secret for Stripe
  const clientSecret = `pi_${uuidv4()}_secret_${uuidv4().substring(0, 10)}`;

  return { subscription, clientSecret };
}

/**
 * Update a subscription (change plan)
 * 
 * TODO: Integrate with Stripe API for plan changes
 */
export async function updateSubscription(
  userId: string,
  newPlanName: SubscriptionPlan
): Promise<UserSubscription | null> {
  const subscription = userSubscriptions.get(userId);
  
  if (!subscription) {
    return null;
  }

  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    throw new Error('Cannot update inactive subscription');
  }

  const newPlan = await getPlanByName(newPlanName);
  if (!newPlan) {
    throw new Error('Plan not found');
  }

  // TODO: Update Stripe subscription

  const updatedSubscription: UserSubscription = {
    ...subscription,
    plan: newPlanName,
    updatedAt: new Date().toISOString(),
  };

  userSubscriptions.set(userId, updatedSubscription);
  
  return updatedSubscription;
}

/**
 * Cancel a subscription
 * 
 * TODO: Integrate with Stripe API
 */
export async function cancelSubscription(
  userId: string,
  cancelImmediately: boolean = false
): Promise<UserSubscription | null> {
  const subscription = userSubscriptions.get(userId);
  
  if (!subscription) {
    return null;
  }

  // TODO: Cancel Stripe subscription

  const updatedSubscription: UserSubscription = {
    ...subscription,
    status: cancelImmediately ? 'canceled' : subscription.status,
    cancelAtPeriodEnd: !cancelImmediately,
    updatedAt: new Date().toISOString(),
  };

  userSubscriptions.set(userId, updatedSubscription);
  
  return updatedSubscription;
}

/**
 * Reactivate a canceled subscription
 * 
 * TODO: Integrate with Stripe API
 */
export async function reactivateSubscription(userId: string): Promise<UserSubscription | null> {
  const subscription = userSubscriptions.get(userId);
  
  if (!subscription) {
    return null;
  }

  if (!subscription.cancelAtPeriodEnd) {
    throw new Error('Subscription is not set to cancel');
  }

  // TODO: Reactivate Stripe subscription

  const updatedSubscription: UserSubscription = {
    ...subscription,
    cancelAtPeriodEnd: false,
    updatedAt: new Date().toISOString(),
  };

  userSubscriptions.set(userId, updatedSubscription);
  
  return updatedSubscription;
}

// =============================================================================
// STRIPE WEBHOOK HANDLING
// =============================================================================

/**
 * Handle Stripe webhook events
 * 
 * TODO: Implement actual webhook signature verification and event handling
 */
export async function handleStripeWebhook(
  payload: unknown,
  _signature: string
): Promise<{ received: boolean }> {
  // TODO: Verify webhook signature with Stripe
  // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  // Mock event handling
  const event = payload as { type: string; data: { object: Record<string, unknown> } };
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    
    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  return { received: true };
}

async function handleSubscriptionUpdate(
  stripeSubscription: Record<string, unknown>
): Promise<void> {
  // Find user by Stripe customer ID
  const customerId = stripeSubscription.customer as string;
  
  for (const [userId, sub] of userSubscriptions.entries()) {
    if (sub.stripeCustomerId === customerId) {
      const updatedSub: UserSubscription = {
        ...sub,
        status: mapStripeStatus(stripeSubscription.status as string),
        currentPeriodStart: new Date((stripeSubscription.current_period_start as number) * 1000).toISOString(),
        currentPeriodEnd: new Date((stripeSubscription.current_period_end as number) * 1000).toISOString(),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end as boolean,
        updatedAt: new Date().toISOString(),
      };
      
      userSubscriptions.set(userId, updatedSub);
      break;
    }
  }
}

async function handleSubscriptionDeleted(
  stripeSubscription: Record<string, unknown>
): Promise<void> {
  const customerId = stripeSubscription.customer as string;
  
  for (const [userId, sub] of userSubscriptions.entries()) {
    if (sub.stripeCustomerId === customerId) {
      const updatedSub: UserSubscription = {
        ...sub,
        status: 'canceled',
        updatedAt: new Date().toISOString(),
      };
      
      userSubscriptions.set(userId, updatedSub);
      break;
    }
  }
}

async function handleInvoicePaid(invoice: Record<string, unknown>): Promise<void> {
  const customerId = invoice.customer as string;
  
  // Find user and record payment event
  for (const [userId, sub] of userSubscriptions.entries()) {
    if (sub.stripeCustomerId === customerId) {
      const event: PaymentEvent = {
        id: `payment_${uuidv4()}`,
        userId,
        type: 'subscription',
        amount: (invoice.amount_paid as number) / 100, // Convert from cents
        currency: (invoice.currency as string).toUpperCase(),
        stripePaymentIntentId: invoice.payment_intent as string,
        status: 'succeeded',
        metadata: { invoiceId: invoice.id },
        createdAt: new Date().toISOString(),
      };
      
      const events = paymentEvents.get(userId) || [];
      events.push(event);
      paymentEvents.set(userId, events);
      
      // Update subscription status
      if (sub.status === 'past_due') {
        const updatedSub: UserSubscription = {
          ...sub,
          status: 'active',
          updatedAt: new Date().toISOString(),
        };
        userSubscriptions.set(userId, updatedSub);
      }
      break;
    }
  }
}

async function handlePaymentFailed(invoice: Record<string, unknown>): Promise<void> {
  const customerId = invoice.customer as string;
  
  for (const [userId, sub] of userSubscriptions.entries()) {
    if (sub.stripeCustomerId === customerId) {
      const updatedSub: UserSubscription = {
        ...sub,
        status: 'past_due',
        updatedAt: new Date().toISOString(),
      };
      
      userSubscriptions.set(userId, updatedSub);
      break;
    }
  }
}

function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    trialing: 'trialing',
  };
  
  return statusMap[stripeStatus] || 'active';
}

// =============================================================================
// PAYMENT EVENTS
// =============================================================================

/**
 * Record a payment event
 */
export async function recordPaymentEvent(data: {
  userId: string;
  type: PaymentEventType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  metadata?: Record<string, unknown>;
}): Promise<PaymentEvent> {
  const event: PaymentEvent = {
    id: `payment_${uuidv4()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };

  const events = paymentEvents.get(data.userId) || [];
  events.push(event);
  paymentEvents.set(data.userId, events);

  return event;
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(
  userId: string,
  options?: {
    type?: PaymentEventType;
    status?: PaymentStatus;
    limit?: number;
    offset?: number;
  }
): Promise<PaymentEvent[]> {
  let events = paymentEvents.get(userId) || [];

  if (options?.type) {
    events = events.filter((e) => e.type === options.type);
  }

  if (options?.status) {
    events = events.filter((e) => e.status === options.status);
  }

  // Sort by date descending
  events.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  
  return events.slice(offset, offset + limit);
}

// =============================================================================
// WEB3 PAYMENT COORDINATION
// =============================================================================

/**
 * Create a payment session for Web3 payment
 * This prepares a transaction for the user to sign with their wallet
 * 
 * TODO: Implement actual Web3 payment flow
 */
export async function createWeb3PaymentSession(data: {
  userId: string;
  amount: string;  // In wei
  currency: 'ETH' | 'MATIC';
  purpose: 'nft_mint' | 'artist_coin_purchase' | 'subscription';
  metadata?: Record<string, unknown>;
}): Promise<{
  sessionId: string;
  recipientAddress: string;
  amount: string;
  currency: string;
  expiresAt: string;
}> {
  // TODO: Generate actual payment session
  const sessionId = `web3_pay_${uuidv4()}`;
  
  // Mock recipient address (in production, this would be the platform's treasury)
  const recipientAddress = '0xAudiFiTreasury1234567890123456789012345678';
  
  return {
    sessionId,
    recipientAddress,
    amount: data.amount,
    currency: data.currency,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  };
}

/**
 * Verify a Web3 payment transaction
 * 
 * TODO: Implement actual transaction verification
 */
export async function verifyWeb3Payment(
  sessionId: string,
  transactionHash: string
): Promise<{
  verified: boolean;
  paymentEvent?: PaymentEvent;
}> {
  // TODO: Verify transaction on-chain
  // 1. Fetch transaction from blockchain
  // 2. Verify recipient, amount, and confirmation count
  // 3. Record payment event

  console.log(`[Payment] Verifying Web3 payment: ${sessionId}, tx: ${transactionHash}`);

  // Mock verification
  return {
    verified: true,
    paymentEvent: {
      id: `payment_${uuidv4()}`,
      userId: 'user_unknown',
      type: 'nft_mint',
      amount: 0.05,
      currency: 'ETH',
      status: 'succeeded',
      metadata: { sessionId, transactionHash },
      createdAt: new Date().toISOString(),
    },
  };
}
