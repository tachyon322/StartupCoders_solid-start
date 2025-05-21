import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';



export default defineConfig({
  out: './drizzle',
  schema: './auth-schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.VITE_DATABASE_URL as string,
  },
});