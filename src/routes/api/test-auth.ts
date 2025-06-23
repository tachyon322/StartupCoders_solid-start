import { json } from "@solidjs/router";
import { auth } from "~/lib/auth/auth";
import db from "~/lib/db";
import { user } from "../../../auth-schema";

export async function GET() {
    try {
        // Test database connection
        const users = await db.select().from(user).limit(1);
        
        // Test auth configuration
        const authConfig = {
            baseURL: auth.options.baseURL,
            hasGoogleProvider: !!auth.options.socialProviders?.google,
            googleClientId: auth.options.socialProviders?.google?.clientId ? 'configured' : 'missing',
        };
        
        return json({
            status: 'ok',
            database: 'connected',
            userCount: users.length,
            auth: authConfig,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test auth error:', error);
        return json({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}