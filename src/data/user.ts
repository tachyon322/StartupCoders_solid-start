"use server";

import db from "../lib/db";
import { eq, desc, asc, and, not, sql, inArray } from "drizzle-orm";
import {
  user,
  tag,
  userToTag,
  startup,
  userToStartup,
  startupToTag,
  images,
  userToStartupRequest
} from "../../auth-schema";

// Define Tag interface to match the original import
export interface Tag {
  id?: number;
  name: string;
}

// Base selection objects to maintain consistency and avoid overfetching
const baseUserSelect = {
  id: user.id,
  name: user.name,
  username: user.username,
  image: user.image
};

const baseTagSelect = {
  id: tag.id,
  name: tag.name
};

const baseImageSelect = {
  id: images.id,
  url: images.url
};

// Optimized function to find user by identifier (username or id)
// This is extracted to avoid code duplication and improve performance
async function findUserByIdentifier(identifier: string) {
  // Try to find the user by username first
  let userInfo = await db.query.user.findFirst({
    where: eq(user.username, identifier),
    columns: { id: true }
  });

  // If not found by username, try by ID
  if (!userInfo) {
    userInfo = await db.query.user.findFirst({
      where: eq(user.id, identifier),
      columns: { id: true }
    });

    if (!userInfo) {
      return null;
    }
  }

  return userInfo;
}

// Optimized user query with proper data selection
export async function getUser(identifier: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    return null;
  }

  const userId = userInfo.id;

  // Get basic user data
  const userData = await db.query.user.findFirst({
    where: eq(user.id, userId)
  });

  if (!userData) return null;

  // Get user tags
  const userTags = await db.query.userToTag.findMany({
    where: eq(userToTag.userId, userId),
    with: {
      tag: true
    }
  });

  // Get created startups
  const createdStartups = await db.query.startup.findMany({
    where: eq(startup.creatorUser, userId),
    with: {
      tags: {
        with: {
          tag: true
        }
      },
      images: {
        limit: 1
      }
    }
  });

  // Get startup participants for created startups
  const createdStartupIds = createdStartups.map(s => s.id);
  const createdStartupParticipants = await db.query.userToStartup.findMany({
    where: inArray(userToStartup.startupId, createdStartupIds),
    with: {
      user: true
    }
  });

  // Group participants by startup
  const participantsByStartup: Record<string, any[]> = {};
  createdStartupParticipants.forEach(p => {
    if (!participantsByStartup[p.startupId]) {
      participantsByStartup[p.startupId] = [];
    }
    participantsByStartup[p.startupId].push(p.user);
  });

  // Get participating startups (not created by user)
  const participatingStartupIds = await db.query.userToStartup.findMany({
    where: eq(userToStartup.userId, userId),
    columns: {
      startupId: true
    }
  });

  const participatingStartups = await db.query.startup.findMany({
    where: and(
      not(eq(startup.creatorUser, userId)),
      inArray(startup.id, participatingStartupIds.map(p => p.startupId))
    ),
    with: {
      tags: {
        with: {
          tag: true
        }
      },
      images: {
        limit: 1
      }
    }
  });

  // Get participants for participating startups
  const participatingStartupParticipants = await db.query.userToStartup.findMany({
    where: inArray(userToStartup.startupId, participatingStartups.map(s => s.id)),
    with: {
      user: true
    }
  });

  // Group participants by startup
  const participatingParticipantsByStartup: Record<string, any[]> = {};
  participatingStartupParticipants.forEach(p => {
    if (!participatingParticipantsByStartup[p.startupId]) {
      participatingParticipantsByStartup[p.startupId] = [];
    }
    participatingParticipantsByStartup[p.startupId].push(p.user);
  });

  // Get user's startup requests
  const userStartupRequests = await db.query.userToStartupRequest.findMany({
    where: eq(userToStartupRequest.userId, userId),
    with: {
      startupRequest: true
    }
  });

  // Transform the data to match the expected structure
  const transformedUser = {
    ...userData,
    tags: userTags.map(t => t.tag),
    createdStartups: createdStartups.map(startup => ({
      ...startup,
      tags: startup.tags.map(t => t.tag),
      participants: participantsByStartup[startup.id] || []
    })),
    participatingStartups: participatingStartups.map(startup => ({
      ...startup,
      tags: startup.tags.map(t => t.tag),
      participants: participatingParticipantsByStartup[startup.id] || []
    })),
    receivedStartupRequests: userStartupRequests
  };

  return transformedUser;
}

export async function getAllTags() {
  const tags = await db.query.tag.findMany({
    orderBy: asc(tag.name)
  });

  return tags;
}

export async function updateUserDescription(identifier: string, description: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  const [updatedUser] = await db
    .update(user)
    .set({ description })
    .where(eq(user.id, userInfo.id))
    .returning();

  return updatedUser;
}

export async function updateUserTags(identifier: string, tags: Tag[]) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  // Get existing user
  const userData = await db.query.user.findFirst({
    where: eq(user.id, userInfo.id),
    with: {
      tags: {
        with: {
          tag: true
        }
      }
    }
  });

  if (!userData) {
    throw new Error("User not found");
  }

  // Separate existing tags from new tags
  const existingTagIds = tags
    .filter(tag => tag.id)
    .map(tag => tag.id as number);

  // For new tags, we'll need to check if they already exist in the database or create them
  const newTagNames = tags
    .filter(tag => !tag.id)
    .map(tag => tag.name);

  // First, delete all existing tag connections
  await db
    .delete(userToTag)
    .where(eq(userToTag.userId, userInfo.id));

  // Then connect existing tags by ID
  for (const tagId of existingTagIds) {
    await db
      .insert(userToTag)
      .values({
        userId: userInfo.id,
        tagId
      });
  }

  // For each new tag name, either find or create the tag and connect it to the user
  for (const tagName of newTagNames) {
    // First check if this tag already exists in the database
    let existingTag = await db.query.tag.findFirst({
      where: eq(tag.name, tagName)
    });

    if (!existingTag) {
      // Find the maximum ID currently in use
      const maxIdResult = await db.query.tag.findFirst({
        orderBy: desc(tag.id)
      });

      const nextId = maxIdResult ? maxIdResult.id + 1 : 1;

      // Create the tag with the new ID
      [existingTag] = await db
        .insert(tag)
        .values({
          id: nextId,
          name: tagName
        })
        .returning();
    }

    // Connect this tag to the user
    await db
      .insert(userToTag)
      .values({
        userId: userInfo.id,
        tagId: existingTag.id
      });
  }

  // Get the updated user with all tags
  const finalUser = await db.query.user.findFirst({
    where: eq(user.id, userInfo.id),
    with: {
      tags: {
        with: {
          tag: true
        }
      }
    }
  });

  // Transform the data to match the expected structure
  return {
    ...finalUser,
    tags: finalUser?.tags.map(t => t.tag) || []
  };
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

  // Get startups created by the user
  const startups = await db.query.startup.findMany({
    where: eq(startup.creatorUser, userId),
    limit: pageSize,
    offset: skip,
    orderBy: desc(startup.createdAt),
    with: {
      tags: {
        with: {
          tag: true
        }
      },
      images: {
        limit: 1
      },
      creatorId: true,
      participants: {
        with: {
          user: true
        },
        limit: 5
      }
    }
  });

  // Get the total count of startups for pagination
  const totalStartupsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(startup)
    .where(eq(startup.creatorUser, userId));

  const totalStartups = totalStartupsResult[0]?.count || 0;

  // Calculate total pages
  const totalPages = Math.ceil(totalStartups / pageSize);

  // Transform the data to match the expected structure
  const transformedStartups = startups.map(startup => ({
    ...startup,
    tags: startup.tags.map(t => t.tag),
    participants: startup.participants.map(p => p.user)
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
  const startups = await db.query.startup.findMany({
    where: and(
      not(eq(startup.creatorUser, userId)),
      sql`${startup.id} IN (
        SELECT ${userToStartup.startupId} 
        FROM ${userToStartup} 
        WHERE ${userToStartup.userId} = ${userId}
      )`
    ),
    limit: pageSize,
    offset: skip,
    orderBy: desc(startup.createdAt),
    with: {
      tags: {
        with: {
          tag: true
        }
      },
      images: {
        limit: 1
      },
      creatorId: true,
      participants: {
        with: {
          user: true
        },
        limit: 5
      }
    }
  });

  // Get the total count of startups for pagination
  const totalStartupsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(userToStartup)
    .innerJoin(startup, eq(userToStartup.startupId, startup.id))
    .where(and(
      eq(userToStartup.userId, userId),
      not(eq(startup.creatorUser, userId))
    ));

  const totalStartups = totalStartupsResult[0]?.count || 0;

  // Calculate total pages
  const totalPages = Math.ceil(totalStartups / pageSize);

  // Transform the data to match the expected structure
  const transformedStartups = startups.map(startup => ({
    ...startup,
    tags: startup.tags.map(t => t.tag),
    participants: startup.participants.map(p => p.user)
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
  // This is a more complex query in Drizzle compared to Prisma
  // We need to use subqueries to count the relationships

  // First, get the counts for each user
  const userCounts = await db
    .select({
      userId: user.id,
      createdCount: sql<number>`count(distinct ${startup.id})`.as('created_count'),
    })
    .from(user)
    .leftJoin(startup, eq(user.id, startup.creatorUser))
    .groupBy(user.id);

  const participatingCounts = await db
    .select({
      userId: user.id,
      participatingCount: sql<number>`count(distinct ${userToStartup.startupId})`.as('participating_count'),
    })
    .from(user)
    .leftJoin(userToStartup, eq(user.id, userToStartup.userId))
    .groupBy(user.id);

  // Combine the counts
  const combinedCounts = new Map<string, {
    userId: string;
    createdCount: number;
    participatingCount: number;
  }>();

  userCounts.forEach(item => {
    combinedCounts.set(item.userId, {
      userId: item.userId,
      createdCount: item.createdCount,
      participatingCount: 0
    });
  });

  participatingCounts.forEach(item => {
    if (combinedCounts.has(item.userId)) {
      const existing = combinedCounts.get(item.userId)!;
      existing.participatingCount = item.participatingCount;
    } else {
      combinedCounts.set(item.userId, {
        userId: item.userId,
        createdCount: 0,
        participatingCount: item.participatingCount
      });
    }
  });

  // Sort by counts and take the top users
  const sortedUserIds = Array.from(combinedCounts.values())
    .sort((a, b) => {
      // First sort by created startups
      if (b.createdCount !== a.createdCount) {
        return b.createdCount - a.createdCount;
      }
      // Then by participating startups
      return b.participatingCount - a.participatingCount;
    })
    .slice(0, limit)
    .map(item => item.userId);

  // Get the full user data for these IDs
  const users = await Promise.all(
    sortedUserIds.map(async (userId) => {
      const userData = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: {
          id: true,
          name: true,
          username: true,
          image: true
        }
      });

      const counts = combinedCounts.get(userId)!;

      return {
        ...userData,
        _count: {
          createdStartups: counts.createdCount,
          participatingStartups: counts.participatingCount
        }
      };
    })
  );

  return users;
}

export async function updateUserUsername(identifier: string, username: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  // Check if the new username is already taken
  const existingUser = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { id: true }
  });

  if (existingUser) {
    throw new Error("Username already taken");
  }

  // Update the username
  const [updatedUser] = await db
    .update(user)
    .set({ username })
    .where(eq(user.id, userInfo.id))
    .returning({
      id: user.id,
      username: user.username
    });

  return updatedUser;
}

export async function updateUserName(identifier: string, name: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  // Update the name
  const [updatedUser] = await db
    .update(user)
    .set({ name })
    .where(eq(user.id, userInfo.id))
    .returning({
      id: user.id,
      name: user.name
    });

  return updatedUser;
}

export async function updateUserImage(identifier: string, imageUrl: string) {
  const userInfo = await findUserByIdentifier(identifier);

  if (!userInfo) {
    throw new Error("User not found");
  }

  // Update the image URL
  const [updatedUser] = await db
    .update(user)
    .set({ image: imageUrl })
    .where(eq(user.id, userInfo.id))
    .returning({
      id: user.id,
      image: user.image
    });
  return updatedUser;
}