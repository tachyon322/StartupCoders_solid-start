# Cache Invalidation Implementation

## Overview

This document describes the cache invalidation strategy implemented for the startup creation and modification flows in the StartupCoders application.

## Problem

The find page (`/find`) implements caching for better performance:
- Startup lists are cached with a 2-minute fresh duration and 10-minute stale-while-revalidate window
- Tags are cached with a 5-minute fresh duration and 15-minute stale-while-revalidate window

Without proper cache invalidation, newly created startups wouldn't appear in the find page until the cache expires naturally.

## Solution

We've implemented automatic cache invalidation at key points where startup data is modified:

### 1. Startup Creation (`createStartup` function)

When a new startup is created, we invalidate:
- **All startup lists** - `invalidateCache.startupLists()` clears all cache entries starting with "startups:"
- **Tags cache** - `invalidateCache.tags()` clears the "tags:all" cache entry

```typescript
// In src/data/startup.ts
export async function createStartup(...) {
  // ... create startup logic ...
  
  // Invalidate cache after creating a new startup
  invalidateCache.startupLists();
  invalidateCache.tags();
  
  return startupWithRelations;
}
```

### 2. Request Acceptance (`acceptRequest` function)

When a request is accepted (adding new participants), we invalidate:
- **Startup-related caches** - `invalidateCache.startupRelated(startupId)` clears:
  - Individual startup cache
  - User access cache for that startup
  - All startup lists
- **User profiles** - For both the creator and new participants

```typescript
// In src/data/startup.ts
export async function acceptRequest(requestId: string) {
  // ... accept request logic ...
  
  // Invalidate cache after accepting request
  invalidateCache.startupRelated(foundStartup.id);
  invalidateCache.userProfile(session.user.id);
  
  // Also invalidate profiles of new participants
  requesters.forEach(requester => {
    invalidateCache.userProfile(requester.userId);
  });
  
  return true;
}
```

### 3. Request Rejection (`rejectRequest` function)

When a request is rejected, we invalidate:
- **Startup-related caches** - Same as accept, but without user profile updates

```typescript
// In src/data/startup.ts
export async function rejectRequest(requestId: string) {
  // ... reject request logic ...
  
  // Invalidate cache after rejecting request
  invalidateCache.startupRelated(foundStartup.id);
  
  return true;
}
```

## Cache Key Patterns

The application uses consistent cache key patterns:

- `startup:{id}` - Individual startup data
- `startups:{page}:{search}:{tags}` - Paginated startup lists
- `tags:all` - All available tags
- `profile:{userId}` - User profile data
- `access:{startupId}:{userId}` - User access permissions

## Testing

A test page is available at `/test` that provides:
- Real-time cache statistics
- List of all cache keys
- Manual cache management tools
- Instructions for testing the invalidation flow

### How to Test

1. Navigate to `/test` to monitor cache state
2. Go to `/find` to populate the cache (you'll see "startups:" and "tags:all" entries)
3. Create a new startup at `/create`
4. Return to `/test` - the startup and tag caches should be cleared
5. Go back to `/find` - the new startup should appear immediately

## Benefits

- **Immediate Updates**: New startups appear instantly in the find page
- **Consistency**: All related caches are invalidated together
- **Performance**: Only affected caches are cleared, preserving unrelated cached data
- **User Experience**: No stale data shown to users after modifications

## Future Improvements

- Add cache invalidation for startup updates/edits (when implemented)
- Consider more granular invalidation for large-scale applications
- Add cache warming strategies for frequently accessed data