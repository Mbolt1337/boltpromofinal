'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  current?: string
  className?: string
}

// Skeleton для хлебных крошек
function BreadcrumbsSkeleton() {
  return (
    <nav className="flex items-center space-x-2 py-2">
      <div className="flex items-center space-x-2">
        <div className="w-16 h-4 bg-white/10 rounded animate-shimmer"></div>
        <ChevronRight className="w-4 h-4 text-gray-500" />
        <div className="w-20 h-4 bg-white/10 rounded animate-shimmer"></div>
        <ChevronRight className="w-4 h-4 text-gray-500" />
        <div className="w-24 h-4 bg-white/10 rounded animate-shimmer"></div>
      </div>
    </nav>
  )
}

export { BreadcrumbsSkeleton }

export default function Breadcrumbs({ items, current, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null

  return (
    <nav
      aria-label="Навигация"
      className={`flex flex-wrap items-center gap-y-2 text-sm py-2 ${className}`}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-500 mx-2 flex-shrink-0" />
          )}

          {!item.href || index === items.length - 1 ? (
            // Текущая страница (не кликабельная)
            <span className="glass-button-small px-3 py-1.5 text-white font-semibold flex items-center gap-2 rounded-xl">
              {item.icon}
              {index === 0 && !item.icon && <Home className="w-4 h-4" />}
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{item.label}</span>
            </span>
          ) : (
            // Кликабельная ссылка
            <Link
              href={item.href}
              className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 hover:scale-105 group"
            >
              {item.icon}
              {index === 0 && !item.icon && (
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              )}
              <span className="truncate max-w-[120px] sm:max-w-[200px] group-hover:translate-x-0.5 transition-transform duration-300">
                {item.label}
              </span>
            </Link>
          )}
        </div>
      ))}

      {/* Дополнительная информация о текущей странице */}
      {current && current !== items[items.length - 1]?.label && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-500 mx-2 flex-shrink-0" />
          <span className="glass-button-small px-3 py-1.5 text-white font-semibold rounded-xl truncate max-w-[120px] sm:max-w-[200px]">
            {current}
          </span>
        </>
      )}
    </nav>
  )
}