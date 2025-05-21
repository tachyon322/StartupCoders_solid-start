import { createSignal, createResource } from "solid-js";
import db from "../lib/db";
import * as schema from "../../auth-schema";
import { eq, and, inArray, like, sql, desc, count } from "drizzle-orm";
import { authClient } from "../lib/auth/auth-client";
import { useSession } from "~/lib/auth/session-context";

// Type definition for the Tag input
export interface Tag {
  id?: number;
  name: string;
}

// Type definition for session data
interface SessionData {
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    [key: string]: any;
  };
  [key: string]: any;
}

// Function to get the current session
async function getSession(): Promise<{ user: SessionData['user'] } | null> {
  try {
    const sessionData = await authClient.getSession();
    if (!sessionData) return null;
    
    // Cast to any since the session structure might vary
    const anySession = sessionData as any;
    
    // Try to find user data in different possible locations in the response
    const userData = anySession.data?.user ||
                     anySession.user ||
                     anySession.data ||
                     {};
                   
    // Ensure we have a user ID
    if (!userData.id) return null;
    
    return {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email || "",
        image: userData.image,
        ...userData
      }
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Get all tags
export async function getTags() {
  const tags = await db.select({
    id: schema.tag.id,
    name: schema.tag.name
  }).from(schema.tag);
  
  return tags;
}

// Create a resource factory for startups
export function createStartupsResource() {
  const [params] = createSignal<[number, number, string | undefined, number[] | undefined]>([1, 10, undefined, undefined]);
  
  return createResource(() => params(), async ([page, pageSize, searchQuery, tagIds]) => {
    return await getStartups(page, pageSize, searchQuery, tagIds);
  });
}

// Get startups with filters and pagination
export async function getStartups(
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  tagIds?: number[]
) {
  // Calculate the skip value for pagination
  const skip = (page - 1) * pageSize;
  
  // Build the query
  // Execute the query with pagination and ordering
  const query = db.select({
    id: schema.startup.id,
    name: schema.startup.name,
    description: schema.startup.description,
    createdAt: schema.startup.createdAt,
    updatedAt: schema.startup.updatedAt,
  }).from(schema.startup);

  // Apply search filter if provided
  if (searchQuery) {
    query.where(like(schema.startup.name, `%${searchQuery}%`));
  }

  // Execute the query with pagination and ordering
  let startups = await query
  .limit(pageSize)
  .offset(skip)
  .orderBy(desc(schema.startup.createdAt));

  // Filter by tags if provided
  if (tagIds && tagIds.length > 0) {
    // Get all startups with these tags
    const startupsWithTags = await db.select({
      startupId: schema.startupToTag.startupId
    })
    .from(schema.startupToTag)
    .where(inArray(schema.startupToTag.tagId, tagIds));
    
    // Extract the startupIds
    const startupIdsWithTags: string[] = [];
    startupsWithTags.forEach(s => {
      startupIdsWithTags.push(s.startupId);
    });
    
    // Filter startups by the ones that have the required tags
    startups = startups.filter(s => startupIdsWithTags.includes(s.id));
  }

  // Get related data for each startup
  const startupResults = await Promise.all(startups.map(async (s) => {
    // Get tags for this startup
    const startupTags = await db
      .select({
        id: schema.tag.id,
        name: schema.tag.name,
      })
      .from(schema.tag)
      .innerJoin(
        schema.startupToTag, 
        eq(schema.startupToTag.tagId, schema.tag.id)
      )
      .where(eq(schema.startupToTag.startupId, s.id));

    // Get images for this startup
    const startupImages = await db
      .select({
        id: schema.images.id,
        url: schema.images.url,
      })
      .from(schema.images)
      .where(eq(schema.images.startupId, s.id));

    // Get creator info
    const creator = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        username: schema.user.username,
        image: schema.user.image,
      })
      .from(schema.user)
      .where(eq(schema.user.id, s.id))
      .limit(1);

    // Get participants
    const participants = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        username: schema.user.username,
        image: schema.user.image,
      })
      .from(schema.user)
      .innerJoin(
        schema.userToStartup, 
        eq(schema.userToStartup.userId, schema.user.id)
      )
      .where(eq(schema.userToStartup.startupId, s.id));

    return {
      ...s,
      tags: startupTags,
      images: startupImages,
      creatorId: creator[0] || null,
      participants,
    };
  }));

  // Count total startups for pagination with the same filters
  const countQuery = db.select({ value: count() }).from(schema.startup);
  
  if (searchQuery) {
    countQuery.where(like(schema.startup.name, `%${searchQuery}%`));
  }
  
  const totalResults = await countQuery;
  
  const totalStartups = totalResults[0]?.value || 0;
  
  // Calculate total pages
  const totalPages = Math.ceil(Number(totalStartups) / pageSize);

  return {
    startups: startupResults,
    pagination: {
      totalItems: Number(totalStartups),
      totalPages,
      currentPage: page,
      pageSize
    }
  };
}

export async function createStartup(
  name: string,
  description: string,
  tags: Tag[],
  uploadedImages: { id: string, url: string }[] = [],
  session: any
) {
  
  if (!session?.data?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.data.user.id;

  // Optimize tag handling - split into existing and new tags
  const existingTags = tags.filter(t => t.id).map(t => ({ id: t.id as number }));
  const newTagNames = Array.from(new Set(tags.filter(t => !t.id).map(t => t.name)));
  
  let allTagConnections = [...existingTags];
  
  if (newTagNames.length > 0) {
    // Check which of the new tag names already exist in the database
    const existingTagsByName = await db
      .select({
        id: schema.tag.id,
        name: schema.tag.name,
      })
      .from(schema.tag)
      .where(inArray(schema.tag.name, newTagNames));
    
    // Add existing tags found by name to connections
    const existingTagNameSet = new Set(existingTagsByName.map(t => t.name));
    allTagConnections.push(...existingTagsByName.map(t => ({ id: t.id })));
    
    // Create truly new tags
    const trulyNewTagNames = newTagNames.filter(name => !existingTagNameSet.has(name));
    
    if (trulyNewTagNames.length > 0) {
      // Get the highest tag ID for creating new sequential IDs
      const highestIdResult = await db
        .select({ id: schema.tag.id })
        .from(schema.tag)
        .orderBy(desc(schema.tag.id))
        .limit(1);
      
      let nextId = highestIdResult[0] ? highestIdResult[0].id + 1 : 1;
      
      // Create new tags
      for (const name of trulyNewTagNames) {
        const tagId = nextId++;
        const newTag = await db.insert(schema.tag).values({
          id: tagId,
          name
        }).returning({ id: schema.tag.id });
        
        allTagConnections.push({ id: newTag[0].id });
      }
    }
  }
  
  // Create the startup
  const [newStartup] = await db.insert(schema.startup).values({
    name,
    description,
    creatorUser: userId,
    updatedAt: new Date(),
  }).returning();
  
  if (!newStartup) throw new Error("Failed to create startup");
  
  // Connect tags
  if (allTagConnections.length > 0) {
    await Promise.all(allTagConnections.map(tagConnection =>
      db.insert(schema.startupToTag).values({
        startupId: newStartup.id,
        tagId: tagConnection.id
      })
    ));
  }
  
  // Connect creator as a participant
  await db.insert(schema.userToStartup).values({
    userId: userId,
    startupId: newStartup.id
  });
  
  // Add images
  if (uploadedImages.length > 0) {
    for (const image of uploadedImages) {
      await db.insert(schema.images).values({
        url: image.url,
        startupId: newStartup.id
      });
    }
  }
  
  // Get the complete startup data to return
  const startupWithRelations = await getStartupById(newStartup.id);
  
  return startupWithRelations;
}

// Get startup by ID
export async function getStartupById(startupId: string) {
  const startupData = await db
    .select({
      id: schema.startup.id,
      name: schema.startup.name,
      description: schema.startup.description,
      createdAt: schema.startup.createdAt,
      creatorUser: schema.startup.creatorUser,
    })
    .from(schema.startup)
    .where(eq(schema.startup.id, startupId))
    .limit(1);

  if (!startupData.length) {
    return null;
  }

  const foundStartup = startupData[0];

  // Get related data
  const [
    startupTags,
    startupImages,
    creator,
    participants
  ] = await Promise.all([
    // Get tags
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
      .where(eq(schema.startupToTag.startupId, startupId)),
    
    // Get images
    db
      .select({
        id: schema.images.id,
        url: schema.images.url,
      })
      .from(schema.images)
      .where(eq(schema.images.startupId, startupId)),
    
    // Get creator details
    db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        username: schema.user.username,
        image: schema.user.image,
        description: schema.user.description,
      })
      .from(schema.user)
      .where(eq(schema.user.id, foundStartup.creatorUser))
      .limit(1),
    
    // Get participants
    db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        username: schema.user.username,
        image: schema.user.image,
      })
      .from(schema.user)
      .innerJoin(
        schema.userToStartup, 
        eq(schema.userToStartup.userId, schema.user.id)
      )
      .where(eq(schema.userToStartup.startupId, startupId)),
  ]);

  return {
    ...foundStartup,
    tags: startupTags,
    images: startupImages,
    creatorId: creator[0] || null,
    participants,
  };
}

export async function requestToParticipate(startupId: string, message: string) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if startup exists
  const startupExists = await db
    .select({ id: schema.startup.id })
    .from(schema.startup)
    .where(eq(schema.startup.id, startupId))
    .limit(1);

  if (!startupExists.length) {
    throw new Error("Startup not found");
  }

  // Check if user is already a participant
  const existingParticipation = await db
    .select({ userId: schema.userToStartup.userId })
    .from(schema.userToStartup)
    .where(
      and(
        eq(schema.userToStartup.startupId, startupId),
        eq(schema.userToStartup.userId, session.user.id)
      )
    )
    .limit(1);

  if (existingParticipation.length > 0) {
    throw new Error("You are already a participant");
  }

  // Check if user already has a pending request
  const existingRequests = await db
    .select({ 
      requestId: schema.startupRequest.id 
    })
    .from(schema.startupRequest)
    .innerJoin(
      schema.userToStartupRequest,
      eq(schema.userToStartupRequest.startupRequestId, schema.startupRequest.id)
    )
    .innerJoin(
      schema.startupToStartupRequest,
      eq(schema.startupToStartupRequest.startupRequestId, schema.startupRequest.id)
    )
    .where(
      and(
        eq(schema.startupToStartupRequest.startupId, startupId),
        eq(schema.userToStartupRequest.userId, session.user.id)
      )
    );

  if (existingRequests.length > 0) {
    throw new Error("You already have a pending request");
  }

  // Create new request
  const [newRequest] = await db.insert(schema.startupRequest).values({
    message,
    updatedAt: new Date(),
  }).returning();
  
  if (!newRequest) throw new Error("Failed to create request");

  // Connect request to user and startup
  await Promise.all([
    db.insert(schema.userToStartupRequest).values({
      userId: session.user.id,
      startupRequestId: newRequest.id,
    }),
    db.insert(schema.startupToStartupRequest).values({
      startupId,
      startupRequestId: newRequest.id,
    }),
    // Update the startup with the reference to the request
    db.update(schema.startup)
      .set({ startupRequestId: newRequest.id })
      .where(eq(schema.startup.id, startupId))
  ]);

  return newRequest;
}

// Check if user has requested access
export async function hasRequestedAccess(startupId: string) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return false;
  }

  const existingRequest = await db
    .select({ id: schema.startupRequest.id })
    .from(schema.startupRequest)
    .innerJoin(
      schema.userToStartupRequest,
      eq(schema.userToStartupRequest.startupRequestId, schema.startupRequest.id)
    )
    .innerJoin(
      schema.startupToStartupRequest,
      eq(schema.startupToStartupRequest.startupRequestId, schema.startupRequest.id)
    )
    .where(
      and(
        eq(schema.startupToStartupRequest.startupId, startupId),
        eq(schema.userToStartupRequest.userId, session.user.id)
      )
    )
    .limit(1);

  return existingRequest.length > 0;
}

// Get user requests
export async function getUserRequests() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get all requests where the user is one of the requesters
  const outgoingRequests = await db
    .select({
      id: schema.startupRequest.id,
      message: schema.startupRequest.message,
      createdAt: schema.startupRequest.createdAt,
    })
    .from(schema.startupRequest)
    .innerJoin(
      schema.userToStartupRequest,
      eq(schema.userToStartupRequest.startupRequestId, schema.startupRequest.id)
    )
    .where(eq(schema.userToStartupRequest.userId, session.user.id));

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

  // Filter out any null results (shouldn't happen in normal flow)
  const validOutgoingRequests = outgoingWithStartups.filter(Boolean);

  // Get all startups created by the user with their requests
  const createdStartups = await db
    .select({
      id: schema.startup.id,
      name: schema.startup.name,
      startupRequestId: schema.startup.startupRequestId,
    })
    .from(schema.startup)
    .where(eq(schema.startup.creatorUser, session.user.id));

  // Process incoming requests
  const incomingRequests = await Promise.all(
    createdStartups
      .filter(s => s.startupRequestId !== null)
      .map(async (s) => {
        if (!s.startupRequestId) return null;
        
        // Get request details
        const requestData = await db
          .select({
            id: schema.startupRequest.id,
            message: schema.startupRequest.message,
            createdAt: schema.startupRequest.createdAt,
          })
          .from(schema.startupRequest)
          .where(eq(schema.startupRequest.id, s.startupRequestId))
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

  return {
    outgoing: validOutgoingRequests,
    incoming: validIncomingRequests
  };
}

export async function acceptRequest(requestId: string) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Convert requestId to number
  const requestIdNum = parseInt(requestId, 10);
  if (isNaN(requestIdNum)) {
    throw new Error("Invalid request ID");
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
    throw new Error("Request not found");
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
    throw new Error("No startup associated with this request");
  }

  const foundStartup = startupData[0];
  
  // Verify that the current user is the startup creator
  if (foundStartup.creatorUser !== session.user.id) {
    throw new Error("Only the startup creator can accept requests");
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

  // Delete request connections
  await Promise.all([
    db.delete(schema.userToStartupRequest)
      .where(eq(schema.userToStartupRequest.startupRequestId, requestIdNum)),
    db.delete(schema.startupToStartupRequest)
      .where(eq(schema.startupToStartupRequest.startupRequestId, requestIdNum)),
  ]);

  // Delete the request
  await db.delete(schema.startupRequest)
    .where(eq(schema.startupRequest.id, requestIdNum));
  
  // Update the startup to remove the request reference
  await db.update(schema.startup)
    .set({ startupRequestId: null })
    .where(eq(schema.startup.id, foundStartup.id));

  return true;
}

export async function rejectRequest(requestId: string) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Convert requestId to number
  const requestIdNum = parseInt(requestId, 10);
  if (isNaN(requestIdNum)) {
    throw new Error("Invalid request ID");
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
    throw new Error("Request not found");
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
    throw new Error("No startup associated with this request");
  }

  const foundStartup = startupData[0];
  
  // Verify that the current user is the startup creator
  if (foundStartup.creatorUser !== session.user.id) {
    throw new Error("Only the startup creator can reject requests");
  }

  // Delete request connections
  await Promise.all([
    db.delete(schema.userToStartupRequest)
      .where(eq(schema.userToStartupRequest.startupRequestId, requestIdNum)),
    db.delete(schema.startupToStartupRequest)
      .where(eq(schema.startupToStartupRequest.startupRequestId, requestIdNum)),
  ]);

  // Delete the request
  await db.delete(schema.startupRequest)
    .where(eq(schema.startupRequest.id, requestIdNum));
  
  // Update the startup to remove the request reference
  await db.update(schema.startup)
    .set({ startupRequestId: null })
    .where(eq(schema.startup.id, foundStartup.id));

  return true;
}