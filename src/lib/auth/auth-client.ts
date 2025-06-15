import { createAuthClient } from "better-auth/solid"

// Determine the base URL based on the environment
const getBaseURL = () => {
    // If we're in the browser, use the current origin
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    // For SSR, use the environment variable or default
    return import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000';
};

export const authClient = createAuthClient({
    baseURL: getBaseURL()
})