import { defineConfig } from 'drizzle-kit';

// Database URL from environment variable
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL not set. Please configure your database connection.');
}

export default defineConfig({
  schema: './src/db/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl || '',
  },
  verbose: true,
  strict: true,
});
