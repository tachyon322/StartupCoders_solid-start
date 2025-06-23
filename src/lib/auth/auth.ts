import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "../db";
import * as schema from "../../../auth-schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    baseURL: process.env.BETTER_AUTH_URL || process.env.VITE_BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    logger: {
        level: "debug",
        disabled: false,
    },
    trustedOrigins: [
        "http://localhost:3000",
        "https://solid-test-mu.vercel.app",
        "https://startupcoders.ru",
        "https://www.startupcoders.ru",
    ]
});
