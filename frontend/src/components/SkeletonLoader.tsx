// Skeleton компоненты для загрузки

export function StorePageSkeleton() {
  return (
    <div className="glass-card p-6 animate-shimmer">
      <div className="h-8 bg-white/10 rounded w-48 mb-4"></div>
      <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-2/3"></div>
    </div>
  )
}

export function StoreGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass-card p-6 animate-shimmer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-16"></div>
            </div>
          </div>
          <div className="h-4 bg-white/10 rounded w-full mb-3"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

export function StoreStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="glass-card p-6 text-center animate-shimmer">
          <div className="w-8 h-8 bg-white/10 rounded-lg mx-auto mb-3"></div>
          <div className="h-6 bg-white/10 rounded w-16 mx-auto mb-1"></div>
          <div className="h-4 bg-white/10 rounded w-20 mx-auto"></div>
        </div>
      ))}
    </div>
  )
}