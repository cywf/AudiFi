/**
 * AudiFi Database Client
 * 
 * Configures and exports the Drizzle ORM database client.
 * 
 * Usage:
 *   import { db } from './db/client';
 *   const users = await db.select().from(schema.users);
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get connection string from environment
const connectionString = process.env.AUDIFI_DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️  AUDIFI_DATABASE_URL not set. Database client will not function.');
}

// Configure postgres connection
// Note: Connection is lazily established on first query
const sql = connectionString
  ? postgres(connectionString, {
      max: Number(process.env.AUDIFI_DB_POOL_MAX) || 10,
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
