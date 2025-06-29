import { APIEvent } from "@solidjs/start/server";
import { auth } from "~/lib/auth/auth";
import db from "~/lib/db";
import * as schema from "../../../../auth-schema";
import { eq } from "drizzle-orm";

export async function POST(event: APIEvent) {
  try {
    const session = await auth.api.getSession({
      headers: event.request.headers
    });
    
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await event.request.json();
    const { requestId } = body;

    if (!requestId) {
      return new Response(JSON.stringify({ error: "Request ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Convert requestId to number
    const requestIdNum = parseInt(requestId, 10);
    if (isNaN(requestIdNum)) {
      return new Response(JSON.stringify({ error: "Invalid request ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get the request with related startup
    const request = await db
      .select({
        id: schema.startupRequest.id,
      })
      .from(schema.startupRequest)
      .where(eq(schema.startupRequest.id, requestIdNum))
      .limit(1);

    if (!request.length) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Find startup associated with this request
    const startupData = await db
      .select({
        id: schema.startup.id,
        creatorUser: schema.startup.creatorUser,
      })
      .from(schema.startup)
      .innerJoin(
        schema.startupToStartupRequest,
        eq(schema.startupToStartupRequest.startupId, schema.startup.id)
      )
      .where(eq(schema.startupToStartupRequest.startupRequestId, requestIdNum))
      .limit(1);

    if (!startupData.length) {
      return new Response(JSON.stringify({ error: "No startup associated with this request" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const foundStartup = startupData[0];
    
    // Verify that the current user is the startup creator
    if (foundStartup.creatorUser !== session.user.id) {
      return new Response(JSON.stringify({ error: "Only the startup creator can accept requests" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get requesters from this request
    const requesters = await db
      .select({
        userId: schema.userToStartupRequest.userId,
      })
      .from(schema.userToStartupRequest)
      .where(eq(schema.userToStartupRequest.startupRequestId, requestIdNum));

    // Add all requesters to the startup participants
    if (requesters.length > 0) {
      await Promise.all(requesters.map(requester =>
        db.insert(schema.userToStartup).values({
          userId: requester.userId,
          startupId: foundStartup.id,
        })
      ));
    }

    // Update the request status to approved
    await db.update(schema.startupRequest)
      .set({
        status: 'approved',
        updatedAt: new Date(new Date().toISOString()) // Ensures UTC time
      })
      .where(eq(schema.startupRequest.id, requestIdNum));
    
    // Update the startup to remove the request reference since it's now processed
    await db.update(schema.startup)
      .set({ startupRequestId: null })
      .where(eq(schema.startup.id, foundStartup.id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error accepting request:", error);
    return new Response(JSON.stringify({ error: "Failed to accept request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}