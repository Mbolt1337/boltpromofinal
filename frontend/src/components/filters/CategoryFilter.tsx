// src/components/filters/CategoryFilter.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, SortAsc, RotateCcw } from 'lucide-react'
import { CATEGORY_SORT_OPTIONS } from '@/types'

interface CategoryFilterProps {
  totalResults: number
  className?: string
}

export default function CategoryFilter({ totalResults, className = "" }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [isExpanded, setIsExpanded] = useState(false)

  // Инициализация из URL параметров
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setSortBy(searchParams.get('sort') || 'popular')
  }, [searchParams])

  // Обновление URL при изменении фильтров
  const updateFilters = (newSearch: string, newSort: string) => {
    const params = new URLSearchParams()
    
    if (newSearch.trim()) {
      params.set('search', newSearch.trim())
    }
    
    if (newSort !== 'popular') {
      params.set('sort', newSort)
    }

    // Сбрасываем страницу при изменении фильтров
    if (searchParams.get('page') && searchParams.get('page') !== '1') {
      // Страница сбросится автоматически, так как мы не устанавливаем page параметр
    }

    const queryString = params.toString()
    const newUrl = `/categories${queryString ? `?${queryString}` : ''}`
    
    router.push(newUrl)
  }

  // Обработчик поиска с debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        updateFilters(search, sortBy)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Обработчик изменения сортировки
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    updateFilters(search, newSort)
  }

  // Сброс всех фильтров
  const handleReset = () => {
    setSearch('')
    setSortBy('popular')
    router.push('/categories')
  }

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = search.trim() || sortBy !== 'popular'

  return (
    <div className={`glass-card p-6 mb-8 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Поиск */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по категориям..."
              className="pl-12 pr-4 py-3 w-full glass-input rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Количество результатов */}
        <div className="text-gray-400 text-sm lg:text-base">
          Найдено: <span className="text-white font-semibold">{totalResults}</span> {
            totalResults === 1 ? 'категория' : 
            totalResults < 5 ? 'категории' : 'категорий'
          }
        </div>

        {/* Сортировка */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SortAsc className="w-5 h-5 text-gray-400" />
            <span className="text-white font-medium text-sm">Сортировка:</span>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="glass-input px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 min-w-48"
          >
            {CATEGORY_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопка сброса фильтров */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-gray-400 hover:text-white transition-all duration-300"
            title="Сбросить все фильтры"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Сбросить</span>
          </button>
        )}

        {/* Кнопка для мобильного разворачивания (если нужно) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
        >
          <Filter className="w-4 h-4" />
          <span>Фильтры</span>
        </button>
      </div>

      {/* Мобильное развернутое состояние */}
      {isExpanded && (
        <div className="lg:hidden mt-6 pt-6 border-t border-white/10 space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10"
            >
              {CATEGORY_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Сбросить фильтры</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}