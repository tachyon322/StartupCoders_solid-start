import { createAuthClient } from "better-auth/solid"

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BETTER_AUTH_URL || 'https://startupcoders.ru'
})