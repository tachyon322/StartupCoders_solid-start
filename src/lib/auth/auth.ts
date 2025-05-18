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
            clientId: "0v23limhARhAK6x7OuJP",
            clientSecret: "f6df00914fcf3a03ed592e09ea04fd95a2f5098",
        },
        google: {
            clientId: "694320788938-eq4crihrmckpj7i0qbh13g5q9h4vuc29.apps.googleusercontent.com",
            clientSecret: "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",
        }
    }
});
