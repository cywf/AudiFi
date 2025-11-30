import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit Configuration for AudiFi Backend
 * 
 * Uses DATABASE_URL from environment (Neon PostgreSQL).
 * Automatically adds sslmode=require for Neon connections.
 */

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL not set. Please configure your Neon database connection.');
  console.warn('   Set DATABASE_URL in your .env file or via Fly.io secrets.');
}

/**
 * Ensure DATABASE_URL has SSL mode for Neon connections.
 */
function getDatabaseUrlWithSsl(): string {
  if (!databaseUrl) {
    return '';
  }

  // If the URL already has sslmode parameter, return as-is
  if (databaseUrl.includes('sslmode=')) {
    return databaseUrl;
  }

  // Add sslmode=require for Neon connections
  const separator = databaseUrl.includes('?') ? '&' : '?';
  return `${databaseUrl}${separator}sslmode=require`;
}

export default defineConfig({
  schema: './src/db/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrlWithSsl(),
  },
  verbose: true,
  strict: true,
});
