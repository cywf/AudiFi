/**
 * Dividend & Revenue API Routes
 * 
 * Endpoints:
 * - POST /dividends/revenue - Register a revenue event
 * - GET /dividends/revenue/:masterId - Get revenue events for a master
 * - GET /dividends/revenue/:masterId/summary - Get revenue summary
 * - POST /dividends/revenue/:eventId/process - Process a revenue event
 * - GET /dividends/claimable - Get claimable dividends for current user
 * - GET /dividends/claimable/:walletAddress - Get claimable dividends for wallet
 * - POST /dividends/claim - Claim dividends
 * - GET /dividends/history - Get claim history for current user
 * - GET /dividends/summary - Get dividend summary for current user
 * - GET /dividends/artist-summary - Get artist dividend summary
 * - GET /dividends/contract/:masterId - Get dividend contract details
 */

import { Router } from 'express';
import { z } from 'zod';
import * as dividendService from '../services/dividendService.js';
import { authenticate, validateBody, type AuthenticatedRequest } from '../middleware/index.js';
import type { ApiResponse, RevenueEvent, DividendClaim, DividendContract, RevenueSource, ClaimStatus } from '../types/index.js';

const router = Router();

// =============================================================================
// SCHEMAS
// =============================================================================

const registerRevenueSchema = z.object({
  masterId: z.string().min(1),
  amount: z.string().min(1),
  currency: z.string().min(1),
  source: z.enum(['streaming', 'sale', 'resale_royalty', 'license', 'merchandise', 'manual']),
  transactionHash: z.string().optional(),
});

const claimDividendSchema = z.object({
  masterId: z.string().min(1),
  tokenId: z.number().min(1),
  walletAddress: z.string().min(1),
});

// =============================================================================
// REVENUE ENDPOINTS
// =============================================================================

router.post(
  '/revenue',
  authenticate,
  validateBody(registerRevenueSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const data = req.body as {
        masterId: string;
        amount: string;
        currency: string;
        source: RevenueSource;
        transactionHash?: string;
      };
      
      const event = await dividendService.registerRevenueEvent(data);
      
      const response: ApiResponse<RevenueEvent> = {
        success: true,
        data: event,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTER_REVENUE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to register revenue event',
        },
      });
    }
  }
);

router.get('/revenue/:masterId', async (req, res) => {
  try {
    const { masterId } = req.params;
    const source = req.query.source as RevenueSource | undefined;
    const processed = req.query.processed === 'true' ? true : 
                      req.query.processed === 'false' ? false : undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const events = await dividendService.getRevenueEvents(masterId, {
      source,
      processed,
      limit,
      offset,
    });
    
    const response: ApiResponse<RevenueEvent[]> = {
      success: true,
      data: events,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_REVENUE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get revenue events',
      },
    });
  }
});

router.get('/revenue/:masterId/summary', async (req, res) => {
  try {
    const { masterId } = req.params;
    const summary = await dividendService.getRevenueSummary(masterId);
    
    const response: ApiResponse<typeof summary> = {
      success: true,
      data: summary,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SUMMARY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get revenue summary',
      },
    });
  }
});

router.post(
  '/revenue/:eventId/process',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { eventId } = req.params;
      const event = await dividendService.processRevenueEvent(eventId);
      
      const response: ApiResponse<RevenueEvent> = {
        success: true,
        data: event,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'PROCESS_REVENUE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process revenue event',
        },
      });
    }
  }
);

// =============================================================================
// CLAIMABLE DIVIDENDS ENDPOINTS
// =============================================================================

router.get('/claimable', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    // TODO: Get user's wallet addresses and query claimable for each
    const walletAddress = req.query.walletAddress as string;
    const masterId = req.query.masterId as string | undefined;
    
    if (!walletAddress) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_WALLET',
          message: 'Wallet address is required',
        },
      });
      return;
    }
    
    const claimable = await dividendService.getClaimableDividends(walletAddress, masterId);
    
    const response: ApiResponse<typeof claimable> = {
      success: true,
      data: claimable,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CLAIMABLE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get claimable dividends',
      },
    });
  }
});

router.get('/claimable/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const masterId = req.query.masterId as string | undefined;
    
    const claimable = await dividendService.getClaimableDividends(walletAddress, masterId);
    
    const response: ApiResponse<typeof claimable> = {
      success: true,
      data: claimable,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CLAIMABLE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get claimable dividends',
      },
    });
  }
});

// =============================================================================
// CLAIM ENDPOINTS
// =============================================================================

router.post(
  '/claim',
  authenticate,
  validateBody(claimDividendSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { masterId, tokenId, walletAddress } = req.body as {
        masterId: string;
        tokenId: number;
        walletAddress: string;
      };
      
      const claim = await dividendService.claimDividend(userId, walletAddress, masterId, tokenId);
      
      const response: ApiResponse<DividendClaim> = {
        success: true,
        data: claim,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CLAIM_ERROR',
          message: error instanceof Error ? error.message : 'Failed to claim dividends',
        },
      });
    }
  }
);

router.get('/history', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const masterId = req.query.masterId as string | undefined;
    const status = req.query.status as ClaimStatus | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const claims = await dividendService.getClaimHistory(userId, {
      masterId,
      status,
      limit,
      offset,
    });
    
    const response: ApiResponse<DividendClaim[]> = {
      success: true,
      data: claims,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HISTORY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get claim history',
      },
    });
  }
});

router.get('/summary', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const summary = await dividendService.getDividendSummary(userId);
    
    const response: ApiResponse<typeof summary> = {
      success: true,
      data: summary,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SUMMARY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get dividend summary',
      },
    });
  }
});

router.get('/artist-summary', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const artistId = req.user!.id;
    const summary = await dividendService.getArtistDividendSummary(artistId);
    
    const response: ApiResponse<typeof summary> = {
      success: true,
      data: summary,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SUMMARY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get artist dividend summary',
      },
    });
  }
});

// =============================================================================
// CONTRACT ENDPOINTS
// =============================================================================

router.get('/contract/:masterId', async (req, res) => {
  try {
    const { masterId } = req.params;
    const contract = await dividendService.getDividendContractByMaster(masterId);
    
    if (!contract) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CONTRACT_NOT_FOUND',
          message: 'Dividend contract not found for this master',
        },
      });
      return;
    }
    
    const response: ApiResponse<DividendContract> = {
      success: true,
      data: contract,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CONTRACT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get dividend contract',
      },
    });
  }
});

export default router;
