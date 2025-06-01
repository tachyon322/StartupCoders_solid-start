import { JSX } from "solid-js";

// Loading skeleton component
export default function StartupLoadingSkeleton() {
  return (
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
  );
}

// Error fallback component
export function StartupErrorFallback(props: { error: Error; reset: () => void }) {
  return (
    <div class="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div class="text-red-500 text-xl mb-4">⚠️ Ошибка загрузки стартапа</div>
      <div class="text-gray-600 mb-4 text-center max-w-md">
        {props.error.message || "Произошла ошибка при загрузке данных стартапа"}
      </div>
      <button 
        onClick={props.reset}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Попробовать снова
      </button>
    </div>
  );
}