'use client'

import Link from 'next/link'
import { Category } from '@/lib/api'
import { getCategoryIcon } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Skeleton для загрузки
function CategoryCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'p-4 min-h-[120px]',
    md: 'p-6 min-h-[160px]',
    lg: 'p-8 min-h-[200px]'
  }
  
  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }
  
  return (
    <div className={`glass-card animate-shimmer ${sizeClasses[size]}`}>
      <div className="flex flex-col items-center text-center">
        <div className={`${iconSizes[size]} bg-white/10 rounded-2xl mb-4`}></div>
        <div className="h-6 bg-white/10 rounded w-24 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-16"></div>
      </div>
    </div>
  )
}

export { CategoryCardSkeleton }

export default function CategoryCard({ 
  category, 
  showDescription = true, 
  size = 'md',
  className = "" 
}: CategoryCardProps) {
  // Используем централизованную функцию для получения иконки
  const IconComponent = getCategoryIcon(category.icon || category.slug)
  
  // Классы в зависимости от размера
  const sizeClasses = {
    sm: 'p-4 min-h-[120px]',
    md: 'p-6 min-h-[160px]',
    lg: 'p-8 min-h-[200px]'
  }
  
  const iconWrapperSizes = {
    sm: 'w-12 h-12 rounded-xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-20 h-20 rounded-3xl'
  }
  
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }
  
  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  return (
    <Link
      href={`/categories/${category.slug}`}
      // unified hover/focus - используем готовые классы из globals.css + добавляем unified focus
      className={`glass-card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none ${sizeClasses[size]} ${className}`}
    >
      <div className="flex flex-col items-center text-center h-full relative z-10">
        {/* Иконка - unified hover/focus */}
        <div className={`${iconWrapperSizes[size]} flex items-center justify-center mb-4 flex-shrink-0 bg-white/5 border border-white/10 transition-all duration-300 ease-out group-hover:bg-white/10 group-hover:border-white/15 group-hover:-translate-y-0.5 group-hover:scale-110`}>
          <IconComponent className={`${iconSizes[size]} text-white transition-all duration-300 ease-out group-hover:scale-110`} />
        </div>
        
        {/* Информация */}
        <div className="flex-1 min-w-0 w-full">
          {/* unified hover/focus - добавлены transition для плавности */}
          <h3 className={`font-semibold text-white leading-tight mb-2 group-hover:text-blue-300 transition-colors duration-300 ease-out ${titleSizes[size]}`}>
            {category.name}
          </h3>
          
          {/* Количество промокодов - unified hover/focus */}
          {category.promocodes_count !== undefined && (
            <p className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors duration-300 ease-out">
              {category.promocodes_count} {category.promocodes_count === 1 ? 'промокод' : 'промокодов'}
            </p>
          )}
          
          {/* Описание - unified hover/focus */}
          {showDescription && category.description && size !== 'sm' && (
            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed group-hover:text-gray-400 transition-colors duration-300 ease-out">
              {category.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Hover эффект - unified hover/focus */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out pointer-events-none bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:opacity-100"></div>
    </Link>
  )
}