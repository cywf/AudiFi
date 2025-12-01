/**
 * AudiFi Backend Configuration
 * Centralized configuration management with environment variable loading
 * 
 * Database connections use Neon (PostgreSQL) via DATABASE_URL.
 * See ./env.ts for environment variable validation.
 */

import { config } from 'dotenv';
import { z } from 'zod';
import { envConfig } from './env.js';

// Load environment variables
config();

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  API_BASE_URL: z.string().url().optional().default('http://localhost:3001'),

  // Database
  DATABASE_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32).optional().default('development-jwt-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Magic Link
  MAGIC_LINK_SECRET: z.string().optional(),
  MAGIC_LINK_EXPIRY_MINUTES: z.string().transform(Number).default('15'),

  // Email
  EMAIL_PROVIDER: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional().default('noreply@audifi.io'),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),

  // Blockchain RPC URLs
  ETH_MAINNET_RPC_URL: z.string().url().optional(),
  ETH_GOERLI_RPC_URL: z.string().url().optional(),
  ETH_SEPOLIA_RPC_URL: z.string().url().optional(),
  POLYGON_MAINNET_RPC_URL: z.string().url().optional(),
  POLYGON_MUMBAI_RPC_URL: z.string().url().optional(),
  BASE_MAINNET_RPC_URL: z.string().url().optional(),
  BASE_GOERLI_RPC_URL: z.string().url().optional(),

  // Contract Deployment
  DEPLOYER_PRIVATE_KEY: z.string().optional(),

  // IPFS
  IPFS_GATEWAY_URL: z.string().url().optional().default('https://gateway.pinata.cloud/ipfs'),
  PINATA_API_KEY: z.string().optional(),
  PINATA_SECRET_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_PRO: z.string().optional(),

  // External Integrations
  SEGMENT_WRITE_KEY: z.string().optional(),
  STREAM_API_KEY: z.string().optional(),
  STREAM_API_SECRET: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // CORS
  CORS_ALLOWED_ORIGINS: z.string().optional().default('http://localhost:5173,http://localhost:3000'),
});

type EnvConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Returns undefined values for optional fields that aren't set
 */
function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(result.error.format());
    // In development, continue with defaults; in production, throw
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration');
    }
    // Return defaults for development
    return envSchema.parse({});
  }
  
  return result.data;
}

const env = loadConfig();

/**
 * Application configuration object
 */
export const config_settings = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  server: {
    port: env.PORT,
    baseUrl: env.API_BASE_URL,
  },

  database: {
    url: envConfig.dbUrl,
  },

  auth: {
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
    magicLink: {
      secret: env.MAGIC_LINK_SECRET,
      expiryMinutes: env.MAGIC_LINK_EXPIRY_MINUTES,
    },
    oauth: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      microsoft: {
        clientId: env.MICROSOFT_CLIENT_ID,
        clientSecret: env.MICROSOFT_CLIENT_SECRET,
      },
    },
  },

  email: {
    provider: env.EMAIL_PROVIDER,
    sendgridApiKey: env.SENDGRID_API_KEY,
    from: env.EMAIL_FROM,
  },

  blockchain: {
    ethereum: {
      mainnet: env.ETH_MAINNET_RPC_URL,
      goerli: env.ETH_GOERLI_RPC_URL,
      sepolia: env.ETH_SEPOLIA_RPC_URL,
    },
    polygon: {
      mainnet: env.POLYGON_MAINNET_RPC_URL,
      mumbai: env.POLYGON_MUMBAI_RPC_URL,
    },
    base: {
      mainnet: env.BASE_MAINNET_RPC_URL,
      goerli: env.BASE_GOERLI_RPC_URL,
    },
    deployerPrivateKey: env.DEPLOYER_PRIVATE_KEY,
  },

  ipfs: {
    gatewayUrl: env.IPFS_GATEWAY_URL,
    pinata: {
      apiKey: env.PINATA_API_KEY,
      secretKey: env.PINATA_SECRET_KEY,
    },
  },

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    priceIdPro: env.STRIPE_PRICE_ID_PRO,
  },

  integrations: {
    segment: {
      writeKey: env.SEGMENT_WRITE_KEY,
    },
    stream: {
      apiKey: env.STREAM_API_KEY,
      apiSecret: env.STREAM_API_SECRET,
    },
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS.split(',').map((s: string) => s.trim()),
  },
} as const;

export type Config = typeof config_settings;

// Re-export envConfig for direct access to validated environment variables
export { envConfig } from './env.js';

export default config_settings;
