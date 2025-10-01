// frontend/src/components/cards/StoreCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Store as StoreIcon, Star, ExternalLink, Tag } from 'lucide-react'
import { type Store } from '@/lib/api'

interface StoreCardProps {
  store: Store
  showDescription?: boolean
  showRating?: boolean
  showPromocodeCount?: boolean
  layout?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Skeleton для загрузки
function StoreCardSkeleton({ layout = 'vertical', size = 'md' }: { layout?: 'horizontal' | 'vertical', size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'p-3 min-h-[100px]',
    md: 'p-4 min-h-[140px]',
    lg: 'p-6 min-h-[180px]'
  }
  
  if (layout === 'horizontal') {
    return (
      <div className={`glass-card animate-shimmer flex items-center gap-4 ${sizeClasses[size]}`}>
        <div className="w-12 h-12 bg-white/10 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-24"></div>
          <div className="h-3 bg-white/10 rounded w-16"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`glass-card animate-shimmer ${sizeClasses[size]}`}>
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 bg-white/10 rounded-xl"></div>
        <div className="space-y-2 w-full">
          <div className="h-4 bg-white/10 rounded w-20 mx-auto"></div>
          <div className="h-3 bg-white/10 rounded w-16 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

// Компонент звездочек рейтинга
function StarRating({ rating, maxRating = 5, size = 'sm' }: { rating: number, maxRating?: number, size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  const stars = []
  
  for (let i = 1; i <= maxRating; i++) {
    if (i <= rating) {
      stars.push(
        <Star key={i} className={`${sizeClasses[size]} text-yellow-400 fill-current`} />
      )
    } else if (i - 0.5 <= rating) {
      stars.push(
        <div key={i} className={`relative ${sizeClasses[size]}`}>
          <Star className={`${sizeClasses[size]} text-gray-400 absolute`} />
          <Star className={`${sizeClasses[size]} text-yellow-400 fill-current`} style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      )
    } else {
      stars.push(
        <Star key={i} className={`${sizeClasses[size]} text-gray-400`} />
      )
    }
  }
  
  return (
    <div className="flex items-center gap-0.5">
      {stars}
      <span className="text-xs text-gray-400 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

export { StoreCardSkeleton, StarRating }

export default function StoreCard({ 
  store, 
  showDescription = true,
  showRating = true,
  showPromocodeCount = true,
  layout = 'vertical',
  size = 'md',
  className = "" 
}: StoreCardProps) {
  // Классы в зависимости от размера
  const sizeClasses = {
    sm: layout === 'horizontal' ? 'p-3 min-h-[80px]' : 'p-3 min-h-[120px]',
    md: layout === 'horizontal' ? 'p-4 min-h-[100px]' : 'p-4 min-h-[140px]',
    lg: layout === 'horizontal' ? 'p-6 min-h-[120px]' : 'p-6 min-h-[180px]'
  }
  
  const logoSizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  
  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const descriptionSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  
  // Рендер горизонтального лейаута
  if (layout === 'horizontal') {
    return (
      <Link
        href={`/stores/${store.slug}`}
        className={`glass-card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden group flex items-center gap-4 ${sizeClasses[size]} ${className}`}
      >
        {/* Логотип */}
        <div className={`${logoSizes[size]} rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/15 transition-all duration-300`}>
          {store.logo ? (
            <Image
              src={store.logo}
              alt={store.name}
              width={48}
              height={48}
              className="w-full h-full object-cover rounded-lg"
              unoptimized
            />
          ) : (
            <StoreIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Содержимое */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-white leading-tight truncate mb-1 group-hover:text-blue-300 transition-colors ${titleSizes[size]}`}>
            {store.name}
          </h3>
          
          <div className="flex items-center gap-3">
            {/* Рейтинг */}
            {showRating && store.rating && (
              <StarRating rating={store.rating} size="sm" />
            )}
            
            {/* Количество промокодов */}
            {showPromocodeCount && store.promocodes_count !== undefined && (
              <span className="text-gray-400 text-xs">
                {store.promocodes_count} промокодов
              </span>
            )}
          </div>
        </div>

        {/* Hover эффект */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-blue-500/5 to-purple-500/5 group-hover:opacity-100"></div>
      </Link>
    )
  }
  
  // Рендер вертикального лейаута
  return (
    <Link
      href={`/stores/${store.slug}`}
      className={`glass-card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden group ${sizeClasses[size]} ${className}`}
    >
      <div className="flex flex-col items-center text-center h-full relative z-10">
        {/* Логотип */}
        <div className={`${logoSizes[size]} rounded-xl overflow-hidden flex items-center justify-center mb-3 flex-shrink-0 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/15 group-hover:transform group-hover:translateY(-2px) transition-all duration-300`}>
          {store.logo ? (
            <Image
              src={store.logo}
              alt={store.name}
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-lg"
              unoptimized
            />
          ) : (
            <StoreIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Информация */}
        <div className="flex-1 w-full space-y-2">
          <h3 className={`font-semibold text-white leading-tight truncate group-hover:text-blue-300 transition-colors ${titleSizes[size]}`}>
            {store.name}
          </h3>
          
          {/* Описание */}
          {showDescription && store.description && size !== 'sm' && (
            <p className={`text-gray-400 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors ${descriptionSizes[size]}`}>
              {store.description}
            </p>
          )}
          
          {/* Метрики */}
          <div className="space-y-1">
            {/* Рейтинг */}
            {showRating && store.rating && (
              <div className="flex justify-center">
                <StarRating rating={store.rating} size="sm" />
              </div>
            )}
            
            {/* Количество промокодов */}
            {showPromocodeCount && store.promocodes_count !== undefined && (
              <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors">
                {store.promocodes_count} {store.promocodes_count === 1 ? 'промокод' : 'промокодов'}
              </p>
            )}
            
            {/* Категории */}
            {store.categories && store.categories.length > 0 && size === 'lg' && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {store.categories.slice(0, 2).map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-400 text-xs"
                  >
                    <Tag className="w-3 h-3" />
                    {category.name}
                  </span>
                ))}
                {store.categories.length > 2 && (
                  <span className="text-xs text-gray-500">+{store.categories.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover эффект */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:opacity-100"></div>
    </Link>
  )
}