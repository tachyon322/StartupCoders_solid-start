import type { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
    // Only enable in development or with a secret query parameter
    const secret = new URL(event.request.url).searchParams.get('secret');
    if (process.env.NODE_ENV === 'production' && secret !== process.env.VITE_BETTER_AUTH_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    const debugInfo = {
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            VITE_BETTER_AUTH_URL: process.env.VITE_BETTER_AUTH_URL,
            BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
            hasGoogleClientId: !!process.env.VITE_GOOGLE_CLIENT_ID || !!process.env.GOOGLE_CLIENT_ID,
            hasGoogleClientSecret: !!process.env.VITE_GOOGLE_CLIENT_SECRET || !!process.env.GOOGLE_CLIENT_SECRET,
            hasAuthSecret: !!process.env.VITE_BETTER_AUTH_SECRET || !!process.env.BETTER_AUTH_SECRET,
        },
        request: {
            url: event.request.url,
            origin: new URL(event.request.url).origin,
            headers: {
                host: event.request.headers.get('host'),
                'x-forwarded-proto': event.request.headers.get('x-forwarded-proto'),
                'x-forwarded-host': event.request.headers.get('x-forwarded-host'),
            }
        },
        cookies: event.request.headers.get('cookie') || 'No cookies',
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}