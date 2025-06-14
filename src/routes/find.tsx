import Header from "~/components/landing/Header";
import { useSession } from "~/lib/auth/session-context";
import { getStartups } from "~/data/startup";
import { getAllTags } from "~/data/user";
import { A, useSearchParams } from "@solidjs/router";
import { createResource, createSignal, onCleanup, onMount } from "solid-js";
import StartupList from "~/components/find/StartupList";
import StartupSearch from "~/components/find/StartupSearch";
import { globalCache, createCacheKey } from "~/lib/cache";
import { Button } from "~/components/ui/button";

const PAGE_SIZE = 10;

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds
const STALE_WHILE_REVALIDATE_DURATION = 60 * 1000; // 1 minute

// Cached tags fetcher with stale-while-revalidate
async function getCachedTags() {
  return globalCache.get(
    createCacheKey.tags(),
    () => getAllTags(),
    {
      maxAge: 5 * 60 * 1000, // 5 minutes for tags (they change less frequently)
      staleWhileRevalidate: 15 * 60 * 1000 // 15 minutes total
    }
  );
}

// Cached startups fetcher with stale-while-revalidate
async function getCachedStartups(page: number, pageSize: number, searchQuery?: string, tagIds?: number[]) {
  const tagsKey = tagIds ? tagIds.sort().join(',') : undefined;
  const cacheKey = createCacheKey.startupList(page, searchQuery, tagsKey);

  return globalCache.get(
    cacheKey,
    () => getStartups(page, pageSize, searchQuery, tagIds),
    {
      maxAge: CACHE_DURATION, // 30 seconds fresh
      staleWhileRevalidate: STALE_WHILE_REVALIDATE_DURATION
    }
  );
}

// Preload functions for better performance
export function preloadFindPageData() {
  // Preload tags data
  getCachedTags().catch(console.error);

  // Preload first page of startups
  getCachedStartups(1, PAGE_SIZE).catch(console.error);
}

export function preloadStartupsList(page: number, searchQuery?: string, tagIds?: number[]) {
  getCachedStartups(page, PAGE_SIZE, searchQuery, tagIds).catch(console.error);
}

export default function find() {
  const [searchParams] = useSearchParams();
  const sessionData = useSession();
  const [cacheInvalidationTrigger, setCacheInvalidationTrigger] = createSignal(0);

  // Optimized resource for tags with caching
  const [tagsResource] = createResource(
    () => cacheInvalidationTrigger(),
    () => getCachedTags()
  );

  // Optimized resource for startups with caching
  const [startupsResource] = createResource(
    () => {
      const pageParam = searchParams.page;
      const queryParam = searchParams.q;
      const tagsParam = searchParams.tags;

      const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam;
      const queryStr = Array.isArray(queryParam) ? queryParam[0] : queryParam;
      const tagsStr = Array.isArray(tagsParam) ? tagsParam[0] : tagsParam;

      const page = parseInt(pageStr || "1", 10) || 1;
      const tagIds = tagsStr
        ? tagsStr.split(",").map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id))
        : undefined;

      return {
        page,
        pageSize: PAGE_SIZE,
        searchQuery: queryStr || undefined,
        tagIds,
        trigger: cacheInvalidationTrigger()
      };
    },
    async (params) => {
      return getCachedStartups(params.page, params.pageSize, params.searchQuery, params.tagIds);
    }
  );

  // Auto-revalidation and cleanup timer
  let revalidationInterval: ReturnType<typeof setInterval>;
  let cleanupInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    // Force clear startup cache on mount to ensure fresh data
    const cacheKeys = Array.from((globalCache as any).cache.keys()) as string[];
    cacheKeys.forEach((key: string) => {
      if (key.startsWith('startups:')) {
        globalCache.delete(key);
      }
    });

    // Set up periodic revalidation every 30 seconds
    revalidationInterval = setInterval(() => {
      // Check if we have any cached data before triggering revalidation
      const hasTagsCache = globalCache.has(createCacheKey.tags());
      const cacheKeys = Array.from((globalCache as any).cache.keys()) as string[];
      const hasStartupsCache = cacheKeys.some((key: string) =>
        key.startsWith('startups:')
      );

      if (hasTagsCache || hasStartupsCache) {
        // Force delete startup cache entries to ensure fresh data
        const cacheKeys = Array.from((globalCache as any).cache.keys()) as string[];
        cacheKeys.forEach((key: string) => {
          if (key.startsWith('startups:')) {
            globalCache.delete(key);
          }
        });
        setCacheInvalidationTrigger(prev => prev + 1);
      }
    }, CACHE_DURATION);

    // Set up periodic cache cleanup every 5 minutes
    cleanupInterval = setInterval(() => {
      const cleanedCount = globalCache.cleanup();
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired cache entries`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  });

  onCleanup(() => {
    if (revalidationInterval) {
      clearInterval(revalidationInterval);
    }
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
  });

  return (
    <div>
      <Header session={sessionData} />

      <div class="container mx-auto px-4 max-w-6xl">
        <div class="flex items-center gap-5">
          <h1 class="text-2xl font-bold mb-4 my-4">Найдите стартапы</h1>
          <A href="/create">
          <Button variant={"secondary"}>Создать</Button></A>
        </div>
        <StartupSearch availableTags={tagsResource() || []} />
        <div class="mt-6">
          <StartupList startupsResource={startupsResource} />
        </div>
      </div>
    </div>
  )
}
