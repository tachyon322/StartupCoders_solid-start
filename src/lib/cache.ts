// Enhanced caching utility with stale-while-revalidate strategy
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

export interface CacheConfig {
  maxAge: number; // Fresh cache duration
  staleWhileRevalidate: number; // Total cache duration (including stale)
}

export class Cache {
  private cache = new Map<string, CacheEntry>();
  private defaultConfig: CacheConfig;

  constructor(config: CacheConfig = {
    maxAge: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: 10 * 60 * 1000 // 10 minutes
  }) {
    this.defaultConfig = config;
  }

  private isFresh(timestamp: number, maxAge: number): boolean {
    return Date.now() - timestamp < maxAge;
  }

  private isValid(timestamp: number, staleWhileRevalidate: number): boolean {
    return Date.now() - timestamp < staleWhileRevalidate;
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: Partial<CacheConfig> = {}
  ): Promise<T> {
    const { maxAge, staleWhileRevalidate } = { ...this.defaultConfig, ...config };
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;

    // Return fresh cache immediately
    if (cached && this.isFresh(cached.timestamp, maxAge)) {
      return cached.data;
    }

    // If cache is stale but within SWR window, return stale data and revalidate in background
    if (cached && this.isValid(cached.timestamp, staleWhileRevalidate)) {
      const staleData = cached.data;

      // Revalidate in background if not already doing so
      if (!cached.promise) {
        cached.promise = fetcher()
          .then(freshData => {
            this.set(key, freshData);
            return freshData;
          })
          .catch(error => {
            console.error(`Background revalidation failed for key ${key}:`, error);
            cached.promise = undefined;
            return staleData;
          });
      }

      return staleData;
    }

    // No valid cache, fetch fresh data
    const freshData = await fetcher();
    this.set(key, freshData);
    return freshData;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      promise: undefined
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if entry is still valid (not expired)
    if (!this.isValid(entry.timestamp, this.defaultConfig.staleWhileRevalidate)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Check if a cache entry is fresh (not stale)
  isCacheFresh(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return this.isFresh(entry.timestamp, this.defaultConfig.maxAge);
  }

  // Get all cache keys (useful for debugging)
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      freshEntries: entries.filter(([_, entry]) => 
        this.isFresh(entry.timestamp, this.defaultConfig.maxAge)
      ).length,
      staleEntries: entries.filter(([_, entry]) => 
        !this.isFresh(entry.timestamp, this.defaultConfig.maxAge) &&
        this.isValid(entry.timestamp, this.defaultConfig.staleWhileRevalidate)
      ).length,
      expiredEntries: entries.filter(([_, entry]) => 
        !this.isValid(entry.timestamp, this.defaultConfig.staleWhileRevalidate)
      ).length
    };
  }

  // Clean up expired entries
  cleanup(): number {
    const entries = Array.from(this.cache.entries());
    let cleaned = 0;

    entries.forEach(([key, entry]) => {
      if (!this.isValid(entry.timestamp, this.defaultConfig.staleWhileRevalidate)) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    return cleaned;
  }

  // Force cleanup of stale entries (not just expired)
  cleanupStale(): number {
    const entries = Array.from(this.cache.entries());
    let cleaned = 0;

    entries.forEach(([key, entry]) => {
      if (!this.isFresh(entry.timestamp, this.defaultConfig.maxAge)) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    return cleaned;
  }
}

// Global cache instance with automatic cleanup
export const globalCache = new Cache();

// Global cleanup timer - runs every 10 minutes to clean expired entries
let globalCleanupInterval: ReturnType<typeof setInterval>;

// Initialize global cleanup when module loads
if (typeof window !== 'undefined') {
  globalCleanupInterval = setInterval(() => {
    const cleanedCount = globalCache.cleanup();
    if (cleanedCount > 0) {
      console.log(`[Global Cache] Cleaned up ${cleanedCount} expired cache entries`);
    }
  }, 10 * 60 * 1000); // 10 minutes
}

// Cleanup function for server-side or when needed
export const stopGlobalCleanup = () => {
  if (globalCleanupInterval) {
    clearInterval(globalCleanupInterval);
  }
};

// Utility functions for common cache key patterns
export const createCacheKey = {
  startup: (id: string) => `startup:${id}`,
  userAccess: (startupId: string, userId: string) => `access:${startupId}:${userId}`,
  userProfile: (userId: string) => `profile:${userId}`,
  startupList: (page: number, search?: string, tags?: string) =>
    `startups:${page}:${search || 'all'}:${tags || 'none'}`,
  tags: () => 'tags:all'
};

// Cache invalidation helpers
export const invalidateCache = {
  startup: (startupId: string) => {
    globalCache.delete(createCacheKey.startup(startupId));
  },
  userAccess: (startupId: string, userId: string) => {
    globalCache.delete(createCacheKey.userAccess(startupId, userId));
  },
  userProfile: (userId: string) => {
    globalCache.delete(createCacheKey.userProfile(userId));
  },
  tags: () => {
    globalCache.delete(createCacheKey.tags());
  },
  startupLists: () => {
    const keys = Array.from((globalCache as any).cache.keys()) as string[];
    keys.forEach(key => {
      if (key.startsWith('startups:')) {
        globalCache.delete(key);
      }
    });
  },
  startupRelated: (startupId: string, userId?: string) => {
    globalCache.delete(createCacheKey.startup(startupId));
    if (userId) {
      globalCache.delete(createCacheKey.userAccess(startupId, userId));
    }
    // Also invalidate startup lists as they might be affected
    invalidateCache.startupLists();
  }
};