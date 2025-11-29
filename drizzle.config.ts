import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.AUDIFI_DATABASE_URL || 'postgresql://audifi:audifi_dev_password@localhost:5432/audifi_dev',
  },
  verbose: true,
  strict: true,
});
