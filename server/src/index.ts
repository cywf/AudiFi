/**
 * AudiFi Backend Server
 * Main entry point for the Express.js API server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config_settings from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/index.js';

const app = express();

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config_settings.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Refresh-Token'],
}));

// Rate limiting
app.use(rateLimit({
  windowMs: config_settings.rateLimit.windowMs,
  max: config_settings.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// =============================================================================
// ROUTES
// =============================================================================

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'AudiFi Backend API',
    version: '0.1.0',
    status: 'running',
    documentation: '/api/v1/health',
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================

const PORT = config_settings.server.port;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    AudiFi Backend Server                       ║
╠════════════════════════════════════════════════════════════════╣
║  Environment: ${config_settings.env.padEnd(48)}║
║  Port: ${PORT.toString().padEnd(55)}║
║  API Base: ${config_settings.server.baseUrl.padEnd(51)}║
╠════════════════════════════════════════════════════════════════╣
║  Available Endpoints:                                          ║
║  • GET  /api/v1/health           - Health check                ║
║  • POST /api/v1/auth/magic-link  - Authentication              ║
║  • GET  /api/v1/masters          - Master IPO management       ║
║  • GET  /api/v1/artist-coins     - Artist Coin & Liquidity     ║
║  • GET  /api/v1/dividends        - Dividend & Revenue          ║
║  • GET  /api/v1/v-studio         - V Studio Sessions           ║
║  • GET  /api/v1/payments         - Subscriptions & Payments    ║
║  • GET  /api/v1/analytics        - Analytics & Metrics         ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
