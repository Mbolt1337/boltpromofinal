'use client'

import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { forwardRef } from 'react'

interface ChipProps {
  icon?: LucideIcon
  label: string
  count?: number
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  href?: string
  className?: string
  ariaLabel?: string
}

const Chip = forwardRef<HTMLElement, ChipProps>(({
  icon: Icon,
  label,
  count,
  active = false,
  disabled = false,
  onClick,
  href,
  className = '',
  ariaLabel
}, ref) => {
  // Базовые стили для чипа
  const baseClasses = `
    inline-flex items-center gap-2 h-10 px-4 rounded-2xl
    text-sm font-medium transition-all duration-300 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 
    focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `

  // Стили состояний
  const stateClasses = active
    ? `
        bg-white/15 border border-white/25 text-white shadow-glass scale-[1.02]
      `
    : `
        glass-button-small text-gray-300
        hover:text-white hover:bg-white/8 hover:border-white/15 
        hover:scale-[1.02] hover:shadow-glass
        active:scale-[0.98]
      `

  const finalClasses = `${baseClasses} ${stateClasses}`.trim()

  // Контент чипа
  const content = (
    <>
      {Icon && (
        <Icon className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className={`
          inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
          text-xs font-semibold rounded-full flex-shrink-0
          ${active 
            ? 'bg-white/25 text-white' 
            : 'bg-white/10 text-gray-400'
          }
        `}>
          {count}
        </span>
      )}
    </>
  )

  // Если есть href - рендерим как Link
  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={finalClasses}
        aria-label={ariaLabel || label}
        ref={ref as any}
      >
        {content}
      </Link>
    )
  }

  // Иначе рендерим как button
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={finalClasses}
      aria-label={ariaLabel || label}
      ref={ref as any}
    >
      {content}
    </button>
  )
})

Chip.displayName = 'Chip'

// Скелетон чипа
export function ChipSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`
      inline-flex items-center gap-2 h-10 px-4 rounded-2xl
      glass-button-small animate-shimmer ${className}
    `}>
      {/* Иконка скелетон */}
      <div className="w-4 h-4 bg-white/10 rounded" />
      
      {/* Текст скелетон */}
      <div className="h-3 w-16 bg-white/10 rounded" />
      
      {/* Счетчик скелетон */}
      <div className="w-5 h-5 bg-white/10 rounded-full" />
    </div>
  )
}

export default Chip