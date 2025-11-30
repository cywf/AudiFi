/**
 * AudiFi Backend Environment Configuration
 * 
 * Centralized environment variable loading and validation for the backend.
 * This module provides a typed config object for use across the application.
 * 
 * IMPORTANT: This file should be the single source of truth for all
 * environment variables. Database connections use the Neon-provided
 * connection string via DATABASE_URL.
 */

import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Validate that required environment variables are present.
 * Throws an error in production if DATABASE_URL is missing.
 */
function validateEnvironment(): void {
  const missingVars: string[] = [];

  if (!process.env.DATABASE_URL) {
    missingVars.push('DATABASE_URL');
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMessage);
    } else {
      console.warn(`⚠️  ${errorMessage}`);
      console.warn('Database features will be disabled. Set these variables in your .env file.');
    }
  }
}

// Run validation on module load
validateEnvironment();

/**
 * Ensure DATABASE_URL has SSL mode for Neon connections.
 * Neon requires SSL for all connections.
 */
function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    return undefined;
  }

  // If the URL already has sslmode parameter, return as-is
  if (url.includes('sslmode=')) {
    return url;
  }

  // Add sslmode=require for Neon connections
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}sslmode=require`;
}

/**
 * Typed configuration object for the backend.
 * All environment variables should be accessed through this object.
 */
export const envConfig = {
  /**
   * Database URL with SSL mode enabled for Neon connections.
   * Format: postgresql://user:password@host:port/database?sslmode=require
   */
  dbUrl: getDatabaseUrl(),

  /**
   * Server port. Defaults to 8080 for Fly.io compatibility.
   */
  port: parseInt(process.env.PORT ?? '8080', 10),

  /**
   * Node environment: 'development', 'production', or 'test'.
   */
  nodeEnv: (process.env.NODE_ENV ?? 'production') as 'development' | 'production' | 'test',

  /**
   * Whether running in production mode.
   */
  isProduction: process.env.NODE_ENV === 'production',

  /**
   * Whether running in development mode.
   */
  isDevelopment: process.env.NODE_ENV === 'development',

  /**
   * Whether running in test mode.
   */
  isTest: process.env.NODE_ENV === 'test',

  /**
   * API base URL for the backend.
   */
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:8080',

  /**
   * JWT secret for authentication.
   */
  jwtSecret: process.env.JWT_SECRET ?? 'development-jwt-secret-change-in-production',

  /**
   * JWT token expiration time.
   */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

  /**
   * CORS allowed origins (comma-separated).
   */
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:3000').split(',').map(s => s.trim()),
} as const;

export type EnvConfig = typeof envConfig;

export default envConfig;
