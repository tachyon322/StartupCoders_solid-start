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
    url: "postgresql://denis:123123@83.220.169.202:5432/solid_coders",
  },
});