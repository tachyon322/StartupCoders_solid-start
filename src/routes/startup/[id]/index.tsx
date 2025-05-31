import { useParams } from "@solidjs/router";
import { createResource, Show, onMount, createSignal } from "solid-js";
import Header from "~/components/landing/Header";
import { useSession } from "~/lib/auth/session-context";
import StartupLeftCard from "~/components/startup/StartupLeftCard";
import StartupRightCard from "~/components/startup/StartupRightCard";
import { getStartupById } from "~/data/startup";


export default function index() {
  const params = useParams();
  const sessionData = useSession();
  const [mounted, setMounted] = createSignal(false);
  
  // Create a resource to fetch startup data based on the ID from params
  const [startupData] = createResource(() => params.id, getStartupById);
  
  onMount(() => {
    setMounted(true);
  });
  
  return (
    <div>
      <Header session={sessionData} />

      <div class="container mx-auto px-4 max-w-6xl flex gap-2 mt-2">
        <Show
          when={mounted() && !startupData.loading && startupData()}
          fallback={
            <Show when={mounted()} fallback={
              <div class="flex justify-center items-center w-full h-64">
                <div class="text-lg">Loading...</div>
              </div>
            }>
              <div class="flex w-full space-x-4">
                {/* Left Card Skeleton */}
                <div class="flex-1 mr-4">
                  <div class="border rounded-lg p-6 animate-pulse">
                    {/* Header skeleton */}
                    <div class="mb-6">
                      <div class="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    
                    {/* Description skeleton */}
                    <div class="mb-6">
                      <div class="h-4 bg-gray-200 rounded mb-2 w-20"></div>
                      <div class="space-y-2">
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div class="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                    
                    {/* Tags skeleton */}
                    <div class="mb-6">
                      <div class="h-4 bg-gray-200 rounded mb-2 w-16"></div>
                      <div class="flex space-x-2">
                        <div class="h-6 bg-gray-200 rounded-full w-16"></div>
                        <div class="h-6 bg-gray-200 rounded-full w-20"></div>
                        <div class="h-6 bg-gray-200 rounded-full w-14"></div>
                      </div>
                    </div>
                    
                    {/* Images skeleton */}
                    <div class="mb-4">
                      <div class="h-4 bg-gray-200 rounded mb-2 w-20"></div>
                      <div class="grid grid-cols-2 gap-2">
                        <div class="h-24 bg-gray-200 rounded"></div>
                        <div class="h-24 bg-gray-200 rounded"></div>
                        <div class="h-24 bg-gray-200 rounded"></div>
                        <div class="h-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    
                    {/* Footer skeleton */}
                    <div class="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                
                {/* Right Card Skeleton */}
                <div class="w-96">
                  <div class="border rounded-lg p-6 animate-pulse">
                    {/* Buttons skeleton */}
                    <div class="mb-6 space-y-2">
                      <div class="h-10 bg-gray-200 rounded w-full"></div>
                      <div class="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                    
                    {/* Creator skeleton */}
                    <div class="mb-6">
                      <div class="h-4 bg-gray-200 rounded mb-2 w-16"></div>
                      <div class="flex items-center space-x-3">
                        <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
                        <div class="flex-1">
                          <div class="h-4 bg-gray-200 rounded mb-1 w-24"></div>
                          <div class="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Team members skeleton */}
                    <div>
                      <div class="h-4 bg-gray-200 rounded mb-2 w-32"></div>
                      <div class="space-y-2">
                        <div class="flex items-center space-x-2">
                          <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
                          <div class="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div class="flex items-center space-x-2">
                          <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
                          <div class="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div class="flex items-center space-x-2">
                          <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
                          <div class="h-3 bg-gray-200 rounded w-18"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Show>
          }
        >
          <StartupLeftCard startup={startupData() || undefined} />
          <StartupRightCard startup={startupData() || undefined} width={400} height={600} />
        </Show>
        
        <Show when={!startupData.loading && !startupData()}>
          <div class="flex justify-center items-center w-full h-64">
            <div class="text-lg text-red-500">Стартап не найден</div>
          </div>
        </Show>
      </div>
    </div>
  )
}
