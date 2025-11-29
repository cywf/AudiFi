/**
 * Artist Coin & Liquidity API Routes
 * 
 * Endpoints:
 * - GET /artist-coins - List all Artist Coins
 * - GET /artist-coins/:id - Get Artist Coin details
 * - GET /artist-coins/by-artist/:artistId - Get Artist Coin by artist
 * - GET /artist-coins/:id/metrics - Get token metrics
 * - GET /artist-coins/:id/balance/:walletAddress - Get token balance
 * - GET /artist-coins/balances/:walletAddress - Get all token balances
 * - POST /artist-coins/:id/liquidity-pool - Create liquidity pool
 * - GET /artist-coins/:id/liquidity-pool - Get liquidity pool data
 * - GET /artist-coins/:id/swap-quote - Get swap quote
 */

import { Router } from 'express';
import { z } from 'zod';
import * as artistCoinService from '../services/artistCoinService.js';
import { authenticate, validateBody, type AuthenticatedRequest } from '../middleware/index.js';
import type { ApiResponse, ArtistCoin, ArtistCoinMetrics, LiquidityPoolType } from '../types/index.js';

const router = Router();

// =============================================================================
// SCHEMAS
// =============================================================================

const createLiquidityPoolSchema = z.object({
  poolType: z.enum(['uniswap_v2', 'uniswap_v3', 'sushiswap']),
  initialLiquidity: z.object({
    tokenAmount: z.string().min(1),
    ethAmount: z.string().min(1),
  }).optional(),
});

// =============================================================================
// ARTIST COIN ENDPOINTS
// =============================================================================

router.get('/', async (_req, res) => {
  try {
    const coins = await artistCoinService.getAllArtistCoins();
    
    const response: ApiResponse<ArtistCoin[]> = {
      success: true,
      data: coins,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_COINS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list artist coins',
      },
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const coin = await artistCoinService.getArtistCoinById(id);
    
    if (!coin) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COIN_NOT_FOUND',
          message: 'Artist Coin not found',
        },
      });
      return;
    }
    
    const response: ApiResponse<ArtistCoin> = {
      success: true,
      data: coin,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_COIN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get artist coin',
      },
    });
  }
});

router.get('/by-artist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    const coin = await artistCoinService.getArtistCoinByArtist(artistId);
    
    if (!coin) {
      res.status(404).json({
        success: false,
        error: {
          code: 'COIN_NOT_FOUND',
          message: 'Artist Coin not found for this artist',
        },
      });
      return;
    }
    
    const response: ApiResponse<ArtistCoin> = {
      success: true,
      data: coin,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_COIN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get artist coin',
      },
    });
  }
});

router.get('/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = await artistCoinService.getArtistCoinMetrics(id);
    
    if (!metrics) {
      res.status(404).json({
        success: false,
        error: {
          code: 'METRICS_NOT_FOUND',
          message: 'Metrics not found for this coin',
        },
      });
      return;
    }
    
    const response: ApiResponse<ArtistCoinMetrics> = {
      success: true,
      data: metrics,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_METRICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get coin metrics',
      },
    });
  }
});

// =============================================================================
// BALANCE ENDPOINTS
// =============================================================================

router.get('/:id/balance/:walletAddress', async (req, res) => {
  try {
    const { id, walletAddress } = req.params;
    const balance = await artistCoinService.getTokenBalance(id, walletAddress);
    
    const response: ApiResponse<typeof balance> = {
      success: true,
      data: balance,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BALANCE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get token balance',
      },
    });
  }
});

router.get('/balances/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const balances = await artistCoinService.getTokenBalances(walletAddress);
    
    const response: ApiResponse<typeof balances> = {
      success: true,
      data: balances,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_BALANCES_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get token balances',
      },
    });
  }
});

// =============================================================================
// LIQUIDITY POOL ENDPOINTS
// =============================================================================

router.post(
  '/:id/liquidity-pool',
  authenticate,
  validateBody(createLiquidityPoolSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { poolType, initialLiquidity } = req.body as {
        poolType: LiquidityPoolType;
        initialLiquidity?: { tokenAmount: string; ethAmount: string };
      };
      
      // Verify coin exists
      const coin = await artistCoinService.getArtistCoinById(id);
      if (!coin) {
        res.status(404).json({
          success: false,
          error: {
            code: 'COIN_NOT_FOUND',
            message: 'Artist Coin not found',
          },
        });
        return;
      }
      
      // TODO: Verify user owns this coin's artist account
      
      const result = await artistCoinService.createLiquidityPool(id, poolType, initialLiquidity);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_POOL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create liquidity pool',
        },
      });
    }
  }
);

router.get('/:id/liquidity-pool', async (req, res) => {
  try {
    const { id } = req.params;
    const poolData = await artistCoinService.getLiquidityPoolData(id);
    
    if (!poolData) {
      res.status(404).json({
        success: false,
        error: {
          code: 'POOL_NOT_FOUND',
          message: 'Liquidity pool not found for this coin',
        },
      });
      return;
    }
    
    const response: ApiResponse<typeof poolData> = {
      success: true,
      data: poolData,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_POOL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get liquidity pool',
      },
    });
  }
});

router.get('/:id/swap-quote', async (req, res) => {
  try {
    const { id } = req.params;
    const direction = (req.query.direction as 'buy' | 'sell') || 'buy';
    const amount = req.query.amount as string;
    
    if (!amount) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_AMOUNT',
          message: 'Amount is required',
        },
      });
      return;
    }
    
    const quote = await artistCoinService.getSwapQuote(id, direction, amount);
    
    const response: ApiResponse<typeof quote> = {
      success: true,
      data: quote,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_QUOTE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get swap quote',
      },
    });
  }
});

export default router;
