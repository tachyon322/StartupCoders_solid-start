import { useParams } from "@solidjs/router";
import { createResource, Show, onMount, createSignal, createMemo, createEffect, onCleanup, ErrorBoundary, Suspense } from "solid-js";
import Header from "~/components/landing/Header";
import { useSession } from "~/lib/auth/session-context";
import StartupLeftCard from "~/components/startup/StartupLeftCard";
import StartupRightCard from "~/components/startup/StartupRightCard";
import { getStartupById } from "~/data/startup";
import { hasRequestedAccess } from "~/data/startup";
import { globalCache, createCacheKey, invalidateCache } from "~/lib/cache";
import StartupLoadingSkeleton, { StartupErrorFallback } from "~/components/startup/SkeletonFallback";

// Cache configuration
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Cached startup data fetcher with stale-while-revalidate
async function getCachedStartupData(startupId: string) {
  return globalCache.get(
    createCacheKey.startup(startupId),
    () => getStartupById(startupId)
  );
}

// Cached access check with stale-while-revalidate
async function getCachedAccessData(session: any, startupId: string) {
  // Check different possible session structures
  const userId = session?.data?.user?.id || session?.user?.id || session?.data?.id;
  if (!userId) return false;
  
  return globalCache.get(
    createCacheKey.userAccess(startupId, userId),
    () => hasRequestedAccess(session, startupId)
  );
}

// Preload function for better performance
export function preloadStartupData(startupId: string) {
  // Preload startup data
  getCachedStartupData(startupId).catch(console.error);
}


export default function index() {
  const params = useParams();
  const session = useSession();
  const [mounted, setMounted] = createSignal(false);
  const [cacheInvalidationTrigger, setCacheInvalidationTrigger] = createSignal(0);

  // Optimized resource for startup data with caching
  const [startupData, { refetch: refetchStartup }] = createResource(
    () => params.id ? [String(params.id), cacheInvalidationTrigger()] as [string, number] : null,
    ([startupId, _trigger]: [string, number]) => getCachedStartupData(startupId),
    {
      // Enable SolidJS resource caching
      storage: (init) => {
        const [value, setValue] = createSignal(init);
        return [value, setValue];
      }
    }
  );

  // Optimized resource for access check with caching
  const [requestedAccess] = createResource(
    () => session() && params.id ? [session(), String(params.id), cacheInvalidationTrigger()] as [any, string, number] : null,
    ([sessionData, startupId, _trigger]: [any, string, number]) => getCachedAccessData(sessionData, startupId),
    {
      // Enable SolidJS resource caching
      storage: (init) => {
        const [value, setValue] = createSignal(init);
        return [value, setValue];
      }
    }
  );

  // Auto-revalidation timer
  let revalidationInterval: ReturnType<typeof setInterval>;
  
  createEffect(() => {
    if (params.id) {
      // Set up periodic revalidation every 5 minutes
      revalidationInterval = setInterval(() => {
        const startupCacheKey = createCacheKey.startup(String(params.id));
        
        // Only revalidate if cache exists
        if (globalCache.has(startupCacheKey)) {
          setCacheInvalidationTrigger(prev => prev + 1);
        }
      }, CACHE_DURATION);
    }
  });

  onCleanup(() => {
    if (revalidationInterval) {
      clearInterval(revalidationInterval);
    }
  });

  onMount(() => {
    setMounted(true);
  });

  const isCreator = createMemo(() => {
    const startup = startupData();
    const currentSession = session();
    // Check different possible session structures
    const userId = currentSession?.data?.user?.id || currentSession?.user?.id || currentSession?.data?.id;
    return startup?.creatorUser === userId;
  });
  
  const isParticipant = createMemo(() => {
    const startup = startupData();
    const currentSession = session();
    // Check different possible session structures
    const userId = currentSession?.data?.user?.id || currentSession?.user?.id || currentSession?.data?.id;
    return startup?.participants?.some((participant: any) => participant.id === userId) || false;
  });
  
  const isRequestedAccess = createMemo(() => {
    const creator = isCreator();
    const participant = isParticipant();
    const hasRequested = requestedAccess();
    
    // User should NOT be able to join if they are:
    // 1. The creator of the startup
    // 2. Already a participant
    // 3. Have already sent a request to join
    return creator || participant || !!hasRequested;
  });

  const handleRequestSent = () => {
    // Invalidate cache and trigger refresh
    const currentSession = session();
    const userId = currentSession?.data?.user?.id || currentSession?.user?.id || currentSession?.data?.id;
    if (userId && params.id) {
      invalidateCache.startupRelated(String(params.id), userId);
      setCacheInvalidationTrigger(prev => prev + 1);
    }
  };

  return (
    <div>
      <Header session={session} />

      <div class="container mx-auto px-4 flex max-w-6xl gap-2 mt-2">
        <ErrorBoundary fallback={StartupErrorFallback}>
          <Suspense fallback={<StartupLoadingSkeleton />}>
            <Show
              when={mounted() && !startupData.loading && startupData()}
              fallback={
                <Show when={mounted()} fallback={
                  <div class="flex justify-center items-center w-full h-64">
                    <div class="text-lg">Загрузка...</div>
                  </div>
                }>
                  <StartupLoadingSkeleton />
                </Show>
              }
            >
              <StartupLeftCard startup={startupData() || undefined} />
              <StartupRightCard
                startup={startupData() || undefined}
                width={400}
                height={600}
                isRequestedAccess={!!isRequestedAccess()}
                onRequestSent={handleRequestSent}
                session={session()}
              />
            </Show>

            <Show when={!startupData.loading && !startupData()}>
              <div class="flex justify-center items-center w-full h-64">
                <div class="text-lg text-red-500">Стартап не найден</div>
              </div>
            </Show>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
