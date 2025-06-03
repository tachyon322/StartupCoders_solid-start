import Header from "~/components/landing/Header";
import { useSession } from "~/lib/auth/session-context";
import { getStartups } from "~/data/startup";
import { getAllTags } from "~/data/user";
import { useSearchParams } from "@solidjs/router";
import { createResource, createSignal, createEffect, onCleanup, onMount } from "solid-js";
import StartupList from "~/components/find/StartupList";
import StartupSearch from "~/components/find/StartupSearch";
import { globalCache, createCacheKey } from "~/lib/cache";

const PAGE_SIZE = 10;

// Cache configuration
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Cached tags fetcher with stale-while-revalidate
async function getCachedTags() {
  return globalCache.get(
    createCacheKey.tags(),
    () => getAllTags(),
    {
      maxAge: 5 * 60 * 1000, // 5 minutes for tags (they change less frequently)
      staleWhileRevalidate: 5 * 60 * 1000 // 15 minutes total
    }
  );
}

// Cached startups fetcher with stale-while-revalidate
async function getCachedStartups(page: number, pageSize: number, searchQuery?: string, tagIds?: number[]) {
  const tagsKey = tagIds ? tagIds.sort().join(',') : undefined;
  const cacheKey = createCacheKey.startupList(page, searchQuery, tagsKey);
  
  return globalCache.get(
    cacheKey,
    () => getStartups(page, pageSize, searchQuery, tagIds)
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
  const [mounted, setMounted] = createSignal(false);

  // Optimized resource for tags with caching
  const [tagsResource] = createResource(
    () => mounted() ? cacheInvalidationTrigger() : null,
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
    },
    {
      // Enable SolidJS resource caching
      storage: (init) => {
        const [value, setValue] = createSignal(init);
        return [value, setValue];
      }
    }
  );

  // Auto-revalidation timer for periodic cache refresh
  let revalidationInterval: ReturnType<typeof setInterval>;
  
  createEffect(() => {
    if (mounted()) {
      // Set up periodic revalidation every 5 minutes
      revalidationInterval = setInterval(() => {
        // Check if we have any cached data before triggering revalidation
        const hasTagsCache = globalCache.has(createCacheKey.tags());
        const cacheKeys = Array.from((globalCache as any).cache.keys()) as string[];
        const hasStartupsCache = cacheKeys.some((key: string) =>
          key.startsWith('startups:')
        );
        
        if (hasTagsCache || hasStartupsCache) {
          setCacheInvalidationTrigger(prev => prev + 1);
        }
      }, CACHE_DURATION);
    }
  });

  // Set mounted state after hydration
  onMount(() => {
    setMounted(true);
  });

  onCleanup(() => {
    if (revalidationInterval) {
      clearInterval(revalidationInterval);
    }
  });

  return (
    <div>
      <Header session={sessionData} />

      <div class="container mx-auto px-4 max-w-6xl">
        <h1 class="text-2xl font-bold mb-4 my-4">Найдите стартапы</h1>
        <StartupSearch availableTags={tagsResource() || []} />
        <div class="mt-6">
          <StartupList startupsResource={startupsResource} mounted={mounted()} />
        </div>
      </div>
    </div>
  )
}
