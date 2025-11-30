/**
 * AudiFi Database Client (Shared/Frontend Schema)
 * 
 * Configures and exports the Drizzle ORM database client.
 * Uses Neon (PostgreSQL) as the primary database provider.
 * 
 * IMPORTANT: This client is for the shared schema in /db.
 * The backend server has its own database client in /server/src/db.
 * 
 * Usage:
 *   import { db } from './db/client';
 *   const users = await db.select().from(schema.users);
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Get DATABASE_URL with SSL mode for Neon connections.
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

// Get connection string from environment
const connectionString = getDatabaseUrl();

if (!connectionString) {
  console.warn(`⚠️  DATABASE_URL not set. Database client will not function.
  
  To configure the Neon database:
  1. Create a database at https://neon.tech
  2. Copy the connection string from your Neon dashboard
  3. Set DATABASE_URL in your .env file
  `);
}

// Configure postgres connection
// Note: Connection is lazily established on first query
const sql = connectionString
  ? postgres(connectionString, {
      max: Number(process.env.DB_POOL_MAX || process.env.AUDIFI_DB_POOL_MAX) || 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : null;

// Create Drizzle client with schema
export const db = sql
  ? drizzle(sql, { schema })
  : null;

// Export schema for convenience
export { schema };

// Export raw SQL client for advanced queries
export { sql };

/**
 * Close database connections gracefully.
 * Call this when shutting down the application.
 */
export async function closeDatabase(): Promise<void> {
  if (sql) {
    await sql.end();
    console.log('Database connections closed.');
  }
}

/**
 * Check if database is connected and ready.
 */
export async function isDatabaseReady(): Promise<boolean> {
  if (!sql) {
    return false;
  }
  
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}
