import { createAuthClient } from "better-auth/solid"
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000"
})