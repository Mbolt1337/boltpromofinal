// frontend/src/components/search/SearchFilters.tsx
'use client'

import { Search, Tag, Store, Grid3X3, SortDesc, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SearchResult } from '@/lib/search'

interface SearchFiltersProps {
  query: string
  type: string
  totalResults: number
  results: SearchResult
}

export default function SearchFilters({ query, type, totalResults, results }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Функция для изменения URL с параметрами
  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all' && key === 'type') {
      params.delete('type')
    } else {
      params.set(key, value)
    }
    
    // Сбрасываем страницу при изменении фильтров
    params.delete('page')
    
    const queryString = params.toString()
    const newUrl = `/search${queryString ? `?${queryString}` : ''}`
    router.push(newUrl)
  }

  // Подсчет результатов по типам
  const typeStats = {
    all: totalResults,
    promocodes: results.promocodes?.length || 0,
    stores: results.stores?.length || 0,
    categories: results.categories?.length || 0
  }

  // Варианты сортировки
  const sortOptions = [
    { value: 'relevance', label: 'По релевантности' },
    { value: 'popular', label: 'По популярности' },
    { value: 'recent', label: 'Сначала новые' },
    { value: 'expiring', label: 'Скоро истекают' }
  ]

  const currentSort = searchParams.get('sort') || 'relevance'

  return (
    <div className="glass-card p-6 mb-8">
      {/* Заголовок фильтров */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ease-out">
          <Filter className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Фильтры и сортировка</h3>
          <p className="text-gray-400 text-sm">
            Всего найдено: <span className="text-white font-medium">{totalResults}</span> результатов
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Типы результатов */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Тип результатов
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => updateSearchParams('type', 'all')}
              // unified hover/focus - добавил focus-visible + проверил transition
              className={`glass-button-small px-4 py-2 rounded-2xl text-sm font-medium gap-2 hover:scale-[1.02] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none ${
                type === 'all' || !type
                  ? 'bg-white/15 border-white/25 text-white shadow-glass scale-[1.02]'
                  : 'text-gray-300 hover:text-white hover:bg-white/8'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Все результаты</span>
              <span className="min-w-5 h-5 text-xs rounded-full bg-white/10 px-1.5 flex items-center justify-center">
                {typeStats.all}
              </span>
            </button>

            <button
              onClick={() => updateSearchParams('type', 'promocodes')}
              // unified hover/focus
              className={`glass-button-small px-4 py-2 rounded-2xl text-sm font-medium gap-2 hover:scale-[1.02] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none ${
                type === 'promocodes'
                  ? 'bg-green-500/15 border-green-500/25 text-green-300 shadow-glass scale-[1.02]'
                  : 'text-gray-300 hover:text-white hover:bg-white/8'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Промокоды</span>
              <span className="min-w-5 h-5 text-xs rounded-full bg-white/10 px-1.5 flex items-center justify-center">
                {typeStats.promocodes}
              </span>
            </button>

            <button
              onClick={() => updateSearchParams('type', 'stores')}
              // unified hover/focus
              className={`glass-button-small px-4 py-2 rounded-2xl text-sm font-medium gap-2 hover:scale-[1.02] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none ${
                type === 'stores'
                  ? 'bg-blue-500/15 border-blue-500/25 text-blue-300 shadow-glass scale-[1.02]'
                  : 'text-gray-300 hover:text-white hover:bg-white/8'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Магазины</span>
              <span className="min-w-5 h-5 text-xs rounded-full bg-white/10 px-1.5 flex items-center justify-center">
                {typeStats.stores}
              </span>
            </button>

            <button
              onClick={() => updateSearchParams('type', 'categories')}
              // unified hover/focus
              className={`glass-button-small px-4 py-2 rounded-2xl text-sm font-medium gap-2 hover:scale-[1.02] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none ${
                type === 'categories'
                  ? 'bg-purple-500/15 border-purple-500/25 text-purple-300 shadow-glass scale-[1.02]'
                  : 'text-gray-300 hover:text-white hover:bg-white/8'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Категории</span>
              <span className="min-w-5 h-5 text-xs rounded-full bg-white/10 px-1.5 flex items-center justify-center">
                {typeStats.categories}
              </span>
            </button>
          </div>
        </div>

        {/* Сортировка */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Сортировка
          </label>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateSearchParams('sort', option.value)}
                // unified hover/focus - добавил focus-visible + проверил transition
                className={`glass-button-small px-4 py-2 rounded-2xl text-sm font-medium gap-2 hover:scale-[1.02] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none ${
                  currentSort === option.value
                    ? 'bg-white/15 border-white/25 text-white shadow-glass scale-[1.02]'
                    : 'text-gray-300 hover:text-white hover:bg-white/8'
                }`}
              >
                <SortDesc className="w-4 h-4 transition-all duration-300 ease-out" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Быстрый сброс */}
        {(type !== 'all' && type) || currentSort !== 'relevance' ? (
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => {
                const params = new URLSearchParams()
                params.set('q', query)
                router.push(`/search?${params.toString()}`)
              }}
              // unified hover/focus
              className="text-sm text-gray-400 hover:text-white transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none rounded px-2 py-1"
            >
              Сбросить все фильтры
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}