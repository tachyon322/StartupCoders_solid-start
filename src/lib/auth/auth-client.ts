import { createAuthClient } from "better-auth/solid"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: import.meta.env.VITE_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : undefined)
})