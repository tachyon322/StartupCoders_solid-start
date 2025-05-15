import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "./db";
import * as schema from "../../auth-schema";
 
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema,
    }),
    socialProviders: {
        github: {
            clientId: "Ov23liRBKFAn7zQVhWpx",
            clientSecret: "8fd3241f053be693f8ad5180ea267099a6de1c9f",
        }
    }
});