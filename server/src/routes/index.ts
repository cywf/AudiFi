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

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
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
