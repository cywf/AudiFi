/**
 * Auth & Identity API Routes
 * 
 * Endpoints:
 * - POST /auth/magic-link/request - Request a magic link
 * - POST /auth/magic-link/verify - Verify a magic link token
 * - POST /auth/2fa/setup/totp - Set up TOTP-based 2FA
 * - POST /auth/2fa/verify/totp - Verify TOTP code
 * - POST /auth/2fa/setup/passkey - Set up passkey-based 2FA
 * - POST /auth/2fa/verify/passkey - Verify passkey
 * - POST /auth/2fa/enable - Enable 2FA for user
 * - POST /auth/2fa/disable - Disable 2FA for user
 * - POST /auth/wallet/associate - Associate wallet with account
 * - DELETE /auth/wallet/:address - Remove wallet association
 * - POST /auth/wallet/primary - Set primary wallet
 * - GET /auth/sso/google - Initiate Google SSO
 * - GET /auth/sso/google/callback - Google SSO callback
 * - GET /auth/sso/microsoft - Initiate Microsoft SSO
 * - GET /auth/sso/microsoft/callback - Microsoft SSO callback
 * - POST /auth/session/refresh - Refresh session token
 * - POST /auth/logout - Log out (invalidate session)
 * - GET /auth/me - Get current user
 * - PATCH /auth/me - Update current user
 */

import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService.js';
import { authenticate, validateBody, type AuthenticatedRequest } from '../middleware/index.js';
import type { ApiResponse, User, AuthSession, BlockchainNetwork, TwoFactorMethod } from '../types/index.js';

const router = Router();

// =============================================================================
// SCHEMAS
// =============================================================================

const requestMagicLinkSchema = z.object({
  email: z.string().email(),
});

const verifyMagicLinkSchema = z.object({
  token: z.string().min(1),
});

const verifyTOTPSchema = z.object({
  code: z.string().length(6),
});

const enable2FASchema = z.object({
  method: z.enum(['totp', 'passkey']),
});

const associateWalletSchema = z.object({
  walletAddress: z.string().min(1),
  chain: z.enum(['ethereum', 'polygon', 'base', 'ethereum_goerli', 'ethereum_sepolia', 'polygon_mumbai', 'base_goerli']),
  signature: z.string().min(1),
  message: z.string().min(1),
});

const setPrimaryWalletSchema = z.object({
  walletAddress: z.string().min(1),
  chain: z.enum(['ethereum', 'polygon', 'base', 'ethereum_goerli', 'ethereum_sepolia', 'polygon_mumbai', 'base_goerli']),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
});

// =============================================================================
// MAGIC LINK ENDPOINTS
// =============================================================================

router.post(
  '/magic-link/request',
  validateBody(requestMagicLinkSchema),
  async (req, res) => {
    try {
      const { email } = req.body;
      const result = await authService.requestMagicLink(email);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MAGIC_LINK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send magic link',
        },
      });
    }
  }
);

router.post(
  '/magic-link/verify',
  validateBody(verifyMagicLinkSchema),
  async (req, res) => {
    try {
      const { token } = req.body;
      const session = await authService.verifyMagicLink(token);
      
      if (!session) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired magic link token',
          },
        });
        return;
      }
      
      const response: ApiResponse<AuthSession> = {
        success: true,
        data: session,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'VERIFICATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to verify magic link',
        },
      });
    }
  }
);

// =============================================================================
// 2FA ENDPOINTS
// =============================================================================

router.post(
  '/2fa/setup/totp',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const result = await authService.setupTOTP(userId);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: '2FA_SETUP_ERROR',
          message: error instanceof Error ? error.message : 'Failed to set up 2FA',
        },
      });
    }
  }
);

router.post(
  '/2fa/verify/totp',
  authenticate,
  validateBody(verifyTOTPSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { code } = req.body;
      const valid = await authService.verifyTOTP(userId, code);
      
      if (!valid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CODE',
            message: 'Invalid 2FA code',
          },
        });
        return;
      }
      
      const response: ApiResponse<{ verified: boolean }> = {
        success: true,
        data: { verified: true },
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: '2FA_VERIFY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to verify 2FA code',
        },
      });
    }
  }
);

router.post(
  '/2fa/setup/passkey',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const result = await authService.setupPasskey(userId);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'PASSKEY_SETUP_ERROR',
          message: error instanceof Error ? error.message : 'Failed to set up passkey',
        },
      });
    }
  }
);

router.post(
  '/2fa/enable',
  authenticate,
  validateBody(enable2FASchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { method } = req.body as { method: TwoFactorMethod };
      const user = await authService.enable2FA(userId, method);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: '2FA_ENABLE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to enable 2FA',
        },
      });
    }
  }
);

router.post(
  '/2fa/disable',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await authService.disable2FA(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: '2FA_DISABLE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to disable 2FA',
        },
      });
    }
  }
);

// =============================================================================
// WALLET ENDPOINTS
// =============================================================================

router.post(
  '/wallet/associate',
  authenticate,
  validateBody(associateWalletSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { walletAddress, chain, signature, message } = req.body as {
        walletAddress: string;
        chain: BlockchainNetwork;
        signature: string;
        message: string;
      };
      
      const user = await authService.associateWallet(
        userId,
        walletAddress,
        chain,
        signature,
        message
      );
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'WALLET_ASSOCIATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to associate wallet',
        },
      });
    }
  }
);

router.delete(
  '/wallet/:address',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { address } = req.params;
      const chain = (req.query.chain as BlockchainNetwork) || 'ethereum';
      
      const user = await authService.removeWallet(userId, address, chain);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'WALLET_REMOVE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to remove wallet',
        },
      });
    }
  }
);

router.post(
  '/wallet/primary',
  authenticate,
  validateBody(setPrimaryWalletSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { walletAddress, chain } = req.body as {
        walletAddress: string;
        chain: BlockchainNetwork;
      };
      
      const user = await authService.setPrimaryWallet(userId, walletAddress, chain);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'WALLET_PRIMARY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to set primary wallet',
        },
      });
    }
  }
);

// =============================================================================
// SSO ENDPOINTS
// =============================================================================

router.get('/sso/google', async (_req, res) => {
  try {
    const result = await authService.initiateGoogleSSO();
    res.redirect(result.redirectUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SSO_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initiate Google SSO',
      },
    });
  }
});

router.get('/sso/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const session = await authService.handleGoogleCallback(code as string);
    
    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          code: 'SSO_CALLBACK_ERROR',
          message: 'Failed to complete Google SSO',
        },
      });
      return;
    }
    
    // TODO: Redirect to frontend with session token
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SSO_CALLBACK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to complete Google SSO',
      },
    });
  }
});

router.get('/sso/microsoft', async (_req, res) => {
  try {
    const result = await authService.initiateMicrosoftSSO();
    res.redirect(result.redirectUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SSO_ERROR',
        message: error instanceof Error ? error.message : 'Failed to initiate Microsoft SSO',
      },
    });
  }
});

router.get('/sso/microsoft/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const session = await authService.handleMicrosoftCallback(code as string);
    
    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          code: 'SSO_CALLBACK_ERROR',
          message: 'Failed to complete Microsoft SSO',
        },
      });
      return;
    }
    
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SSO_CALLBACK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to complete Microsoft SSO',
      },
    });
  }
});

// =============================================================================
// SESSION ENDPOINTS
// =============================================================================

router.post('/session/refresh', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required',
        },
      });
      return;
    }
    
    const session = await authService.refreshSession(refreshToken);
    
    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
      return;
    }
    
    const response: ApiResponse<AuthSession> = {
      success: true,
      data: session,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to refresh session',
      },
    });
  }
});

router.post('/logout', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    
    if (token) {
      authService.invalidateSession(token);
    }
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Logged out successfully' },
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to log out',
      },
    });
  }
});

// =============================================================================
// USER ENDPOINTS
// =============================================================================

router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await authService.getUserById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }
    
    const response: ApiResponse<User> = {
      success: true,
      data: user,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get user',
      },
    });
  }
});

router.patch(
  '/me',
  authenticate,
  validateBody(updateUserSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await authService.updateUser(userId, req.body);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_USER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update user',
        },
      });
    }
  }
);

export default router;
