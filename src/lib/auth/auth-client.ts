import { createAuthClient } from "better-auth/solid"

// Determine the base URL based on the environment
const getBaseURL = () => {
    // If we're in the browser, use the current origin
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    
    // For SSR, check various environment variables
    if (import.meta.env.VITE_BETTER_AUTH_URL) {
        return import.meta.env.VITE_BETTER_AUTH_URL;
    }
    
    // Check if we're on Vercel
    if (import.meta.env.VITE_VERCEL_URL) {
        return `https://${import.meta.env.VITE_VERCEL_URL}`;
    }
    
    // Default based on environment
    if (import.meta.env.PROD) {
        return 'https://startupcoders.ru';
    }
    
    return 'http://localhost:3000';
};

export const authClient = createAuthClient({
    baseURL: getBaseURL()
})