/**
 * Master IPO & NFT API Routes
 * 
 * Endpoints:
 * - POST /masters - Create a Master
 * - GET /masters - List Masters for current user
 * - GET /masters/:id - Get Master details
 * - PATCH /masters/:id - Update Master
 * - POST /masters/:id/confirm-rights - Confirm rights ownership
 * - POST /masters/:id/upload - Upload media to IPFS
 * - POST /masters/:id/ipo - Create Master IPO
 * - GET /masters/:id/ipo - Get Master IPO details
 * - PATCH /masters/:id/ipo - Update Master IPO
 * - POST /masters/:id/ipo/launch - Launch Master IPO
 * - POST /masters/:id/ipo/cancel - Cancel Master IPO
 * - POST /masters/:id/ipo/mint - Mint NFT
 * - GET /masters/:id/ipo/mint-preview - Get mint preview
 * - GET /masters/:id/holders - Get NFT holders
 * - GET /masters/:id/mover-advantage - Get Mover Advantage holders
 * - GET /mover-advantage/config - Get Mover Advantage configuration
 */

import { Router } from 'express';
import { z } from 'zod';
import * as masterIPOService from '../services/masterIPOService.js';
import { authenticate, validateBody, type AuthenticatedRequest } from '../middleware/index.js';
import type { ApiResponse, Master, MasterIPO, MasterType, BlockchainNetwork, IPOCurrency, MoverAdvantageConfig, MasterNFTHolder } from '../types/index.js';

const router = Router();

// =============================================================================
// SCHEMAS
// =============================================================================

const createMasterSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  type: z.enum(['track', 'album']),
  genre: z.string().min(1).max(100),
  bpm: z.number().min(1).max(300).optional(),
  duration: z.number().min(1).optional(),
  releaseDate: z.string().optional(),
  moodTags: z.array(z.string()).optional(),
  audioFileUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
});

const updateMasterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  genre: z.string().min(1).max(100).optional(),
  bpm: z.number().min(1).max(300).optional(),
  duration: z.number().min(1).optional(),
  releaseDate: z.string().optional(),
  moodTags: z.array(z.string()).optional(),
  audioFileUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
});

const createIPOSchema = z.object({
  totalSupply: z.number().min(1).max(1000000),
  mintPrice: z.string().min(1),
  currency: z.enum(['ETH', 'MATIC', 'BASE_ETH']),
  blockchain: z.enum(['ethereum', 'polygon', 'base', 'ethereum_goerli', 'ethereum_sepolia', 'polygon_mumbai', 'base_goerli']),
  launchDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateIPOSchema = z.object({
  totalSupply: z.number().min(1).max(1000000).optional(),
  mintPrice: z.string().optional(),
  launchDate: z.string().optional(),
  endDate: z.string().optional(),
});

const mintNFTSchema = z.object({
  minterAddress: z.string().min(1),
  quantity: z.number().min(1).max(10).optional(),
});

// =============================================================================
// MASTER ENDPOINTS
// =============================================================================

router.post(
  '/',
  authenticate,
  validateBody(createMasterSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const artistId = req.user!.id;
      const data = req.body as {
        title: string;
        description: string;
        type: MasterType;
        genre: string;
        bpm?: number;
        duration?: number;
        releaseDate?: string;
        moodTags?: string[];
        audioFileUrl?: string;
        coverImageUrl?: string;
      };
      
      const master = await masterIPOService.createMaster({
        ...data,
        artistId,
      });
      
      const response: ApiResponse<Master> = {
        success: true,
        data: master,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_MASTER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create master',
        },
      });
    }
  }
);

router.get('/', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const artistId = req.user!.id;
    const masters = await masterIPOService.getMastersByArtist(artistId);
    
    const response: ApiResponse<Master[]> = {
      success: true,
      data: masters,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_MASTERS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to list masters',
      },
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const master = await masterIPOService.getMasterById(id);
    
    if (!master) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MASTER_NOT_FOUND',
          message: 'Master not found',
        },
      });
      return;
    }
    
    const response: ApiResponse<Master> = {
      success: true,
      data: master,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_MASTER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get master',
      },
    });
  }
});

router.patch(
  '/:id',
  authenticate,
  validateBody(updateMasterSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Verify ownership
      const existing = await masterIPOService.getMasterById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'MASTER_NOT_FOUND',
            message: 'Master not found or not owned by user',
          },
        });
        return;
      }
      
      const master = await masterIPOService.updateMaster(id, req.body);
      
      const response: ApiResponse<Master> = {
        success: true,
        data: master!,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_MASTER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update master',
        },
      });
    }
  }
);

router.post(
  '/:id/confirm-rights',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      const master = await masterIPOService.confirmRights(id, artistId);
      
      if (!master) {
        res.status(404).json({
          success: false,
          error: {
            code: 'MASTER_NOT_FOUND',
            message: 'Master not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<Master> = {
        success: true,
        data: master,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CONFIRM_RIGHTS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to confirm rights',
        },
      });
    }
  }
);

router.post(
  '/:id/upload',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Verify ownership
      const existing = await masterIPOService.getMasterById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'MASTER_NOT_FOUND',
            message: 'Master not found or not owned by user',
          },
        });
        return;
      }
      
      // TODO: Handle file upload from request
      const result = await masterIPOService.uploadToIPFS(id);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to upload to IPFS',
        },
      });
    }
  }
);

// =============================================================================
// IPO ENDPOINTS
// =============================================================================

router.post(
  '/:id/ipo',
  authenticate,
  validateBody(createIPOSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Verify ownership
      const existing = await masterIPOService.getMasterById(id);
      if (!existing || existing.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'MASTER_NOT_FOUND',
            message: 'Master not found or not owned by user',
          },
        });
        return;
      }
      
      const data = req.body as {
        totalSupply: number;
        mintPrice: string;
        currency: IPOCurrency;
        blockchain: BlockchainNetwork;
        launchDate?: string;
        endDate?: string;
      };
      
      const ipo = await masterIPOService.createMasterIPO({
        masterId: id,
        artistId,
        ...data,
      });
      
      const response: ApiResponse<MasterIPO> = {
        success: true,
        data: ipo,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_IPO_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create IPO',
        },
      });
    }
  }
);

router.get('/:id/ipo', async (req, res) => {
  try {
    const { id } = req.params;
    const ipo = await masterIPOService.getMasterIPOByMasterId(id);
    
    if (!ipo) {
      res.status(404).json({
        success: false,
        error: {
          code: 'IPO_NOT_FOUND',
          message: 'IPO not found for this master',
        },
      });
      return;
    }
    
    const response: ApiResponse<MasterIPO> = {
      success: true,
      data: ipo,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_IPO_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get IPO',
      },
    });
  }
});

router.patch(
  '/:id/ipo',
  authenticate,
  validateBody(updateIPOSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Get IPO and verify ownership
      const ipo = await masterIPOService.getMasterIPOByMasterId(id);
      if (!ipo || ipo.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'IPO_NOT_FOUND',
            message: 'IPO not found or not owned by user',
          },
        });
        return;
      }
      
      const updatedIPO = await masterIPOService.updateMasterIPO(ipo.id, req.body);
      
      const response: ApiResponse<MasterIPO> = {
        success: true,
        data: updatedIPO!,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_IPO_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update IPO',
        },
      });
    }
  }
);

router.post(
  '/:id/ipo/launch',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Get IPO and verify ownership
      const ipo = await masterIPOService.getMasterIPOByMasterId(id);
      if (!ipo || ipo.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'IPO_NOT_FOUND',
            message: 'IPO not found or not owned by user',
          },
        });
        return;
      }
      
      const result = await masterIPOService.launchMasterIPO(ipo.id, artistId);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'LAUNCH_IPO_ERROR',
          message: error instanceof Error ? error.message : 'Failed to launch IPO',
        },
      });
    }
  }
);

router.post(
  '/:id/ipo/cancel',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const artistId = req.user!.id;
      
      // Get IPO and verify ownership
      const ipo = await masterIPOService.getMasterIPOByMasterId(id);
      if (!ipo || ipo.artistId !== artistId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'IPO_NOT_FOUND',
            message: 'IPO not found or not owned by user',
          },
        });
        return;
      }
      
      const canceledIPO = await masterIPOService.cancelMasterIPO(ipo.id);
      
      const response: ApiResponse<MasterIPO> = {
        success: true,
        data: canceledIPO!,
      };
      
      res.json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CANCEL_IPO_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cancel IPO',
        },
      });
    }
  }
);

router.post(
  '/:id/ipo/mint',
  authenticate,
  validateBody(mintNFTSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { minterAddress, quantity } = req.body as {
        minterAddress: string;
        quantity?: number;
      };
      
      // Get IPO
      const ipo = await masterIPOService.getMasterIPOByMasterId(id);
      if (!ipo) {
        res.status(404).json({
          success: false,
          error: {
            code: 'IPO_NOT_FOUND',
            message: 'IPO not found for this master',
          },
        });
        return;
      }
      
      const result = await masterIPOService.mintNFT(ipo.id, minterAddress, quantity);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MINT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to mint NFT',
        },
      });
    }
  }
);

router.get('/:id/ipo/mint-preview', async (req, res) => {
  try {
    const { id } = req.params;
    const quantity = parseInt(req.query.quantity as string) || 1;
    
    // Get IPO
    const ipo = await masterIPOService.getMasterIPOByMasterId(id);
    if (!ipo) {
      res.status(404).json({
        success: false,
        error: {
          code: 'IPO_NOT_FOUND',
          message: 'IPO not found for this master',
        },
      });
      return;
    }
    
    const preview = await masterIPOService.getMintPreview(ipo.id, quantity);
    
    const response: ApiResponse<typeof preview> = {
      success: true,
      data: preview,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PREVIEW_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get mint preview',
      },
    });
  }
});

// =============================================================================
// HOLDER ENDPOINTS
// =============================================================================

router.get('/:id/holders', async (req, res) => {
  try {
    const { id } = req.params;
    const holders = await masterIPOService.getNFTHolders(id);
    
    const response: ApiResponse<MasterNFTHolder[]> = {
      success: true,
      data: holders,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_HOLDERS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get holders',
      },
    });
  }
});

router.get('/:id/mover-advantage', async (req, res) => {
  try {
    const { id } = req.params;
    const holders = await masterIPOService.getMoverAdvantageHolders(id);
    
    const response: ApiResponse<MasterNFTHolder[]> = {
      success: true,
      data: holders,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_MOVER_ADVANTAGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get Mover Advantage holders',
      },
    });
  }
});

// =============================================================================
// MOVER ADVANTAGE CONFIG
// =============================================================================

router.get('/mover-advantage/config', (_req, res) => {
  const config = masterIPOService.getMoverAdvantageConfig();
  
  const response: ApiResponse<MoverAdvantageConfig> = {
    success: true,
    data: config,
  };
  
  res.json(response);
});

export default router;
