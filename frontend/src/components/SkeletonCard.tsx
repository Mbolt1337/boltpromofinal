export function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-white/10 rounded-xl" />
        <div className="flex-1">
          <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-11 bg-white/10 rounded-xl flex-1" />
        <div className="h-11 bg-white/10 rounded-xl w-24" />
      </div>
    </div>
  );
}

export function SkeletonPromoCard() {
  return (
    <div className="glass-card p-6 animate-shimmer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-white/10 rounded-lg" />
          <div>
            <div className="h-4 bg-white/10 rounded w-24 mb-2" />
            <div className="h-3 bg-white/10 rounded w-16" />
          </div>
        </div>
        <div className="w-16 h-6 bg-white/10 rounded-full" />
      </div>

      <div className="mb-4">
        <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-4 bg-white/10 rounded w-full mb-1" />
        <div className="h-4 bg-white/10 rounded w-5/6" />
      </div>

      <div className="flex gap-3">
        <div className="h-11 bg-white/10 rounded-xl flex-1" />
        <div className="h-11 bg-white/10 rounded-xl flex-1" />
      </div>
    </div>
  );
}

export function SkeletonShowcaseCard() {
  return (
    <div className="glass-card p-6 animate-shimmer">
      <div className="h-40 bg-white/10 rounded-xl mb-4" />
      <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-4 bg-white/10 rounded w-full mb-1" />
      <div className="h-4 bg-white/10 rounded w-4/5 mb-4" />
      <div className="h-10 bg-white/10 rounded-xl w-full" />
    </div>
  );
}

export function SkeletonStoreCard() {
  return (
    <div className="glass-card p-4 animate-shimmer">
      <div className="flex items-center gap-3 md:flex-col md:text-center">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl flex-shrink-0" />
        <div className="flex-1 md:w-full">
          <div className="h-4 bg-white/10 rounded w-24 mx-auto mb-2" />
          <div className="h-3 bg-white/10 rounded w-16 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCarousel({ count = 3 }: { count?: number }) {
  return (
    <div className="overflow-hidden">
      <div className="flex gap-4 pb-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="shrink-0 w-[320px] xs:w-[340px] sm:w-[360px]">
            <SkeletonPromoCard />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, type = 'promo' }: { count?: number; type?: 'promo' | 'store' | 'showcase' }) {
  const Card = type === 'promo' ? SkeletonPromoCard : type === 'store' ? SkeletonStoreCard : SkeletonShowcaseCard;

  return (
    <div className={type === 'store' ? 'store-grid' : type === 'showcase' ? 'category-grid' : 'promo-grid-enhanced'}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}
