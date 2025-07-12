"use server";

import { Pool } from 'pg';

// Define Tag interface to match the original import
export interface Tag {
  id?: number;
  name: string;
}

// Create a pool instance for database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Optimized function to find user by identifier (username or id)
// This is extracted to avoid code duplication and improve performance
async function findUserByIdentifier(identifier: string) {
  // Try to find the user by username first
  const userByUsernameResult = await pool.query(
    'SELECT id FROM "user" WHERE username = $1',
    [identifier]
  );

  if (userByUsernameResult.rows.length > 0) {
    return userByUsernameResult.rows[0];
  }

  // If not found by username, try by ID
  const userByIdResult = await pool.query(
    'SELECT id FROM "user" WHERE id = $1',
    [identifier]
  );

  if (userByIdResult.rows.length > 0) {
    return userByIdResult.rows[0];
  }

  return null;
}

// Optimized user query with proper data selection
export async function getUser(identifier: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    return null;
  }

  const userId = userInfo.id;

  // Get basic user data
  const userDataResult = await pool.query(
    'SELECT * FROM "user" WHERE id = $1',
    [userId]
  );

  if (userDataResult.rows.length === 0) return null;

  const userData = userDataResult.rows[0];

  // Get user tags
  const userTagsResult = await pool.query(
    `SELECT t.id, t.name 
     FROM tag_to_user ttu 
     JOIN tag t ON ttu."tagId" = t.id 
     WHERE ttu."userId" = $1`,
    [userId]
  );

  // Get created startups with tags and images
  const createdStartupsResult = await pool.query(
    `SELECT s.*, 
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
              FILTER (WHERE t.id IS NOT NULL), 
              '[]'::json
            ) as tags,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', i.id, 'url', i.url)) 
              FILTER (WHERE i.id IS NOT NULL), 
              '[]'::json
            ) as images
     FROM startup s
     LEFT JOIN tag_to_startup tts ON s.id = tts."startupId"
     LEFT JOIN tag t ON tts."tagId" = t.id
     LEFT JOIN images i ON s.id = i."startupId"
     WHERE s."creatorUser" = $1
     GROUP BY s.id`,
    [userId]
  );

  // Get participants for created startups
  const createdStartupIds = createdStartupsResult.rows.map(s => s.id);
  let createdStartupParticipants = [];
  
  if (createdStartupIds.length > 0) {
    const participantsResult = await pool.query(
      `SELECT sp."startupId", u.id, u.name, u.username, u.image
       FROM startup_participants sp
       JOIN "user" u ON sp."userId" = u.id
       WHERE sp."startupId" = ANY($1::text[])`,
      [createdStartupIds]
    );
    createdStartupParticipants = participantsResult.rows;
  }

  // Group participants by startup
  const participantsByStartup: Record<string, any[]> = {};
  createdStartupParticipants.forEach(p => {
    if (!participantsByStartup[p.startupId]) {
      participantsByStartup[p.startupId] = [];
    }
    participantsByStartup[p.startupId].push({
      id: p.id,
      name: p.name,
      username: p.username,
      image: p.image
    });
  });

  // Get participating startups (not created by user)
  const participatingStartupsResult = await pool.query(
    `SELECT s.*, 
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
              FILTER (WHERE t.id IS NOT NULL), 
              '[]'::json
            ) as tags,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', i.id, 'url', i.url)) 
              FILTER (WHERE i.id IS NOT NULL), 
              '[]'::json
            ) as images
     FROM startup_participants sp
     JOIN startup s ON sp."startupId" = s.id
     LEFT JOIN tag_to_startup tts ON s.id = tts."startupId"
     LEFT JOIN tag t ON tts."tagId" = t.id
     LEFT JOIN images i ON s.id = i."startupId"
     WHERE sp."userId" = $1 AND s."creatorUser" != $1
     GROUP BY s.id`,
    [userId]
  );

  // Get participants for participating startups
  const participatingStartupIds = participatingStartupsResult.rows.map(s => s.id);
  let participatingStartupParticipants = [];
  
  if (participatingStartupIds.length > 0) {
    const participantsResult = await pool.query(
      `SELECT sp."startupId", u.id, u.name, u.username, u.image
       FROM startup_participants sp
       JOIN "user" u ON sp."userId" = u.id
       WHERE sp."startupId" = ANY($1::text[])`,
      [participatingStartupIds]
    );
    participatingStartupParticipants = participantsResult.rows;
  }

  // Group participants by startup
  const participatingParticipantsByStartup: Record<string, any[]> = {};
  participatingStartupParticipants.forEach(p => {
    if (!participatingParticipantsByStartup[p.startupId]) {
      participatingParticipantsByStartup[p.startupId] = [];
    }
    participatingParticipantsByStartup[p.startupId].push({
      id: p.id,
      name: p.name,
      username: p.username,
      image: p.image
    });
  });

  // Get user's startup requests
  const userStartupRequestsResult = await pool.query(
    `SELECT sr.*, sru."userId"
     FROM startup_request_users sru
     JOIN startup_request sr ON sru."startupRequestId" = sr.id
     WHERE sru."userId" = $1`,
    [userId]
  );

  // Transform the data to match the expected structure
  const transformedUser = {
    ...userData,
    tags: userTagsResult.rows,
    createdStartups: createdStartupsResult.rows.map(startup => ({
      ...startup,
      tags: startup.tags,
      images: startup.images,
      participants: participantsByStartup[startup.id] || []
    })),
    participatingStartups: participatingStartupsResult.rows.map(startup => ({
      ...startup,
      tags: startup.tags,
      images: startup.images,
      participants: participatingParticipantsByStartup[startup.id] || []
    })),
    receivedStartupRequests: userStartupRequestsResult.rows.map(req => ({
      startupRequest: req,
      userId: req.userId
    }))
  };

  return transformedUser;
}

export async function getAllTags() {
  const result = await pool.query(
    'SELECT * FROM tag ORDER BY name ASC'
  );

  return result.rows;
}

export async function updateUserDescription(identifier: string, description: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  const result = await pool.query(
    'UPDATE "user" SET description = $1 WHERE id = $2 RETURNING *',
    [description, userInfo.id]
  );

  return result.rows[0];
}

export async function updateUserTags(identifier: string, tags: Tag[]) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  // Get existing user
  const userDataResult = await pool.query(
    'SELECT * FROM "user" WHERE id = $1',
    [userInfo.id]
  );

  if (userDataResult.rows.length === 0) {
    throw new Error("User not found");
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Separate existing tags from new tags
    const existingTagIds = tags
      .filter(tag => tag.id)
      .map(tag => tag.id as number);

    // For new tags, we'll need to check if they already exist in the database or create them
    const newTagNames = tags
      .filter(tag => !tag.id)
      .map(tag => tag.name);

    // First, delete all existing tag connections
    await client.query(
      'DELETE FROM tag_to_user WHERE "userId" = $1',
      [userInfo.id]
    );

    // Then connect existing tags by ID
    for (const tagId of existingTagIds) {
      await client.query(
        'INSERT INTO tag_to_user ("userId", "tagId") VALUES ($1, $2)',
        [userInfo.id, tagId]
      );
    }

    // For each new tag name, either find or create the tag and connect it to the user
    for (const tagName of newTagNames) {
      // First check if this tag already exists in the database
      let existingTagResult = await client.query(
        'SELECT * FROM tag WHERE name = $1',
        [tagName]
      );

      let tagId;
      if (existingTagResult.rows.length === 0) {
        // Find the maximum ID currently in use
        const maxIdResult = await client.query(
          'SELECT MAX(id) as max_id FROM tag'
        );

        const nextId = maxIdResult.rows[0].max_id ? maxIdResult.rows[0].max_id + 1 : 1;

        // Create the tag with the new ID
        const newTagResult = await client.query(
          'INSERT INTO tag (id, name) VALUES ($1, $2) RETURNING *',
          [nextId, tagName]
        );
        tagId = newTagResult.rows[0].id;
      } else {
        tagId = existingTagResult.rows[0].id;
      }

      // Connect this tag to the user
      await client.query(
        'INSERT INTO tag_to_user ("userId", "tagId") VALUES ($1, $2)',
        [userInfo.id, tagId]
      );
    }

    await client.query('COMMIT');

    // Get the updated user with all tags
    const finalUserResult = await pool.query(
      'SELECT * FROM "user" WHERE id = $1',
      [userInfo.id]
    );

    const userTagsResult = await pool.query(
      `SELECT t.id, t.name 
       FROM tag_to_user ttu 
       JOIN tag t ON ttu."tagId" = t.id 
       WHERE ttu."userId" = $1`,
      [userInfo.id]
    );

    // Transform the data to match the expected structure
    return {
      ...finalUserResult.rows[0],
      tags: userTagsResult.rows
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Optimized pagination function for user created startups
export async function getUserCreatedStartups(
  identifier: string,
  page = 1,
  pageSize = 9
) {
  // Calculate the skip value for pagination
  const skip = (page - 1) * pageSize;

  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  const userId = userInfo.id;

  // Get startups created by the user with pagination
  const startupsResult = await pool.query(
    `SELECT s.*, 
            u.id as creator_id, u.name as creator_name, u.username as creator_username, u.image as creator_image,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
              FILTER (WHERE t.id IS NOT NULL), 
              '[]'::json
            ) as tags,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', i.id, 'url', i.url)) 
              FILTER (WHERE i.id IS NOT NULL), 
              '[]'::json
            ) as images
     FROM startup s
     JOIN "user" u ON s."creatorUser" = u.id
     LEFT JOIN tag_to_startup tts ON s.id = tts."startupId"
     LEFT JOIN tag t ON tts."tagId" = t.id
     LEFT JOIN images i ON s.id = i."startupId"
     WHERE s."creatorUser" = $1
     GROUP BY s.id, u.id, u.name, u.username, u.image
     ORDER BY s."createdAt" DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, skip]
  );

  // Get participants for these startups
  const startupIds = startupsResult.rows.map(s => s.id);
  let participantsResult: { rows: any[] } = { rows: [] };
  
  if (startupIds.length > 0) {
    participantsResult = await pool.query(
      `SELECT sp."startupId", u.id, u.name, u.username, u.image
       FROM startup_participants sp
       JOIN "user" u ON sp."userId" = u.id
       WHERE sp."startupId" = ANY($1::text[])
       ORDER BY sp."startupId", u.name
       LIMIT 5`,
      [startupIds]
    );
  }

  // Group participants by startup
  const participantsByStartup: Record<string, any[]> = {};
  participantsResult.rows.forEach((p: any) => {
    if (!participantsByStartup[p.startupId]) {
      participantsByStartup[p.startupId] = [];
    }
    if (participantsByStartup[p.startupId].length < 5) {
      participantsByStartup[p.startupId].push({
        id: p.id,
        name: p.name,
        username: p.username,
        image: p.image
      });
    }
  });

  // Get the total count of startups for pagination
  const totalStartupsResult = await pool.query(
    'SELECT COUNT(*) as count FROM startup WHERE "creatorUser" = $1',
    [userId]
  );

  const totalStartups = parseInt(totalStartupsResult.rows[0].count);

  // Calculate total pages
  const totalPages = Math.ceil(totalStartups / pageSize);

  // Transform the data to match the expected structure
  const transformedStartups = startupsResult.rows.map(startup => ({
    ...startup,
    creatorId: {
      id: startup.creator_id,
      name: startup.creator_name,
      username: startup.creator_username,
      image: startup.creator_image
    },
    tags: startup.tags,
    images: startup.images,
    participants: participantsByStartup[startup.id] || []
  }));

  return {
    startups: transformedStartups,
    pagination: {
      totalItems: totalStartups,
      totalPages,
      currentPage: page,
      pageSize
    }
  };
}

// Optimized pagination function for user participating startups
export async function getUserParticipatingStartups(
  identifier: string,
  page = 1,
  pageSize = 9
) {
  // Calculate the skip value for pagination
  const skip = (page - 1) * pageSize;

  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  const userId = userInfo.id;

  // Get startups where the user is a participant but NOT the creator
  const startupsResult = await pool.query(
    `SELECT s.*, 
            u.id as creator_id, u.name as creator_name, u.username as creator_username, u.image as creator_image,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) 
              FILTER (WHERE t.id IS NOT NULL), 
              '[]'::json
            ) as tags,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', i.id, 'url', i.url)) 
              FILTER (WHERE i.id IS NOT NULL), 
              '[]'::json
            ) as images
     FROM startup s
     JOIN "user" u ON s."creatorUser" = u.id
     LEFT JOIN tag_to_startup tts ON s.id = tts."startupId"
     LEFT JOIN tag t ON tts."tagId" = t.id
     LEFT JOIN images i ON s.id = i."startupId"
     WHERE s."creatorUser" != $1 
       AND s.id IN (
         SELECT "startupId" 
         FROM startup_participants 
         WHERE "userId" = $1
       )
     GROUP BY s.id, u.id, u.name, u.username, u.image
     ORDER BY s."createdAt" DESC
     LIMIT $2 OFFSET $3`,
    [userId, pageSize, skip]
  );

  // Get participants for these startups
  const startupIds = startupsResult.rows.map(s => s.id);
  let participantsResult: { rows: any[] } = { rows: [] };
  
  if (startupIds.length > 0) {
    participantsResult = await pool.query(
      `SELECT sp."startupId", u.id, u.name, u.username, u.image
       FROM startup_participants sp
       JOIN "user" u ON sp."userId" = u.id
       WHERE sp."startupId" = ANY($1::text[])
       ORDER BY sp."startupId", u.name
       LIMIT 5`,
      [startupIds]
    );
  }

  // Group participants by startup
  const participantsByStartup: Record<string, any[]> = {};
  participantsResult.rows.forEach((p: any) => {
    if (!participantsByStartup[p.startupId]) {
      participantsByStartup[p.startupId] = [];
    }
    if (participantsByStartup[p.startupId].length < 5) {
      participantsByStartup[p.startupId].push({
        id: p.id,
        name: p.name,
        username: p.username,
        image: p.image
      });
    }
  });

  // Get the total count of startups for pagination
  const totalStartupsResult = await pool.query(
    `SELECT COUNT(*) as count 
     FROM startup_participants sp
     JOIN startup s ON sp."startupId" = s.id
     WHERE sp."userId" = $1 AND s."creatorUser" != $1`,
    [userId]
  );

  const totalStartups = parseInt(totalStartupsResult.rows[0].count);

  // Calculate total pages
  const totalPages = Math.ceil(totalStartups / pageSize);

  // Transform the data to match the expected structure
  const transformedStartups = startupsResult.rows.map(startup => ({
    ...startup,
    creatorId: {
      id: startup.creator_id,
      name: startup.creator_name,
      username: startup.creator_username,
      image: startup.creator_image
    },
    tags: startup.tags,
    images: startup.images,
    participants: participantsByStartup[startup.id] || []
  }));

  return {
    startups: transformedStartups,
    pagination: {
      totalItems: totalStartups,
      totalPages,
      currentPage: page,
      pageSize
    }
  };
}

/**
 * Get most active users based on startup participation and creation
 * This is used for static site generation
 */
export async function getMostActiveUsers(limit: number = 10) {
  // Complex query to get users with their startup counts
  const result = await pool.query(
    `WITH user_stats AS (
      SELECT 
        u.id,
        u.name,
        u.username,
        u.image,
        COUNT(DISTINCT s.id) as created_count,
        COUNT(DISTINCT sp."startupId") as participating_count
      FROM "user" u
      LEFT JOIN startup s ON u.id = s."creatorUser"
      LEFT JOIN startup_participants sp ON u.id = sp."userId"
      GROUP BY u.id, u.name, u.username, u.image
    )
    SELECT 
      id,
      name,
      username,
      image,
      created_count,
      participating_count
    FROM user_stats
    ORDER BY created_count DESC, participating_count DESC
    LIMIT $1`,
    [limit]
  );

  // Transform the data to match the expected structure
  const users = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    username: row.username,
    image: row.image,
    _count: {
      createdStartups: parseInt(row.created_count),
      participatingStartups: parseInt(row.participating_count)
    }
  }));

  return users;
}

export async function updateUserUsername(identifier: string, username: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  // Check if the new username is already taken
  const existingUserResult = await pool.query(
    'SELECT id FROM "user" WHERE username = $1',
    [username]
  );

  if (existingUserResult.rows.length > 0) {
    throw new Error("Username already taken");
  }

  // Update the username
  const result = await pool.query(
    'UPDATE "user" SET username = $1 WHERE id = $2 RETURNING id, username',
    [username, userInfo.id]
  );

  return result.rows[0];
}

export async function updateUserName(identifier: string, name: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  // Update the name
  const result = await pool.query(
    'UPDATE "user" SET name = $1 WHERE id = $2 RETURNING id, name',
    [name, userInfo.id]
  );

  return result.rows[0];
}

export async function updateUserImage(identifier: string, imageUrl: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  // Update the image URL
  const result = await pool.query(
    'UPDATE "user" SET image = $1 WHERE id = $2 RETURNING id, image',
    [imageUrl, userInfo.id]
  );
  
  return result.rows[0];
}