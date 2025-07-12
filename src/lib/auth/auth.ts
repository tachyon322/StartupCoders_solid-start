import { Pool } from 'pg'
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: [
        process.env.BETTER_AUTH_URL || "http://localhost:3000",
        "http://startupcoders.ru",
        "https://startupcoders.ru"
    ],
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
        },
        discord: {
            clientId: process.env.DISCORD_ID as string,
            clientSecret: process.env.DISCORD_SECRET as string,
        }
    },
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: false
            },
            description: {
                type: "string",
                required: false
            }
        }
    }
});