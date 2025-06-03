import { APIEvent } from "@solidjs/start/server";
import { auth } from "~/lib/auth/auth";
import db from "~/lib/db";
import * as schema from "../../../../auth-schema";
import { eq, and } from "drizzle-orm";

export async function GET(event: APIEvent) {
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

    const userId = session.user.id;

    // Get all requests where the user is one of the requesters (outgoing)
    const outgoingRequests = await db
      .select({
        id: schema.startupRequest.id,
        message: schema.startupRequest.message,
        createdAt: schema.startupRequest.createdAt,
        status: schema.startupRequest.status,
      })
      .from(schema.startupRequest)
      .innerJoin(
        schema.userToStartupRequest,
        eq(schema.userToStartupRequest.startupRequestId, schema.startupRequest.id)
      )
      .where(eq(schema.userToStartupRequest.userId, userId));

    // Enhance outgoing requests with startup data
    const outgoingWithStartups = await Promise.all(
      outgoingRequests.map(async (request) => {
        // Get startup for this request
        const startupData = await db
          .select({
            id: schema.startup.id,
            name: schema.startup.name,
          })
          .from(schema.startup)
          .innerJoin(
            schema.startupToStartupRequest,
            eq(schema.startupToStartupRequest.startupId, schema.startup.id)
          )
          .where(eq(schema.startupToStartupRequest.startupRequestId, request.id))
          .limit(1);

        if (!startupData.length) return null;

        // Get tags and images for this startup
        const [startupTags, startupImages, creatorInfo] = await Promise.all([
          db
            .select({
              id: schema.tag.id,
              name: schema.tag.name,
            })
            .from(schema.tag)
            .innerJoin(
              schema.startupToTag,
              eq(schema.startupToTag.tagId, schema.tag.id)
            )
            .where(eq(schema.startupToTag.startupId, startupData[0].id)),
          
          db
            .select({
              id: schema.images.id,
              url: schema.images.url,
            })
            .from(schema.images)
            .where(eq(schema.images.startupId, startupData[0].id)),
            
          db
            .select({
              id: schema.user.id,
              name: schema.user.name,
              username: schema.user.username,
              image: schema.user.image,
            })
            .from(schema.user)
            .innerJoin(
              schema.startup,
              eq(schema.startup.creatorUser, schema.user.id)
            )
            .where(eq(schema.startup.id, startupData[0].id))
            .limit(1),
        ]);

        return {
          ...request,
          startup: {
            ...startupData[0],
            tags: startupTags,
            images: startupImages,
            creatorId: creatorInfo[0] || null,
          }
        };
      })
    );

    // Filter out any null results
    const validOutgoingRequests = outgoingWithStartups.filter(Boolean);

    // Get all startups created by the user with their pending requests (incoming)
    const createdStartups = await db
      .select({
        id: schema.startup.id,
        name: schema.startup.name,
        startupRequestId: schema.startup.startupRequestId,
      })
      .from(schema.startup)
      .where(eq(schema.startup.creatorUser, userId));

    // Process incoming requests (only pending ones)
    const incomingRequests = await Promise.all(
      createdStartups
        .filter(s => s.startupRequestId !== null)
        .map(async (s) => {
          if (!s.startupRequestId) return null;
          
          // Get request details (only pending requests)
          const requestData = await db
            .select({
              id: schema.startupRequest.id,
              message: schema.startupRequest.message,
              createdAt: schema.startupRequest.createdAt,
              status: schema.startupRequest.status,
            })
            .from(schema.startupRequest)
            .where(
              and(
                eq(schema.startupRequest.id, s.startupRequestId),
                eq(schema.startupRequest.status, 'pending')
              )
            )
            .limit(1);

          if (!requestData.length) return null;

          // Get requesting users
          const requestingUsers = await db
            .select({
              id: schema.user.id,
              name: schema.user.name,
              username: schema.user.username,
              image: schema.user.image,
            })
            .from(schema.user)
            .innerJoin(
              schema.userToStartupRequest,
              eq(schema.userToStartupRequest.userId, schema.user.id)
            )
            .where(eq(schema.userToStartupRequest.startupRequestId, s.startupRequestId));

          // Get tags and images for this startup
          const [startupTags, startupImages] = await Promise.all([
            db
              .select({
                id: schema.tag.id,
                name: schema.tag.name,
              })
              .from(schema.tag)
              .innerJoin(
                schema.startupToTag,
                eq(schema.startupToTag.tagId, schema.tag.id)
              )
              .where(eq(schema.startupToTag.startupId, s.id)),
            
            db
              .select({
                id: schema.images.id,
                url: schema.images.url,
              })
              .from(schema.images)
              .where(eq(schema.images.startupId, s.id)),
          ]);

          return {
            ...requestData[0],
            requestBy: requestingUsers,
            startup: {
              id: s.id,
              name: s.name,
              tags: startupTags,
              images: startupImages,
            }
          };
        })
    );

    // Filter out any null results
    const validIncomingRequests = incomingRequests.filter(Boolean);

    const result = {
      outgoing: validOutgoingRequests,
      incoming: validIncomingRequests
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error fetching requests:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch requests" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}