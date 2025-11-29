import { defineConfig } from 'drizzle-kit';

// Database URL must be provided via environment variable
// See .env.example for configuration
const databaseUrl = process.env.AUDIFI_DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️  AUDIFI_DATABASE_URL not set. Please configure your database connection.');
}

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl || '',
  },
  verbose: true,
  strict: true,
});
