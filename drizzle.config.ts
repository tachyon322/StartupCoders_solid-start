import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();



export default defineConfig({
  out: './drizzle',
  schema: './auth-schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://solid_owner:npg_RhP68esAwWTC@ep-late-king-a2476826-pooler.eu-central-1.aws.neon.tech/solid?sslmode=require",
  },
});