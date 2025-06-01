import { For } from "solid-js";

export default function StartupSkeleton() {
  const skeletonItems = Array.from({ length: 6 }, (_, index) => index);
  
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <For each={skeletonItems}>
        {() => (
          <div class="bg-white rounded-xs overflow-hidden border border-gray-100 h-full flex flex-col animate-pulse">
          {/* Image skeleton */}
          <div class="h-48 bg-gray-200"></div>
          
          {/* Content skeleton */}
          <div class="p-4 flex flex-col flex-grow space-y-3">
            {/* Title skeleton */}
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            
            {/* Description skeleton */}
            <div class="space-y-2 flex-grow">
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
              <div class="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            
            {/* Tags skeleton */}
            <div class="flex flex-wrap gap-1">
              <div class="h-6 bg-gray-200 rounded-full w-16"></div>
              <div class="h-6 bg-gray-200 rounded-full w-20"></div>
              <div class="h-6 bg-gray-200 rounded-full w-12"></div>
            </div>
            
            {/* Footer skeleton */}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                {/* Creator info skeleton */}
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 rounded-full bg-gray-200"></div>
                  <div class="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                
                {/* Participants skeleton */}
                <div class="flex items-center gap-1">
                  <div class="w-4 h-4 bg-gray-200 rounded"></div>
                  <div class="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              
              {/* Timestamp skeleton */}
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-gray-200 rounded"></div>
                <div class="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
          </div>
        )}
      </For>
    </div>
  );
}