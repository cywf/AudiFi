/**
 * Analytics API Routes
 * 
 * Endpoints:
 * - GET /analytics/artist - Get artist analytics
 * - GET /analytics/artist/time-series - Get artist time-series analytics
 * - GET /analytics/artist/top - Get top artists by metric
 * - GET /analytics/artist/v-studio - Get artist V Studio analytics
 * - GET /analytics/master/:masterId - Get master analytics
 * - GET /analytics/master/:masterId/holders - Get holder distribution
 * - GET /analytics/master/:masterId/sales - Get sales history
 * - GET /analytics/v-studio/:sessionId - Get V Studio session analytics
 * - GET /analytics/v-studio/:sessionId/engagement - Get engagement metrics
 * - GET /analytics/token/:coinId - Get token analytics
 * - GET /analytics/platform - Get platform-wide analytics (admin)
 * - GET /analytics/activity - Get recent activity feed
 */

import { Router } from 'express';
import * as analyticsService from '../services/analyticsService.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/index.js';
import type { ApiResponse, ArtistAnalytics, MasterAnalytics, VStudioAnalytics, AnalyticsPeriod } from '../types/index.js';

const router = Router();

// =============================================================================
// ARTIST ANALYTICS ENDPOINTS
// =============================================================================

router.get('/artist', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const artistId = req.user!.id;
    const period = (req.query.period as AnalyticsPeriod) || 'all_time';
    
    const analytics = await analyticsService.getArtistAnalytics(artistId, period);
    
    const response: ApiResponse<ArtistAnalytics> = {
      success: true,
      data: analytics,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get artist analytics',
      },
    });
  }
});

router.get('/artist/time-series', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const artistId = req.user!.id;
    const metric = (req.query.metric as 'revenue' | 'nfts_minted' | 'viewers') || 'revenue';
    const period = (req.query.period as AnalyticsPeriod) || 'month';
    
    const data = await analyticsService.getArtistAnalyticsTimeSeries(artistId, metric, period);
    
    const response: ApiResponse<typeof data> = {
      success: true,
      data,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_TIME_SERIES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get time-series analytics',
      },
    });
  }
});

router.get('/artist/top', async (req, res) => {
  try {
    const metric = (req.query.metric as 'revenue' | 'nfts_sold' | 'viewers') || 'revenue';
    const limit = parseInt(req.query.limit as string) || 10;
    
    const artists = await analyticsService.getTopArtists(metric, limit);
    
    const response: ApiResponse<typeof artists> = {
      success: true,
      data: artists,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_TOP_ARTISTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get top artists',
      },
    });
  }
});

router.get('/artist/v-studio', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const artistId = req.user!.id;
    const period = (req.query.period as AnalyticsPeriod) || 'all_time';
    
    const analytics = await analyticsService.getArtistVStudioAnalytics(artistId, period);
    
    const response: ApiResponse<typeof analytics> = {
      success: true,
      data: analytics,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_V_STUDIO_ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get V Studio analytics',
      },
    });
  }
});

// =============================================================================
// MASTER ANALYTICS ENDPOINTS
// =============================================================================

router.get('/master/:masterId', async (req, res) => {
  try {
    const { masterId } = req.params;
    const period = (req.query.period as AnalyticsPeriod) || 'all_time';
    
    const analytics = await analyticsService.getMasterAnalytics(masterId, period);
    
    const response: ApiResponse<MasterAnalytics> = {
      success: true,
      data: analytics,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_MASTER_ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get master analytics',
      },
    });
  }
});

router.get('/master/:masterId/holders', async (req, res) => {
  try {
    const { masterId } = req.params;
    
    const distribution = await analyticsService.getMasterHolderDistribution(masterId);
    
    const response: ApiResponse<typeof distribution> = {
      success: true,
      data: distribution,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HOLDERS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get holder distribution',
      },
    });
  }
});

router.get('/master/:masterId/sales', async (req, res) => {
  try {
    const { masterId } = req.params;
    const type = req.query.type as 'primary' | 'secondary' | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const sales = await analyticsService.getMasterSalesHistory(masterId, {
      type,
      limit,
      offset,
    });
    
    const response: ApiResponse<typeof sales> = {
      success: true,
      data: sales,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SALES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get sales history',
      },
    });
  }
});

// =============================================================================
// V STUDIO ANALYTICS ENDPOINTS
// =============================================================================

router.get('/v-studio/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const analytics = await analyticsService.getVStudioAnalytics(sessionId);
    
    const response: ApiResponse<VStudioAnalytics> = {
      success: true,
      data: analytics,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_V_STUDIO_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get V Studio analytics',
      },
    });
  }
});

router.get('/v-studio/:sessionId/engagement', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const engagement = await analyticsService.getSessionEngagementMetrics(sessionId);
    
    const response: ApiResponse<typeof engagement> = {
      success: true,
      data: engagement,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_ENGAGEMENT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get engagement metrics',
      },
    });
  }
});

// =============================================================================
// TOKEN ANALYTICS ENDPOINTS
// =============================================================================

router.get('/token/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const period = (req.query.period as AnalyticsPeriod) || 'month';
    
    const analytics = await analyticsService.getTokenAnalytics(coinId, period);
    
    const response: ApiResponse<typeof analytics> = {
      success: true,
      data: analytics,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_TOKEN_ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get token analytics',
      },
    });
  }
});

// =============================================================================
// PLATFORM ANALYTICS ENDPOINTS
// =============================================================================

router.get('/platform', async (_req, res) => {
  try {
    // TODO: Add admin authentication check
    
    const analytics = await analyticsService.getPlatformAnalytics();
    
    const response: ApiResponse<typeof analytics> = {
      success: true,
      data: analytics,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PLATFORM_ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get platform analytics',
      },
    });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const activity = await analyticsService.getRecentActivity(limit);
    
    const response: ApiResponse<typeof activity> = {
      success: true,
      data: activity,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_ACTIVITY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get recent activity',
      },
    });
  }
});

export default router;
