import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db";
import * as schema from "../../../auth-schema";


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    socialProviders: {
        github: {
            clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || null,
            clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET || null,
        },
        google: {
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || null,
            clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || null,
        }
    },
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
        },
        generateId: false,
    },
    trustedOrigins: [
        "http://localhost:3000",
        "https://solid-test-mu.vercel.app"
    ]
});
