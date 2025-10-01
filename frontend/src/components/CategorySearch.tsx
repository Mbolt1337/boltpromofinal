'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface CategorySearchProps {
  currentSort?: string
}

export default function CategorySearch({ currentSort = 'new' }: CategorySearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  // Инициализация из URL при монтировании
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  // ИСПРАВЛЕНО: Дебаунс для поиска с сохранением всех параметров
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') || ''
      
      // Обновляем URL только если поиск действительно изменился
      if (searchQuery.trim() !== currentSearch) {
        const params = new URLSearchParams(searchParams.toString())
        
        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim())
        } else {
          params.delete('search')
        }
        
        // ИСПРАВЛЕНО: Сбрасываем page при изменении поиска
        params.delete('page')
        
        // ИСПРАВЛЕНО: Сохраняем сортировку
        if (currentSort && currentSort !== 'new') {
          params.set('sort', currentSort)
        } else {
          params.delete('sort')
        }
        
        const queryString = params.toString()
        const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`
        
        router.replace(newUrl)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, currentSort, router, searchParams])

  // ИСПРАВЛЕНО: Очистка поиска с сохранением сортировки
  const clearSearch = () => {
    setSearchQuery('')
    
    // Немедленно обновляем URL без search, но с сохранением сортировки
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('page')
    
    // Сохраняем сортировку
    if (currentSort && currentSort !== 'new') {
      params.set('sort', currentSort)
    } else {
      params.delete('sort')
    }
    
    const queryString = params.toString()
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`
    
    router.replace(newUrl)
  }

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* ИСПРАВЛЕНО: Улучшенный поиск */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Поиск промокодов в категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 focus:bg-white/8"
            />
            
            {/* ИСПРАВЛЕНО: Кнопка очистки внутри input */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors duration-300 rounded-full hover:bg-white/10 p-0.5"
                title="Очистить поиск"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* ИСПРАВЛЕНО: Отдельная кнопка очистки только на мобильных */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="sm:hidden px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-gray-400 hover:text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>Очистить</span>
          </button>
        )}
      </div>
      
      {/* ИСПРАВЛЕНО: Подсказка о поиске */}
      {searchQuery.length > 0 && searchQuery.length < 3 && (
        <div className="mt-3 text-gray-500 text-sm">
          Введите минимум 3 символа для поиска
        </div>
      )}
    </div>
  )
}