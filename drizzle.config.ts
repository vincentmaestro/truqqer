import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/lib/db/migrations',
  schema: './src/lib/db/schemas',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  extensionsFilters: ['postgis'],
});
