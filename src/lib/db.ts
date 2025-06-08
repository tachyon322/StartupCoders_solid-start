import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../auth-schema';

// Get database URL from environment
const getDatabaseUrl = () => {
    // Try process.env first (for server environments like Vercel)
    if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    // Fall back to import.meta.env for local development
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATABASE_URL) {
        return import.meta.env.VITE_DATABASE_URL as string;
    }
    
    // Fallback to hardcoded for development (not recommended for production)
    console.warn('No DATABASE_URL found in environment variables');
    return undefined;
};

// Initialize database connection
const initializeDatabase = () => {
    const databaseUrl = getDatabaseUrl();
    
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required but not found in environment variables');
    }
    
    try {
        // Create a connection pool
        const pool = new Pool({
            connectionString: databaseUrl,
            ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
        });
        
        return drizzle(pool, { schema });
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};

const db = initializeDatabase();

export default db;
