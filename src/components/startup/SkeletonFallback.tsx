import { JSX } from "solid-js";

// Loading skeleton component
export default function StartupLoadingSkeleton() {
  return (
    <div class="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left Card Skeleton */}
      <div class="w-full lg:flex-1">
        <div class="border-2 border-gray-300 rounded-lg p-4 md:p-6 animate-pulse bg-white">
          {/* Header skeleton */}
          <div class="mb-4 md:mb-6">
            <div class="h-5 md:h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Description skeleton */}
          <div class="mb-4 md:mb-6">
            <div class="h-4 bg-gray-200 rounded mb-2 w-20"></div>
            <div class="space-y-2">
              <div class="h-3 md:h-4 bg-gray-200 rounded"></div>
              <div class="h-3 md:h-4 bg-gray-200 rounded w-5/6"></div>
              <div class="h-3 md:h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>

          {/* Tags skeleton */}
          <div class="mb-4 md:mb-6">
            <div class="h-4 bg-gray-200 rounded mb-2 w-16"></div>
            <div class="flex flex-wrap gap-1.5 md:gap-2">
              <div class="h-6 md:h-7 bg-gray-200 rounded-full w-16"></div>
              <div class="h-6 md:h-7 bg-gray-200 rounded-full w-20"></div>
              <div class="h-6 md:h-7 bg-gray-200 rounded-full w-14"></div>
            </div>
          </div>

          {/* Images skeleton */}
          <div class="mb-4">
            <div class="h-4 bg-gray-200 rounded mb-2 w-20"></div>
            <div class="grid grid-cols-2 gap-2 md:gap-3">
              <div class="aspect-square bg-gray-200 rounded-lg"></div>
              <div class="aspect-square bg-gray-200 rounded-lg"></div>
              <div class="aspect-square bg-gray-200 rounded-lg"></div>
              <div class="aspect-square bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Footer skeleton */}
          <div class="h-3 md:h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Right Card Skeleton */}
      <div class="w-full lg:w-[400px] lg:flex-shrink-0">
        <div class="border-2 border-gray-300 rounded-lg p-4 md:p-6 animate-pulse bg-white">
          {/* Button skeleton */}
          <div class="mb-4 md:mb-6">
            <div class="h-12 md:h-10 bg-gray-200 rounded-lg w-full"></div>
          </div>

          {/* Creator skeleton */}
          <div class="mb-4 md:mb-6">
            <div class="h-4 bg-gray-200 rounded mb-3 w-20"></div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 md:w-8 md:h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div class="flex-1 min-w-0">
                <div class="h-4 bg-gray-200 rounded mb-1 w-24"></div>
                <div class="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>

          {/* Team members skeleton */}
          <div>
            <div class="h-4 bg-gray-200 rounded mb-3 w-32"></div>
            <div class="space-y-1">
              <div class="flex items-center gap-3 p-2">
                <div class="w-8 h-8 md:w-6 md:h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div class="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div class="flex items-center gap-3 p-2">
                <div class="w-8 h-8 md:w-6 md:h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div class="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div class="flex items-center gap-3 p-2">
                <div class="w-8 h-8 md:w-6 md:h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div class="h-3 bg-gray-200 rounded w-18"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error fallback component
export function StartupErrorFallback(props: { error: Error; reset: () => void }) {
  return (
    <div class="flex flex-col items-center justify-center min-h-[50vh] p-4 md:p-8">
      <div class="text-red-500 text-lg md:text-xl mb-4">⚠️ Ошибка загрузки стартапа</div>
      <div class="text-gray-600 mb-4 text-center max-w-md text-sm md:text-base">
        {props.error.message || "Произошла ошибка при загрузке данных стартапа"}
      </div>
      <button
        onClick={props.reset}
        class="px-6 py-3 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors touch-manipulation text-sm md:text-base"
      >
        Попробовать снова
      </button>
    </div>
  );
}