/**
 * AudiFi API Routes
 * Main router configuration aggregating all service routes
 */

import { Router } from 'express';
import authRoutes from './auth.js';
import masterRoutes from './masters.js';
import artistCoinRoutes from './artistCoins.js';
import dividendRoutes from './dividends.js';
import vStudioRoutes from './vStudio.js';
import paymentRoutes from './payments.js';
import analyticsRoutes from './analytics.js';
import { isDatabaseReady } from '../db/index.js';

const router = Router();

// Health check endpoint with dependency checks
router.get('/health', async (_req, res) => {
  const dbHealthy = await isDatabaseReady();
  
  const status = dbHealthy ? 'ok' : 'degraded';
  const httpStatus = dbHealthy ? 200 : 503;
  
  res.status(httpStatus).json({
    status,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    dependencies: {
      database: dbHealthy ? 'connected' : 'disconnected',
      // Add more dependency checks as needed
      // redis: await isRedisReady() ? 'connected' : 'disconnected',
    },
  });
});

// Mount service routes
router.use('/auth', authRoutes);
router.use('/masters', masterRoutes);
router.use('/artist-coins', artistCoinRoutes);
router.use('/dividends', dividendRoutes);
router.use('/v-studio', vStudioRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
