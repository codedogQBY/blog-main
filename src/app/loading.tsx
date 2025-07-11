export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Skeleton */}
      <div className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="w-32 h-8 loading-skeleton rounded" />
          <div className="flex space-x-4">
            <div className="w-16 h-8 loading-skeleton rounded" />
            <div className="w-16 h-8 loading-skeleton rounded" />
            <div className="w-16 h-8 loading-skeleton rounded" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Article Cards Skeleton */}
          <div className="md:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="w-3/4 h-6 loading-skeleton rounded" />
                <div className="w-full h-4 loading-skeleton rounded" />
                <div className="w-2/3 h-4 loading-skeleton rounded" />
                <div className="flex space-x-2">
                  <div className="w-16 h-6 loading-skeleton rounded-full" />
                  <div className="w-16 h-6 loading-skeleton rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="w-20 h-6 loading-skeleton rounded mb-4" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-4 loading-skeleton rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}