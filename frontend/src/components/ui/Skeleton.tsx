// frontend/src/components/ui/Skeleton.tsx

import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}

export default function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  rounded = 'md',
  style,
  ...props
}: SkeletonProps) {
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  }

  const variantClasses = {
    default: 'h-4',
    card: 'h-32 rounded-xl',
    text: 'h-4 rounded',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 rounded-xl'
  }

  const combinedStyle = {
    width: width,
    height: height,
    ...style
  }

  return (
    <div
      className={cn(
        // Базовые стили для skeleton
        'animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
        // Стили варианта
        variantClasses[variant],
        // Закругление
        roundedClasses[rounded],
        className
      )}
      style={combinedStyle}
      {...props}
    />
  )
}

// Дополнительные компоненты Skeleton для удобства
export function SkeletonCard({ className, ...props }: Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('glass-card p-6 space-y-4', className)} {...props}>
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton variant="button" className="w-32" />
      </div>
    </div>
  )
}

export function SkeletonText({ 
  lines = 3, 
  className, 
  ...props 
}: Omit<SkeletonProps, 'variant'> & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? 'w-3/4' : 'w-full'} 
        />
      ))}
    </div>
  )
}

export function SkeletonList({ 
  items = 6, 
  className, 
  ...props 
}: Omit<SkeletonProps, 'variant'> & { items?: number }) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonGrid({ 
  items = 6, 
  columns = 3,
  className, 
  ...props 
}: Omit<SkeletonProps, 'variant'> & { items?: number; columns?: number }) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  return (
    <div className={cn('grid gap-6', gridClasses[columns as keyof typeof gridClasses] || 'grid-cols-3', className)} {...props}>
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// Skeleton для фильтров
export function SkeletonFilters({ className, ...props }: Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('glass-card p-6 space-y-6', className)} {...props}>
      {/* Заголовок и статистика */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
      
      {/* Кнопки фильтров */}
      <div className="flex items-center gap-4 overflow-x-auto">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-44 rounded-2xl flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}