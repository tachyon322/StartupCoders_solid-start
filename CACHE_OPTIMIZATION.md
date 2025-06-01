# Startup Page Cache Optimization

This document describes the comprehensive caching optimizations implemented for the startup detail page (`src/routes/startup/[id]/index.tsx`) to improve page load speed and user experience.

## Overview

The optimization implements a **Stale-While-Revalidate (SWR)** caching strategy with automatic cache invalidation and background revalidation. This approach provides:

- **Instant loading** for cached data
- **Background updates** to keep data fresh
- **Automatic cache invalidation** when data changes
- **Error resilience** with fallback mechanisms

## Key Features

### 1. Stale-While-Revalidate Cache (`src/lib/cache.ts`)

A sophisticated caching utility that:
- Serves fresh data immediately if available (< 5 minutes old)
- Serves stale data while revalidating in background (5-10 minutes old)
- Fetches fresh data for expired cache (> 10 minutes old)
- Provides cache statistics and cleanup utilities

```typescript
// Cache configuration
const CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000,              // 5 minutes fresh
  staleWhileRevalidate: 10 * 60 * 1000 // 10 minutes total
};
```

### 2. Optimized Data Fetching

#### Startup Data Caching
```typescript
async function getCachedStartupData(startupId: string) {
  return globalCache.get(
    createCacheKey.startup(startupId),
    () => getStartupById(startupId)
  );
}
```

#### User Access Caching
```typescript
async function getCachedAccessData(session: any, startupId: string) {
  if (!session?.user?.id) return false;
  
  return globalCache.get(
    createCacheKey.userAccess(startupId, session.user.id),
    () => hasRequestedAccess(session, startupId)
  );
}
```

### 3. Automatic Cache Revalidation

- **Periodic revalidation**: Every 5 minutes for active pages
- **Smart invalidation**: Only revalidates if cache exists
- **Background updates**: Non-blocking cache refreshes

```typescript
createEffect(() => {
  if (params.id) {
    revalidationInterval = setInterval(() => {
      const startupCacheKey = createCacheKey.startup(String(params.id));
      if (globalCache.has(startupCacheKey)) {
        setCacheInvalidationTrigger(prev => prev + 1);
      }
    }, CACHE_DURATION);
  }
});
```

### 4. Cache Invalidation Strategy

Intelligent cache invalidation when data changes:

```typescript
const handleRequestSent = () => {
  const currentSession = session();
  if (currentSession?.user?.id && params.id) {
    // Invalidates startup data, user access, and related startup lists
    invalidateCache.startupRelated(String(params.id), currentSession.user.id);
    setCacheInvalidationTrigger(prev => prev + 1);
  }
};
```

### 5. Enhanced User Experience

#### Error Boundaries
```typescript
<ErrorBoundary fallback={StartupErrorFallback}>
  {/* Page content */}
</ErrorBoundary>
```

#### Optimized Loading States
- **Suspense boundaries** for better loading UX
- **Skeleton components** for perceived performance
- **Progressive loading** with fallbacks

#### Preloading Support
```typescript
export function preloadStartupData(startupId: string) {
  getCachedStartupData(startupId).catch(console.error);
}
```

## Performance Benefits

### 1. Reduced API Calls
- **Cache hits**: Serve data instantly without API calls
- **Background revalidation**: Update data without blocking UI
- **Smart invalidation**: Only fetch when necessary

### 2. Improved Perceived Performance
- **Instant loading**: Cached data appears immediately
- **Skeleton screens**: Visual feedback during loading
- **Progressive enhancement**: Content loads incrementally

### 3. Better User Experience
- **Offline resilience**: Stale data available when network fails
- **Error recovery**: Graceful error handling with retry options
- **Smooth interactions**: No loading delays for cached content

## Cache Management

### Cache Statistics
```typescript
const stats = globalCache.getStats();
// Returns: { totalEntries, freshEntries, staleEntries, expiredEntries }
```

### Manual Cache Cleanup
```typescript
const cleanedCount = globalCache.cleanup();
// Removes expired entries and returns count
```

### Cache Key Patterns
```typescript
const cacheKeys = {
  startup: (id) => `startup:${id}`,
  userAccess: (startupId, userId) => `access:${startupId}:${userId}`,
  userProfile: (userId) => `profile:${userId}`,
  startupList: (page, search, tags) => `startups:${page}:${search}:${tags}`
};
```

## Implementation Details

### Resource Configuration
```typescript
const [startupData] = createResource(
  () => params.id ? [String(params.id), cacheInvalidationTrigger()] : null,
  ([startupId, _trigger]) => getCachedStartupData(startupId),
  {
    storage: (init) => {
      const [value, setValue] = createSignal(init);
      return [value, setValue];
    }
  }
);
```

### Cache Invalidation Triggers
- **User actions**: Request sent, data modified
- **Time-based**: Automatic revalidation intervals
- **Manual**: Explicit cache clearing

### Error Handling
- **Network failures**: Serve stale data as fallback
- **API errors**: Display user-friendly error messages
- **Cache corruption**: Automatic cache cleanup and refresh

## Best Practices

1. **Cache Key Design**: Use consistent, hierarchical cache keys
2. **Invalidation Strategy**: Invalidate related data together
3. **Error Boundaries**: Wrap cached components in error boundaries
4. **Loading States**: Provide meaningful loading feedback
5. **Background Updates**: Use SWR for non-critical updates

## Monitoring and Debugging

### Cache Statistics
Monitor cache performance with built-in statistics:
```typescript
console.log('Cache Stats:', globalCache.getStats());
```

### Debug Cache State
```typescript
// Check if data is cached
console.log('Has startup cache:', globalCache.has(createCacheKey.startup(id)));

// Manual cache inspection
console.log('Cache entries:', Array.from(globalCache.cache.keys()));
```

## Future Enhancements

1. **Persistence**: Add localStorage/IndexedDB persistence
2. **Compression**: Implement cache data compression
3. **Analytics**: Track cache hit/miss ratios
4. **Selective Invalidation**: More granular cache invalidation
5. **Cross-tab Sync**: Synchronize cache across browser tabs

## Conclusion

This caching implementation provides a robust, performant solution for the startup detail page that:
- Dramatically improves page load times
- Reduces server load through intelligent caching
- Provides excellent user experience with instant data access
- Maintains data freshness through background revalidation
- Handles errors gracefully with fallback mechanisms

The system is designed to be maintainable, extensible, and provides clear performance benefits while maintaining data consistency.