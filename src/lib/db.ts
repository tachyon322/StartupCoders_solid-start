import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../auth-schema';

// Get database URL from environment
const getDatabaseUrl = () => {
    // Try process.env first (for server environments like Vercel)
    if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    // Fall back to import.meta.env for local development
    return import.meta.env.VITE_DATABASE_URL as string;
};

const db = drizzle(getDatabaseUrl(), { schema });

export default db;
