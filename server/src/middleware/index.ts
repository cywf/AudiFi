/**
 * AudiFi Backend Middleware
 * Authentication, error handling, and rate limiting
 */

import type { Request, Response, NextFunction } from 'express';
import type { UserRole, ApiError, ApiResponse } from '../types/index.js';
import config_settings from '../config/index.js';

// =============================================================================
// TYPES
// =============================================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    walletAddress?: string;
  };
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response<ApiResponse<null>>,
  _next: NextFunction
): void {
  // Log error for debugging
  const traceId = generateTraceId();
  console.error(`[${traceId}] Error:`, err);

  // Determine status code and error details
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const details = err instanceof AppError ? err.details : undefined;

  // In production, don't expose internal error messages
  const message = config_settings.isProduction && statusCode >= 500
    ? 'An internal error occurred'
    : err.message;

  const error: ApiError = {
    code,
    message,
    details: config_settings.isDevelopment ? { ...details, traceId } : undefined,
  };

  res.status(statusCode).json({
    success: false,
    error,
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response<ApiResponse<null>>
): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

/**
 * Generate a unique trace ID for error tracking
 */
function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// AUTHENTICATION
// =============================================================================

/**
 * Authentication middleware
 * Validates JWT token and populates req.user
 * 
 * TODO: Implement actual JWT validation
 * Currently returns a mock user for development
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      },
    });
    return;
  }

  const token = authHeader.substring(7);

  // TODO: Implement actual JWT verification
  // For development, accept any token and return mock user
  if (config_settings.isDevelopment && token) {
    req.user = {
      id: 'user_dev_001',
      email: 'dev@audifi.io',
      role: 'artist',
    };
    next();
    return;
  }

  // In production, verify the JWT
  // TODO: Implement JWT verification with jsonwebtoken or similar
  res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    },
  });
}

/**
 * Optional authentication middleware
 * Populates req.user if token is present, but doesn't require it
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // TODO: Implement actual JWT verification
    // For development, accept any token
    if (config_settings.isDevelopment && token) {
      req.user = {
        id: 'user_dev_001',
        email: 'dev@audifi.io',
        role: 'artist',
      };
    }
  }

  next();
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions for this action',
        },
      });
      return;
    }

    next();
  };
}

// =============================================================================
// REQUEST LOGGING
// =============================================================================

/**
 * Request logging middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const requestId = generateTraceId();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    console[logLevel === 'warn' ? 'warn' : 'log'](
      `[${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Request body validation middleware using Zod schemas
 */
export function validateBody<T>(schema: { parse: (data: unknown) => T }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: config_settings.isDevelopment ? { error } : undefined,
        },
      });
    }
  };
}

/**
 * Request query validation middleware using Zod schemas
 */
export function validateQuery<T>(schema: { parse: (data: unknown) => T }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate, but don't reassign to req.query
      // The validated data can be accessed via res.locals if needed
      schema.parse(req.query);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: config_settings.isDevelopment ? { error } : undefined,
        },
      });
    }
  };
}
