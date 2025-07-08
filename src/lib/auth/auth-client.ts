import { createAuthClient } from "better-auth/solid";
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    fetchOptions: {
        onError(context) {
            console.error("Auth client error:", context);
        },
        onRequest(context) {
            console.log("Auth client request:", context.url);
        },
        onResponse(context) {
            console.log("Auth client response:", context.response.status, context.response.url);
        }
    }
})