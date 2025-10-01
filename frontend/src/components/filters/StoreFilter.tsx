'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, SortAsc, RotateCcw, Star } from 'lucide-react'
import { STORE_SORT_OPTIONS } from '@/types'

interface StoreFilterProps {
  totalResults: number
  className?: string
}

export default function StoreFilter({ totalResults, className = "" }: StoreFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name-asc') // ✅ ИЗМЕНЕНО: по умолчанию алфавитная сортировка
  const [minRating, setMinRating] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  // Инициализация из URL параметров
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setSortBy(searchParams.get('sort') || 'name-asc') // ✅ ИЗМЕНЕНО: дефолт name-asc
    setMinRating(searchParams.get('rating') || '')
  }, [searchParams])

  // Обновление URL при изменении фильтров
  const updateFilters = (newSearch: string, newSort: string, newRating: string) => {
    const params = new URLSearchParams()
    
    if (newSearch.trim()) {
      params.set('search', newSearch.trim())
    }
    
    // ✅ ИЗМЕНЕНО: убираем параметр sort только если он равен дефолтному 'name-asc'
    if (newSort !== 'name-asc') {
      params.set('sort', newSort)
    }

    if (newRating && newRating !== '') {
      params.set('rating', newRating)
    }

    // Сбрасываем страницу при изменении фильтров
    const queryString = params.toString()
    const newUrl = `/stores${queryString ? `?${queryString}` : ''}`
    
    router.push(newUrl)
  }

  // Обработчик поиска с debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        updateFilters(search, sortBy, minRating)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Обработчик изменения сортировки
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    updateFilters(search, newSort, minRating)
  }

  // Обработчик изменения рейтинга
  const handleRatingChange = (newRating: string) => {
    setMinRating(newRating)
    updateFilters(search, sortBy, newRating)
  }

  // Сброс всех фильтров
  const handleReset = () => {
    setSearch('')
    setSortBy('name-asc') // ✅ ИЗМЕНЕНО: сброс к алфавитной сортировке
    setMinRating('')
    router.push('/stores')
  }

  // ✅ ИЗМЕНЕНО: проверяем активные фильтры относительно нового дефолта
  const hasActiveFilters = search.trim() || sortBy !== 'name-asc' || minRating

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
              placeholder="Поиск по магазинам..."
              className="pl-12 pr-4 py-3 w-full glass-input rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Количество результатов */}
        <div className="text-gray-400 text-sm lg:text-base">
          Найдено: <span className="text-white font-semibold">{totalResults}</span> {
            totalResults === 1 ? 'магазин' : 
            totalResults < 5 ? 'магазина' : 'магазинов'
          }
        </div>

        {/* Фильтр по рейтингу */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-400" />
            <span className="text-white font-medium text-sm">Рейтинг:</span>
          </div>
          
          <select
            value={minRating}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="glass-input px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 min-w-32"
          >
            <option value="" className="bg-gray-800 text-white">Любой</option>
            <option value="4.5" className="bg-gray-800 text-white">4.5+ ⭐</option>
            <option value="4.0" className="bg-gray-800 text-white">4.0+ ⭐</option>
            <option value="3.5" className="bg-gray-800 text-white">3.5+ ⭐</option>
            <option value="3.0" className="bg-gray-800 text-white">3.0+ ⭐</option>
          </select>
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
            {STORE_SORT_OPTIONS.map((option) => (
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

        {/* Кнопка для мобильного разворачивания */}
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
            <label className="block text-white font-medium mb-2">Минимальный рейтинг</label>
            <select
              value={minRating}
              onChange={(e) => handleRatingChange(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10"
            >
              <option value="" className="bg-gray-800">Любой рейтинг</option>
              <option value="4.5" className="bg-gray-800">4.5+ звезд</option>
              <option value="4.0" className="bg-gray-800">4.0+ звезд</option>
              <option value="3.5" className="bg-gray-800">3.5+ звезд</option>
              <option value="3.0" className="bg-gray-800">3.0+ звезд</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full glass-input px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10"
            >
              {STORE_SORT_OPTIONS.map((option) => (
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