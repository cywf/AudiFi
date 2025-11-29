/**
 * Payments & Subscription API Routes
 * 
 * Endpoints:
 * - GET /payments/plans - List subscription plans
 * - GET /payments/plans/:id - Get plan details
 * - GET /payments/subscription - Get current user subscription
 * - POST /payments/subscription - Create subscription
 * - PATCH /payments/subscription - Update subscription (change plan)
 * - DELETE /payments/subscription - Cancel subscription
 * - POST /payments/subscription/reactivate - Reactivate canceled subscription
 * - GET /payments/history - Get payment history
 * - POST /payments/webhooks/stripe - Stripe webhook handler
 * - POST /payments/web3/session - Create Web3 payment session
 * - POST /payments/web3/verify - Verify Web3 payment
 */

import { Router, type Request } from 'express';
import { z } from 'zod';
import * as paymentService from '../services/paymentService.js';
import { authenticate, validateBody, type AuthenticatedRequest } from '../middleware/index.js';
import type { ApiResponse, SubscriptionPlanConfig, UserSubscription, PaymentEvent, SubscriptionPlan, PaymentEventType, PaymentStatus } from '../types/index.js';

const router = Router();

// =============================================================================
// SCHEMAS
// =============================================================================

const createSubscriptionSchema = z.object({
  planName: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
  paymentMethodId: z.string().optional(),
  billingPeriod: z.enum(['monthly', 'yearly']).optional(),
});

const updateSubscriptionSchema = z.object({
  planName: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
});

const cancelSubscriptionSchema = z.object({
  cancelImmediately: z.boolean().optional(),
});

const createWeb3SessionSchema = z.object({
  amount: z.string().min(1),
  currency: z.enum(['ETH', 'MATIC']),
  purpose: z.enum(['nft_mint', 'artist_coin_purchase', 'subscription']),
  metadata: z.record(z.unknown()).optional(),
});

const verifyWeb3PaymentSchema = z.object({
  sessionId: z.string().min(1),
  transactionHash: z.string().min(1),
});

// =============================================================================
// PLAN ENDPOINTS
// =============================================================================

router.get('/plans', async (_req, res) => {
  try {
    const plans = await paymentService.getPlans();
    
    const response: ApiResponse<SubscriptionPlanConfig[]> = {
      success: true,
      data: plans,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_PLANS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list plans',
      },
    });
  }
});

router.get('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await paymentService.getPlanById(id);
    
    if (!plan) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PLAN_NOT_FOUND',
          message: 'Plan not found',
        },
      });
      return;
    }
    
    const response: ApiResponse<SubscriptionPlanConfig> = {
      success: true,
      data: plan,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PLAN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get plan',
      },
    });
  }
});

// =============================================================================
// SUBSCRIPTION ENDPOINTS
// =============================================================================

router.get('/subscription', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const subscription = await paymentService.getUserSubscription(userId);
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_NOT_FOUND',
          message: 'No subscription found',
        },
      });
      return;
    }
    
    const response: ApiResponse<UserSubscription> = {
      success: true,
      data: subscription,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SUBSCRIPTION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get subscription',
      },
    });
  }
});

router.post(
  '/subscription',
  authenticate,
  validateBody(createSubscriptionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { planName, paymentMethodId, billingPeriod } = req.body as {
        planName: SubscriptionPlan;
        paymentMethodId?: string;
        billingPeriod?: 'monthly' | 'yearly';
      };
      
      const result = await paymentService.createSubscription({
        userId,
        planName,
        paymentMethodId,
        billingPeriod,
      });
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_SUBSCRIPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create subscription',
        },
      });
    }
  }
);

router.patch(
  '/subscription',
  authenticate,
  validateBody(updateSubscriptionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { planName } = req.body as { planName: SubscriptionPlan };
      
      const subscription = await paymentService.updateSubscription(userId, planName);
      
      if (!subscription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_NOT_FOUND',
            message: 'No subscription found',
          },
        });
        return;
      }
      
      const response: ApiResponse<UserSubscription> = {
        success: true,
        data: subscription,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_SUBSCRIPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update subscription',
        },
      });
    }
  }
);

router.delete(
  '/subscription',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const cancelImmediately = req.query.cancelImmediately === 'true';
      
      const subscription = await paymentService.cancelSubscription(userId, cancelImmediately);
      
      if (!subscription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_NOT_FOUND',
            message: 'No subscription found',
          },
        });
        return;
      }
      
      const response: ApiResponse<UserSubscription> = {
        success: true,
        data: subscription,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CANCEL_SUBSCRIPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cancel subscription',
        },
      });
    }
  }
);

router.post(
  '/subscription/reactivate',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      const subscription = await paymentService.reactivateSubscription(userId);
      
      if (!subscription) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_NOT_FOUND',
            message: 'No subscription found',
          },
        });
        return;
      }
      
      const response: ApiResponse<UserSubscription> = {
        success: true,
        data: subscription,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REACTIVATE_SUBSCRIPTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to reactivate subscription',
        },
      });
    }
  }
);

// =============================================================================
// PAYMENT HISTORY ENDPOINTS
// =============================================================================

router.get('/history', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const type = req.query.type as PaymentEventType | undefined;
    const status = req.query.status as PaymentStatus | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const payments = await paymentService.getPaymentHistory(userId, {
      type,
      status,
      limit,
      offset,
    });
    
    const response: ApiResponse<PaymentEvent[]> = {
      success: true,
      data: payments,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HISTORY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get payment history',
      },
    });
  }
});

// =============================================================================
// STRIPE WEBHOOK
// =============================================================================

router.post('/webhooks/stripe', async (req: Request, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Missing Stripe signature header',
        },
      });
      return;
    }
    
    const result = await paymentService.handleStripeWebhook(req.body, signature);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };
    
    res.json(response);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'WEBHOOK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process webhook',
      },
    });
  }
});

// =============================================================================
// WEB3 PAYMENT ENDPOINTS
// =============================================================================

router.post(
  '/web3/session',
  authenticate,
  validateBody(createWeb3SessionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { amount, currency, purpose, metadata } = req.body as {
        amount: string;
        currency: 'ETH' | 'MATIC';
        purpose: 'nft_mint' | 'artist_coin_purchase' | 'subscription';
        metadata?: Record<string, unknown>;
      };
      
      const session = await paymentService.createWeb3PaymentSession({
        userId,
        amount,
        currency,
        purpose,
        metadata,
      });
      
      const response: ApiResponse<typeof session> = {
        success: true,
        data: session,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create payment session',
        },
      });
    }
  }
);

router.post(
  '/web3/verify',
  authenticate,
  validateBody(verifyWeb3PaymentSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { sessionId, transactionHash } = req.body as {
        sessionId: string;
        transactionHash: string;
      };
      
      const result = await paymentService.verifyWeb3Payment(sessionId, transactionHash);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VERIFY_PAYMENT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to verify payment',
        },
      });
    }
  }
);

export default router;
