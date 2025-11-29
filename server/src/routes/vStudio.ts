/**
 * V Studio API Routes
 * 
 * Endpoints:
 * - POST /v-studio/sessions - Create a session
 * - GET /v-studio/sessions - List sessions for current user
 * - GET /v-studio/sessions/upcoming - Get upcoming public sessions
 * - GET /v-studio/sessions/:id - Get session details
 * - PATCH /v-studio/sessions/:id - Update session
 * - POST /v-studio/sessions/:id/start - Start (go live)
 * - POST /v-studio/sessions/:id/end - End session
 * - POST /v-studio/sessions/:id/cancel - Cancel session
 * - POST /v-studio/sessions/:id/link-ipo - Link IPO to session
 * - GET /v-studio/sessions/:id/eligibility - Check user eligibility
 * - POST /v-studio/sessions/:id/decisions - Create decision point
 * - GET /v-studio/sessions/:id/decisions - Get decision points
 * - POST /v-studio/decisions/:id/open - Open decision for voting
 * - POST /v-studio/decisions/:id/close - Close decision
 * - POST /v-studio/decisions/:id/finalize - Finalize decision
 * - POST /v-studio/decisions/:id/vote - Record vote
 * - GET /v-studio/decisions/:id/votes - Get votes for decision
 * - GET /v-studio/decisions/:id/stats - Get vote statistics
 */

import { Router } from 'express';
import { z } from 'zod';
import * as vStudioService from '../services/vStudioService.js';
import { authenticate, validateBody, type AuthenticatedRequest } from '../middleware/index.js';
import type { ApiResponse, VStudioSession, VStudioDecisionPoint, VStudioVote, VStudioSessionStatus, SubscriptionPlan } from '../types/index.js';

const router = Router();

// =============================================================================
// SCHEMAS
// =============================================================================

const createSessionSchema = z.object({
  masterId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  scheduledStartTime: z.string().optional(),
  eligibility: z.object({
    requireNFTOwnership: z.boolean().optional(),
    requiredNFTContractAddresses: z.array(z.string()).optional(),
    requireArtistCoin: z.boolean().optional(),
    requiredArtistCoinAmount: z.string().optional(),
    requireSubscription: z.boolean().optional(),
    minimumSubscriptionTier: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional(),
    isPublic: z.boolean().optional(),
  }).optional(),
});

const updateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  scheduledStartTime: z.string().optional(),
  eligibility: z.object({
    requireNFTOwnership: z.boolean().optional(),
    requiredNFTContractAddresses: z.array(z.string()).optional(),
    requireArtistCoin: z.boolean().optional(),
    requiredArtistCoinAmount: z.string().optional(),
    requireSubscription: z.boolean().optional(),
    minimumSubscriptionTier: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional(),
    isPublic: z.boolean().optional(),
  }).optional(),
});

const linkIPOSchema = z.object({
  ipoId: z.string().min(1),
});

const createDecisionSchema = z.object({
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
});

const voteSchema = z.object({
  optionId: z.string().min(1),
  walletAddress: z.string().optional(),
});

// =============================================================================
// SESSION ENDPOINTS
// =============================================================================

router.post(
  '/sessions',
  authenticate,
  validateBody(createSessionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const artistId = req.user!.id;
      const data = req.body as {
        masterId?: string;
        title: string;
        description?: string;
        scheduledStartTime?: string;
        eligibility?: Parameters<typeof vStudioService.createSession>[0]['eligibility'];
      };
      
      const session = await vStudioService.createSession({
        ...data,
        artistId,
      });
      
      const response: ApiResponse<VStudioSession> = {
        success: true,
        data: session,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create session',
        },
      });
    }
  }
);

router.get('/sessions', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const artistId = req.user!.id;
    const status = req.query.status as VStudioSessionStatus | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const sessions = await vStudioService.getSessionsByArtist(artistId, {
      status,
      limit,
      offset,
    });
    
    const response: ApiResponse<VStudioSession[]> = {
      success: true,
      data: sessions,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_SESSIONS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list sessions',
      },
    });
  }
});

router.get('/sessions/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const sessions = await vStudioService.getUpcomingSessions(limit);
    
    const response: ApiResponse<VStudioSession[]> = {
      success: true,
      data: sessions,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_UPCOMING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list upcoming sessions',
      },
    });
  }
});

router.get('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await vStudioService.getSessionById(id);
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
        },
      });
      return;
    }
    
    const response: ApiResponse<VStudioSession> = {
      success: true,
      data: session,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get session',
      },
    });
  }
});

router.patch(
  '/sessions/:id',
  authenticate,
  validateBody(updateSessionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Verify ownership
      const existing = await vStudioService.getSessionById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or not owned by user',
          },
        });
        return;
      }
      
      const session = await vStudioService.updateSession(id, req.body);
      
      const response: ApiResponse<VStudioSession> = {
        success: true,
        data: session!,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update session',
        },
      });
    }
  }
);

router.post(
  '/sessions/:id/start',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Verify ownership
      const existing = await vStudioService.getSessionById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or not owned by user',
          },
        });
        return;
      }
      
      const session = await vStudioService.startSession(id);
      
      const response: ApiResponse<VStudioSession> = {
        success: true,
        data: session!,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'START_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to start session',
        },
      });
    }
  }
);

router.post(
  '/sessions/:id/end',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Verify ownership
      const existing = await vStudioService.getSessionById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or not owned by user',
          },
        });
        return;
      }
      
      const session = await vStudioService.endSession(id);
      
      const response: ApiResponse<VStudioSession> = {
        success: true,
        data: session!,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'END_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to end session',
        },
      });
    }
  }
);

router.post(
  '/sessions/:id/cancel',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Verify ownership
      const existing = await vStudioService.getSessionById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or not owned by user',
          },
        });
        return;
      }
      
      const session = await vStudioService.cancelSession(id);
      
      const response: ApiResponse<VStudioSession> = {
        success: true,
        data: session!,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CANCEL_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cancel session',
        },
      });
    }
  }
);

router.post(
  '/sessions/:id/link-ipo',
  authenticate,
  validateBody(linkIPOSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      const { ipoId } = req.body as { ipoId: string };
      
      // Verify ownership
      const existing = await vStudioService.getSessionById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or not owned by user',
          },
        });
        return;
      }
      
      const session = await vStudioService.linkIPO(id, ipoId);
      
      const response: ApiResponse<VStudioSession> = {
        success: true,
        data: session!,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'LINK_IPO_ERROR',
          message: error instanceof Error ? error.message : 'Failed to link IPO',
        },
      });
    }
  }
);

router.get('/sessions/:id/eligibility', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const walletAddress = req.query.walletAddress as string | undefined;
    
    // TODO: Get user's subscription from user service
    const userSubscription: SubscriptionPlan = 'PRO';
    
    const result = await vStudioService.checkEligibility(id, userId, userSubscription, walletAddress);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECK_ELIGIBILITY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to check eligibility',
      },
    });
  }
});

// =============================================================================
// DECISION POINT ENDPOINTS
// =============================================================================

router.post(
  '/sessions/:id/decisions',
  authenticate,
  validateBody(createDecisionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      const { question, options } = req.body as { question: string; options: string[] };
      
      // Verify ownership
      const existing = await vStudioService.getSessionById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or not owned by user',
          },
        });
        return;
      }
      
      const decision = await vStudioService.createDecisionPoint({
        sessionId: id,
        question,
        options,
      });
      
      const response: ApiResponse<VStudioDecisionPoint> = {
        success: true,
        data: decision,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_DECISION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create decision point',
        },
      });
    }
  }
);

router.get('/sessions/:id/decisions', async (req, res) => {
  try {
    const { id } = req.params;
    const decisions = await vStudioService.getDecisionPoints(id);
    
    const response: ApiResponse<VStudioDecisionPoint[]> = {
      success: true,
      data: decisions,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_DECISIONS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list decision points',
      },
    });
  }
});

router.post(
  '/decisions/:id/open',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // TODO: Verify session ownership
      
      const decision = await vStudioService.openDecisionPoint(id);
      
      if (!decision) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DECISION_NOT_FOUND',
            message: 'Decision point not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<VStudioDecisionPoint> = {
        success: true,
        data: decision,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'OPEN_DECISION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to open decision point',
        },
      });
    }
  }
);

router.post(
  '/decisions/:id/close',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      const decision = await vStudioService.closeDecisionPoint(id);
      
      if (!decision) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DECISION_NOT_FOUND',
            message: 'Decision point not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<VStudioDecisionPoint> = {
        success: true,
        data: decision,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CLOSE_DECISION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to close decision point',
        },
      });
    }
  }
);

router.post(
  '/decisions/:id/finalize',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      const decision = await vStudioService.finalizeDecisionPoint(id);
      
      if (!decision) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DECISION_NOT_FOUND',
            message: 'Decision point not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<VStudioDecisionPoint> = {
        success: true,
        data: decision,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'FINALIZE_DECISION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to finalize decision point',
        },
      });
    }
  }
);

router.post(
  '/decisions/:id/vote',
  authenticate,
  validateBody(voteSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { optionId, walletAddress } = req.body as { optionId: string; walletAddress?: string };
      
      const vote = await vStudioService.recordVote({
        decisionPointId: id,
        optionId,
        userId,
        walletAddress,
      });
      
      const response: ApiResponse<VStudioVote> = {
        success: true,
        data: vote,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VOTE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to record vote',
        },
      });
    }
  }
);

router.get('/decisions/:id/votes', async (req, res) => {
  try {
    const { id } = req.params;
    const votes = await vStudioService.getVotes(id);
    
    const response: ApiResponse<VStudioVote[]> = {
      success: true,
      data: votes,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_VOTES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get votes',
      },
    });
  }
});

router.get('/decisions/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await vStudioService.getVoteStats(id);
    
    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get vote statistics',
      },
    });
  }
});

export default router;
