import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit Configuration for AudiFi (Root/Shared Schema)
 * 
 * This config is for the shared database schema in /db.
 * Uses DATABASE_URL from environment (Neon PostgreSQL).
 * Automatically adds sslmode=require for Neon connections.
 * 
 * Note: The backend has its own drizzle.config.ts in /server.
 */

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL not set. Please configure your Neon database connection.');
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
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrlWithSsl(),
  },
  verbose: true,
  strict: true,
});
