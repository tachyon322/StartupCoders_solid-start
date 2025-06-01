import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function ProfileSkeleton() {
  return (
    <div class="space-y-6">
      {/* Profile Header Skeleton */}
      <Card class="w-full">
        <CardHeader class="pb-4">
          <div class="flex items-center justify-between">
            <div class="h-6 bg-gray-200 rounded-md w-40 animate-pulse"></div>
            <div class="h-8 bg-gray-200 rounded-md w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        
        <CardContent class="space-y-6">
          {/* Profile Image and Basic Info */}
          <div class="flex flex-col sm:flex-row items-start gap-6">
            {/* Profile Image Skeleton */}
            <div class="flex-shrink-0">
              <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Basic Info Skeleton */}
            <div class="flex-1 min-w-0 space-y-3">
              {/* Name and Username */}
              <div class="space-y-2">
                <div class="h-8 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                <div class="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
              </div>

              {/* Email and Verification */}
              <div class="flex items-center gap-3">
                <div class="h-5 bg-gray-200 rounded-md w-40 animate-pulse"></div>
                <div class="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              </div>

              {/* Join Date */}
              <div class="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Description Section */}
          <div class="space-y-3">
            <div class="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>
            <div class="p-4 bg-gray-50 rounded-lg border">
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div class="space-y-3">
            <div class="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            <div class="flex flex-wrap gap-2">
              <div class="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
              <div class="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              <div class="h-6 bg-gray-200 rounded-full w-18 animate-pulse"></div>
              <div class="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview Skeleton */}
      <Card class="w-full">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="h-6 bg-gray-200 rounded-md w-40 animate-pulse"></div>
            <div class="text-right">
              <div class="h-4 bg-gray-200 rounded-md w-20 mb-1 animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div class="relative p-4 rounded-lg border bg-gray-50 border-gray-200">
                <div class="flex items-center justify-between mb-2">
                  <div class="w-9 h-9 bg-gray-200 rounded-md animate-pulse"></div>
                  <div class="text-right">
                    <div class="h-8 bg-gray-200 rounded-md w-8 animate-pulse"></div>
                  </div>
                </div>
                <div class="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
          
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid Skeleton */}
      <div class="grid lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div class="lg:col-span-2 space-y-6">
          {/* Created Startups Skeleton */}
          <Card class="w-full">
            <CardHeader>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div class="h-6 bg-gray-200 rounded-md w-48 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div class="border border-gray-200 rounded-lg p-4 bg-white">
                    <div class="flex justify-between items-start mb-3">
                      <div class="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                      <div class="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    
                    <div class="h-4 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
                    <div class="h-4 bg-gray-200 rounded-md w-3/4 mb-3 animate-pulse"></div>
                    
                    <div class="flex flex-wrap gap-1 mb-3">
                      <div class="h-5 bg-gray-200 rounded-full w-12 animate-pulse"></div>
                      <div class="h-5 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                    </div>

                    <div class="flex justify-between items-center text-xs">
                      <div class="h-3 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                      <div class="h-3 bg-gray-200 rounded-md w-8 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Participating Startups Skeleton */}
          <Card class="w-full">
            <CardHeader>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div class="h-6 bg-gray-200 rounded-md w-52 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div class="border border-gray-200 rounded-lg p-4 bg-white">
                    <div class="flex justify-between items-start mb-3">
                      <div class="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                      <div class="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    
                    <div class="h-4 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
                    <div class="h-4 bg-gray-200 rounded-md w-3/4 mb-3 animate-pulse"></div>
                    
                    <div class="flex flex-wrap gap-1 mb-3">
                      <div class="h-5 bg-gray-200 rounded-full w-14 animate-pulse"></div>
                      <div class="h-5 bg-gray-200 rounded-full w-18 animate-pulse"></div>
                    </div>

                    <div class="flex justify-between items-center">
                      <div class="h-3 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                        <div class="h-3 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - 1/3 width */}
        <div class="space-y-6">
          {/* User Tags Skeleton */}
          <Card class="w-full">
            <CardHeader>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div class="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div class="h-7 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Startup Requests Skeleton */}
          <Card class="w-full">
            <CardHeader>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div class="h-6 bg-gray-200 rounded-md w-40 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div class="border border-gray-200 rounded-lg p-4 bg-white">
                    <div class="flex justify-between items-start mb-3">
                      <div class="flex items-center gap-2">
                        <div class="h-5 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                        <div class="h-4 bg-gray-200 rounded-md w-12 animate-pulse"></div>
                      </div>
                      <div class="h-3 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="h-4 bg-gray-200 rounded-md w-20 mb-2 animate-pulse"></div>
                      <div class="space-y-2">
                        <div class="h-3 bg-gray-200 rounded-md w-full animate-pulse"></div>
                        <div class="h-3 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}