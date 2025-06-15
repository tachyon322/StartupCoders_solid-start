import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db";
import * as schema from "../../../auth-schema";

// Helper function to get environment variables that works both locally and on Vercel
function getEnvVar(key: string): string | undefined {
    // Try process.env first (for server environments like Vercel)
    if (typeof process !== 'undefined' && process.env[key]) {
        return process.env[key];
    }
    // Fall back to import.meta.env for local development
    return import.meta.env[`VITE_${key}`] as string | undefined;
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    baseURL: process.env.NODE_ENV === 'production'
        ? getEnvVar('BETTER_AUTH_URL') || "https://startupcoders.ru"
        : "http://localhost:3000",
    secret: getEnvVar('BETTER_AUTH_SECRET'),
    socialProviders: {
        github: {
            clientId: getEnvVar('GITHUB_CLIENT_ID') as string,
            clientSecret: getEnvVar('GITHUB_CLIENT_SECRET') as string,
        },
        google: {
            clientId: getEnvVar('GOOGLE_CLIENT_ID') as string,
            clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET') as string,
        }
    },
    trustedOrigins: [
        "http://localhost:3000",
        "https://solid-test-mu.vercel.app",
        "https://startupcoders.ru",      // without trailing slash
        "https://startupcoders.ru/",     // with trailing slash
        "http://83.220.169.202"          // your server IP
    ]
});
