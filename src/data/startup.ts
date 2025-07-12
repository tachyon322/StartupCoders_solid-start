"use server";
import { createSignal, createResource } from "solid-js";
import { Pool } from 'pg';
import { authClient } from "../lib/auth/auth-client";
import { invalidateCache } from "../lib/cache";

// Create a pool instance for database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
  const result = await pool.query(
    'SELECT id, name FROM tag ORDER BY name ASC'
  );
  
  return result.rows;
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
  
  // Build the query with conditional where clause
  let query = `
    SELECT
      s.id,
      s.name,
      s.description,
      s."createdAt" AT TIME ZONE 'UTC' AS "createdAt",
      s."updatedAt" AT TIME ZONE 'UTC' AS "updatedAt"
    FROM startup s
  `;
  
  const queryParams: any[] = [];
  let paramCount = 0;
  
  if (searchQuery) {
    query += ` WHERE LOWER(s.name) LIKE LOWER($${++paramCount})`;
    queryParams.push(`%${searchQuery}%`);
  }
  
  query += ` ORDER BY s."createdAt" DESC`;
  query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  queryParams.push(pageSize, skip);
  
  const startupsResult = await pool.query(query, queryParams);
  let startups = startupsResult.rows;

  // Filter by tags if provided
  if (tagIds && tagIds.length > 0) {
    // Get all startups with these tags
    const startupsWithTagsResult = await pool.query(
      `SELECT DISTINCT "startupId" 
       FROM tag_to_startup 
       WHERE "tagId" = ANY($1::int[])`,
      [tagIds]
    );
    
    // Extract the startupIds
    const startupIdsWithTags = startupsWithTagsResult.rows.map(s => s.startupId);
    
    // Filter startups by the ones that have the required tags
    startups = startups.filter(s => startupIdsWithTags.includes(s.id));
  }

  // Get related data for each startup
  const startupResults = await Promise.all(startups.map(async (s) => {
    // Get tags for this startup
    const startupTagsResult = await pool.query(
      `SELECT t.id, t.name
       FROM tag t
       INNER JOIN tag_to_startup tts ON tts."tagId" = t.id
       WHERE tts."startupId" = $1`,
      [s.id]
    );

    // Get images for this startup
    const startupImagesResult = await pool.query(
      `SELECT id, url
       FROM images
       WHERE "startupId" = $1`,
      [s.id]
    );

    // Get creator info
    const creatorResult = await pool.query(
      `SELECT u.id, u.name, u.username, u.image
       FROM "user" u
       INNER JOIN startup s ON s."creatorUser" = u.id
       WHERE s.id = $1
       LIMIT 1`,
      [s.id]
    );

    // Get participants
    const participantsResult = await pool.query(
      `SELECT u.id, u.name, u.username, u.image
       FROM "user" u
       INNER JOIN startup_participants sp ON sp."userId" = u.id
       WHERE sp."startupId" = $1`,
      [s.id]
    );

    return {
      ...s,
      tags: startupTagsResult.rows,
      images: startupImagesResult.rows,
      creatorId: creatorResult.rows[0] || null,
      participants: participantsResult.rows,
    };
  }));

  // Count total startups for pagination with the same filters
  let countQuery = 'SELECT COUNT(*) as count FROM startup';
  const countParams: any[] = [];
  
  if (searchQuery) {
    countQuery += ' WHERE LOWER(name) LIKE LOWER($1)';
    countParams.push(`%${searchQuery}%`);
  }
  
  const totalResult = await pool.query(countQuery, countParams);
  const totalStartups = parseInt(totalResult.rows[0].count);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalStartups / pageSize);

  return {
    startups: startupResults,
    pagination: {
      totalItems: totalStartups,
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
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Optimize tag handling - split into existing and new tags
    const existingTags = tags.filter(t => t.id).map(t => ({ id: t.id as number }));
    const newTagNames = Array.from(new Set(tags.filter(t => !t.id).map(t => t.name)));
    
    let allTagConnections = [...existingTags];
    
    if (newTagNames.length > 0) {
      // Check which of the new tag names already exist in the database
      const existingTagsByNameResult = await client.query(
        'SELECT id, name FROM tag WHERE name = ANY($1::text[])',
        [newTagNames]
      );
      
      // Add existing tags found by name to connections
      const existingTagNameSet = new Set(existingTagsByNameResult.rows.map(t => t.name));
      allTagConnections.push(...existingTagsByNameResult.rows.map(t => ({ id: t.id })));
      
      // Create truly new tags
      const trulyNewTagNames = newTagNames.filter(name => !existingTagNameSet.has(name));
      
      if (trulyNewTagNames.length > 0) {
        // Get the highest tag ID for creating new sequential IDs
        const highestIdResult = await client.query(
          'SELECT MAX(id) as max_id FROM tag'
        );
        
        let nextId = highestIdResult.rows[0].max_id ? highestIdResult.rows[0].max_id + 1 : 1;
        
        // Create new tags
        for (const tagName of trulyNewTagNames) {
          const tagId = nextId++;
          const newTagResult = await client.query(
            'INSERT INTO tag (id, name) VALUES ($1, $2) RETURNING id',
            [tagId, tagName]
          );
          
          allTagConnections.push({ id: newTagResult.rows[0].id });
        }
      }
    }
    
    // Create the startup
    const newStartupResult = await client.query(
      `INSERT INTO startup (name, description, "creatorUser", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [name, description, userId]
    );
    
    const newStartup = newStartupResult.rows[0];
    if (!newStartup) throw new Error("Failed to create startup");
    
    // Connect tags
    if (allTagConnections.length > 0) {
      for (const tagConnection of allTagConnections) {
        await client.query(
          'INSERT INTO tag_to_startup ("startupId", "tagId") VALUES ($1, $2)',
          [newStartup.id, tagConnection.id]
        );
      }
    }
    
    // Connect creator as a participant
    await client.query(
      'INSERT INTO startup_participants ("userId", "startupId") VALUES ($1, $2)',
      [userId, newStartup.id]
    );
    
    // Add images
    if (uploadedImages.length > 0) {
      for (const image of uploadedImages) {
        await client.query(
          'INSERT INTO images (url, "startupId") VALUES ($1, $2)',
          [image.url, newStartup.id]
        );
      }
    }

    await client.query('COMMIT');
    
    // Get the complete startup data to return
    const startupWithRelations = await getStartupById(newStartup.id);
    
    // Invalidate cache after creating a new startup
    // This will clear all startup lists and tags cache
    invalidateCache.startupLists();
    invalidateCache.tags();
    
    return startupWithRelations;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Get startup by ID
export async function getStartupById(startupId: string) {
  const startupResult = await pool.query(
    `SELECT id, name, description, "createdAt" AT TIME ZONE 'UTC' AS "createdAt", "creatorUser"
     FROM startup
     WHERE id = $1
     LIMIT 1`,
    [startupId]
  );

  if (!startupResult.rows.length) {
    return null;
  }

  const foundStartup = startupResult.rows[0];

  // Get related data
  const [
    startupTagsResult,
    startupImagesResult,
    creatorResult,
    participantsResult
  ] = await Promise.all([
    // Get tags
    pool.query(
      `SELECT t.id, t.name
       FROM tag t
       INNER JOIN tag_to_startup tts ON tts."tagId" = t.id
       WHERE tts."startupId" = $1`,
      [startupId]
    ),
    
    // Get images
    pool.query(
      `SELECT id, url
       FROM images
       WHERE "startupId" = $1`,
      [startupId]
    ),
    
    // Get creator details
    pool.query(
      `SELECT id, name, username, image, description
       FROM "user"
       WHERE id = $1
       LIMIT 1`,
      [foundStartup.creatorUser]
    ),
    
    // Get participants
    pool.query(
      `SELECT u.id, u.name, u.username, u.image
       FROM "user" u
       INNER JOIN startup_participants sp ON sp."userId" = u.id
       WHERE sp."startupId" = $1`,
      [startupId]
    ),
  ]);

  return {
    ...foundStartup,
    tags: startupTagsResult.rows,
    images: startupImagesResult.rows,
    creatorId: creatorResult.rows[0] || null,
    participants: participantsResult.rows,
  };
}

export async function requestToParticipate(startupId: string, message: string, session: any) {
  // Extract user data from session similar to getSession function
  const userData = session?.data?.user || session?.user || session?.data || {};
  
  if (!userData?.id) {
    throw new Error("Unauthorized");
  }

  const userId = userData.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if startup exists
    const startupExistsResult = await client.query(
      'SELECT id FROM startup WHERE id = $1 LIMIT 1',
      [startupId]
    );

    if (!startupExistsResult.rows.length) {
      throw new Error("Startup not found");
    }

    // Check if user is already a participant
    const existingParticipationResult = await client.query(
      `SELECT "userId" FROM startup_participants 
       WHERE "startupId" = $1 AND "userId" = $2 
       LIMIT 1`,
      [startupId, userId]
    );

    if (existingParticipationResult.rows.length > 0) {
      throw new Error("You are already a participant");
    }

    // Check if user already has a pending request
    const existingRequestsResult = await client.query(
      `SELECT sr.id 
       FROM startup_request sr
       INNER JOIN startup_request_users sru ON sru."startupRequestId" = sr.id
       INNER JOIN startup_request_startups srs ON srs."startupRequestId" = sr.id
       WHERE srs."startupId" = $1 AND sru."userId" = $2`,
      [startupId, userId]
    );

    if (existingRequestsResult.rows.length > 0) {
      throw new Error("You already have a pending request");
    }

    // Create new request
    const newRequestResult = await client.query(
      `INSERT INTO startup_request (message, "createdAt", "updatedAt")
       VALUES ($1, NOW(), NOW())
       RETURNING *`,
      [message]
    );
    
    const newRequest = newRequestResult.rows[0];
    if (!newRequest) throw new Error("Failed to create request");

    // Connect request to user and startup
    await Promise.all([
      client.query(
        'INSERT INTO startup_request_users ("userId", "startupRequestId") VALUES ($1, $2)',
        [userId, newRequest.id]
      ),
      client.query(
        'INSERT INTO startup_request_startups ("startupId", "startupRequestId") VALUES ($1, $2)',
        [startupId, newRequest.id]
      ),
      // Update the startup with the reference to the request
      client.query(
        'UPDATE startup SET "startupRequestId" = $1 WHERE id = $2',
        [newRequest.id, startupId]
      )
    ]);

    await client.query('COMMIT');
    return newRequest;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Check if user has requested access
export async function hasRequestedAccess(session: any, startupId: string) {
  // Extract user data from session similar to getSession function
  const userData = session?.data?.user || session?.user || session?.data || {};
  
  if (!userData?.id || !startupId) {
    return false;
  }

  try {
    // Check if user has a pending request for this startup
    const existingRequestsResult = await pool.query(
      `SELECT sr.id
       FROM startup_request sr
       INNER JOIN startup_request_users sru ON sru."startupRequestId" = sr.id
       INNER JOIN startup_request_startups srs ON srs."startupRequestId" = sr.id
       WHERE srs."startupId" = $1 AND sru."userId" = $2`,
      [startupId, userData.id]
    );

    return existingRequestsResult.rows.length > 0;
  } catch (error) {
    console.error("Error checking requested access:", error);
    return false;
  }
}

// Get user requests
export async function getUserRequests() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get all requests where the user is one of the requesters
  const outgoingRequestsResult = await pool.query(
    `SELECT sr.id, sr.message, sr."createdAt" AT TIME ZONE 'UTC' AS "createdAt"
     FROM startup_request sr
     INNER JOIN startup_request_users sru ON sru."startupRequestId" = sr.id
     WHERE sru."userId" = $1`,
    [session.user.id]
  );

  // Enhance outgoing requests with startup data
  const outgoingWithStartups = await Promise.all(
    outgoingRequestsResult.rows.map(async (request) => {
      // Get startup for this request
      const startupDataResult = await pool.query(
        `SELECT s.id, s.name
         FROM startup s
         INNER JOIN startup_request_startups srs ON srs."startupId" = s.id
         WHERE srs."startupRequestId" = $1
         LIMIT 1`,
        [request.id]
      );

      if (!startupDataResult.rows.length) return null;

      // Get tags and images for this startup
      const [startupTagsResult, startupImagesResult, creatorInfoResult] = await Promise.all([
        pool.query(
          `SELECT t.id, t.name
           FROM tag t
           INNER JOIN tag_to_startup tts ON tts."tagId" = t.id
           WHERE tts."startupId" = $1`,
          [startupDataResult.rows[0].id]
        ),
        
        pool.query(
          `SELECT id, url
           FROM images
           WHERE "startupId" = $1`,
          [startupDataResult.rows[0].id]
        ),
          
        pool.query(
          `SELECT u.id, u.name, u.username, u.image
           FROM "user" u
           INNER JOIN startup s ON s."creatorUser" = u.id
           WHERE s.id = $1
           LIMIT 1`,
          [startupDataResult.rows[0].id]
        ),
      ]);

      return {
        ...request,
        startup: {
          ...startupDataResult.rows[0],
          tags: startupTagsResult.rows,
          images: startupImagesResult.rows,
          creatorId: creatorInfoResult.rows[0] || null,
        }
      };
    })
  );

  // Filter out any null results (shouldn't happen in normal flow)
  const validOutgoingRequests = outgoingWithStartups.filter(Boolean);

  // Get all startups created by the user with their requests
  const createdStartupsResult = await pool.query(
    `SELECT id, name, "startupRequestId"
     FROM startup
     WHERE "creatorUser" = $1`,
    [session.user.id]
  );

  // Process incoming requests
  const incomingRequests = await Promise.all(
    createdStartupsResult.rows
      .filter(s => s.startupRequestId !== null)
      .map(async (s) => {
        if (!s.startupRequestId) return null;
        
        // Get request details
        const requestDataResult = await pool.query(
          `SELECT id, message, "createdAt" AT TIME ZONE 'UTC' AS "createdAt"
           FROM startup_request
           WHERE id = $1
           LIMIT 1`,
          [s.startupRequestId]
        );

        if (!requestDataResult.rows.length) return null;

        // Get requesting users
        const requestingUsersResult = await pool.query(
          `SELECT u.id, u.name, u.username, u.image
           FROM "user" u
           INNER JOIN startup_request_users sru ON sru."userId" = u.id
           WHERE sru."startupRequestId" = $1`,
          [s.startupRequestId]
        );

        // Get tags and images for this startup
        const [startupTagsResult, startupImagesResult] = await Promise.all([
          pool.query(
            `SELECT t.id, t.name
             FROM tag t
             INNER JOIN tag_to_startup tts ON tts."tagId" = t.id
             WHERE tts."startupId" = $1`,
            [s.id]
          ),
          
          pool.query(
            `SELECT id, url
             FROM images
             WHERE "startupId" = $1`,
            [s.id]
          ),
        ]);

        return {
          ...requestDataResult.rows[0],
          requestBy: requestingUsersResult.rows,
          startup: {
            id: s.id,
            name: s.name,
            tags: startupTagsResult.rows,
            images: startupImagesResult.rows,
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

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get the request with related startup
    const requestResult = await client.query(
      'SELECT id FROM startup_request WHERE id = $1 LIMIT 1',
      [requestIdNum]
    );

    if (!requestResult.rows.length) {
      throw new Error("Request not found");
    }

    // Find startup associated with this request
    const startupDataResult = await client.query(
      `SELECT s.id, s."creatorUser"
       FROM startup s
       INNER JOIN startup_request_startups srs ON srs."startupId" = s.id
       WHERE srs."startupRequestId" = $1
       LIMIT 1`,
      [requestIdNum]
    );

    if (!startupDataResult.rows.length) {
      throw new Error("No startup associated with this request");
    }

    const foundStartup = startupDataResult.rows[0];
    
    // Verify that the current user is the startup creator
    if (foundStartup.creatorUser !== session.user.id) {
      throw new Error("Only the startup creator can accept requests");
    }

    // Get requesters from this request
    const requestersResult = await client.query(
      `SELECT "userId"
       FROM startup_request_users
       WHERE "startupRequestId" = $1`,
      [requestIdNum]
    );

    // Add all requesters to the startup participants
    if (requestersResult.rows.length > 0) {
      for (const requester of requestersResult.rows) {
        await client.query(
          'INSERT INTO startup_participants ("userId", "startupId") VALUES ($1, $2)',
          [requester.userId, foundStartup.id]
        );
      }
    }

    // Delete request connections
    await Promise.all([
      client.query(
        'DELETE FROM startup_request_users WHERE "startupRequestId" = $1',
        [requestIdNum]
      ),
      client.query(
        'DELETE FROM startup_request_startups WHERE "startupRequestId" = $1',
        [requestIdNum]
      ),
    ]);

    // Delete the request
    await client.query(
      'DELETE FROM startup_request WHERE id = $1',
      [requestIdNum]
    );
    
    // Update the startup to remove the request reference
    await client.query(
      'UPDATE startup SET "startupRequestId" = NULL WHERE id = $1',
      [foundStartup.id]
    );

    await client.query('COMMIT');

    // Invalidate cache after accepting request (participants changed)
    invalidateCache.startupRelated(foundStartup.id);
    invalidateCache.userProfile(session.user.id);
    
    // Also invalidate profiles of new participants
    if (requestersResult.rows.length > 0) {
      requestersResult.rows.forEach(requester => {
        invalidateCache.userProfile(requester.userId);
      });
    }

    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get the request with related startup
    const requestResult = await client.query(
      'SELECT id FROM startup_request WHERE id = $1 LIMIT 1',
      [requestIdNum]
    );

    if (!requestResult.rows.length) {
      throw new Error("Request not found");
    }

    // Find startup associated with this request
    const startupDataResult = await client.query(
      `SELECT s.id, s."creatorUser"
       FROM startup s
       INNER JOIN startup_request_startups srs ON srs."startupId" = s.id
       WHERE srs."startupRequestId" = $1
       LIMIT 1`,
      [requestIdNum]
    );

    if (!startupDataResult.rows.length) {
      throw new Error("No startup associated with this request");
    }

    const foundStartup = startupDataResult.rows[0];
    
    // Verify that the current user is the startup creator
    if (foundStartup.creatorUser !== session.user.id) {
      throw new Error("Only the startup creator can reject requests");
    }

    // Delete request connections
    await Promise.all([
      client.query(
        'DELETE FROM startup_request_users WHERE "startupRequestId" = $1',
        [requestIdNum]
      ),
      client.query(
        'DELETE FROM startup_request_startups WHERE "startupRequestId" = $1',
        [requestIdNum]
      ),
    ]);

    // Delete the request
    await client.query(
      'DELETE FROM startup_request WHERE id = $1',
      [requestIdNum]
    );
    
    // Update the startup to remove the request reference
    await client.query(
      'UPDATE startup SET "startupRequestId" = NULL WHERE id = $1',
      [foundStartup.id]
    );

    await client.query('COMMIT');

    // Invalidate cache after rejecting request
    invalidateCache.startupRelated(foundStartup.id);

    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Client-side wrapper for requestToParticipate
export async function requestToParticipateClient(startupId: string, message: string) {
  "use client";
  
  try {
    const response = await fetch('/api/startup/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startupId, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send request');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}