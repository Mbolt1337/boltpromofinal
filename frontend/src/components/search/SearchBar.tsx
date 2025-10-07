'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Command, Tag, Store, Grid3X3, Flame, Clock } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { searchSuggestions, saveSearchQuery, getRecentSearchQueries } from '@/lib/search'

interface SearchBarProps {
  placeholder?: string
  className?: string
  isMobile?: boolean
  onClose?: () => void
  showHotkey?: boolean
}

interface SearchSuggestion {
  id: string
  type: 'promocode' | 'store' | 'category'
  title: string
  subtitle?: string
  icon?: React.ReactNode
  href: string
  isHot?: boolean
  relevance: number
}

export default function SearchBar({ 
  placeholder = "Поиск промокодов, магазинов, категорий...", 
  className = "",
  isMobile = false,
  onClose,
  showHotkey = true
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Популярные запросы
  const popularQueries = [
    { text: 'техника', icon: <Grid3X3 className="w-4 h-4" /> },
    { text: 'одежда', icon: <Tag className="w-4 h-4" /> },
    { text: 'красота', icon: <Tag className="w-4 h-4" /> },
    { text: 'еда', icon: <Tag className="w-4 h-4" /> },
    { text: 'путешествия', icon: <Tag className="w-4 h-4" /> },
    { text: 'горячие', icon: <Flame className="w-4 h-4 text-orange-400" /> }
  ]

  // Инициализация значения из URL
  useEffect(() => {
    const searchQuery = searchParams.get('q') || ''
    setQuery(searchQuery)
    
    // Загружаем recent searches
    setRecentSearches(getRecentSearchQueries())
  }, [searchParams])

  // Горячие клавиши (только Ctrl+K и ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K или Cmd+K для фокуса на поиске
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsExpanded(true)
      }
      
      // ESC для закрытия
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault()
        handleBlur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  // Debounced поиск подсказок
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const results = await searchSuggestions(query, 8)
        setSuggestions(results)
      } catch (error) {
        console.error('Ошибка поиска подсказок:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (searchQuery: string, saveToHistory = true) => {
    if (!searchQuery.trim()) {
      router.push('/categories')
      return
    }

    // Сохраняем в историю
    if (saveToHistory) {
      saveSearchQuery(searchQuery.trim())
      setRecentSearches(getRecentSearchQueries()) // Обновляем локальное состояние
    }

    // Переход на страницу поиска
    const params = new URLSearchParams()
    params.set('q', searchQuery.trim())
    router.push(`/search?${params.toString()}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
    handleBlur()
    
    // Закрываем мобильное меню
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Для прямых ссылок на категории/магазины
    if (suggestion.type !== 'promocode') {
      router.push(suggestion.href)
    } else {
      // Для промокодов - переходим на поиск
      setQuery(suggestion.title)
      handleSearch(suggestion.title)
    }
    handleBlur()
  }

  const handlePopularQueryClick = (queryText: string) => {
    setQuery(queryText)
    handleSearch(queryText)
    handleBlur()
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setIsExpanded(false)
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleFocus = () => {
    setIsExpanded(true)
  }

  const handleBlur = () => {
    // Задержка для возможности клика по подсказкам
    setTimeout(() => {
      setIsExpanded(false)
      setSuggestions([])
    }, 200)
  }

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem('boltpromo_recent_searches')
      setRecentSearches([])
    } catch (error) {
      console.warn('Не удалось очистить историю')
    }
  }

  return (
    <div className={`relative ${className}`} data-testid="search-bar">
      <form onSubmit={handleSubmit}>
        <div className={`relative transition-all duration-300 ease-out ${
          isExpanded && !isMobile ? 'scale-105' : ''
        }`}>
          {/* Иконка поиска */}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300 ease-out" />
          
          {/* ИСПРАВЛЕНО: Возвращаю обычную строку поиска */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`
              pl-12 pr-20 py-3 w-full glass-input rounded-xl text-white
              placeholder:text-gray-400 transition-all duration-300 ease-out
              focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none
              ${isMobile ? 'w-full' : 'w-64 focus:w-80'}
              ${isExpanded ? 'bg-white/8' : 'bg-white/5'}
            `}
            autoComplete="off"
            spellCheck={false}
            data-testid="search-input"
          />

          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {/* Горячая клавиша */}
          {showHotkey && !isMobile && !isExpanded && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-gray-500 text-xs">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}

          {/* Кнопка очистки - unified hover/focus */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all duration-300 ease-out hover:scale-110 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              aria-label="Очистить поиск"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors duration-300 ease-out" />
            </button>
          )}
        </div>

        {/* Скрытая кнопка отправки */}
        <button type="submit" className="sr-only">Поиск</button>
      </form>

      {/* Dark theme dropdown */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1115]/95 border border-white/10 rounded-xl z-50 max-h-96 overflow-hidden shadow-2xl backdrop-blur-md" data-testid="search-dropdown">
          
          {/* Результаты поиска */}
          {query.trim() && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-gray-400 text-xs uppercase font-medium mb-2 px-2">
                Результаты поиска
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    // unified hover/focus - исправил scale и добавил focus
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-300 ease-out hover:bg-white/10 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
                  >
                    {/* Иконка типа */}
                    <div className="flex-shrink-0">
                      {suggestion.type === 'promocode' && <Tag className="w-4 h-4 text-green-400" />}
                      {suggestion.type === 'store' && <Store className="w-4 h-4 text-blue-400" />}
                      {suggestion.type === 'category' && <Grid3X3 className="w-4 h-4 text-purple-400" />}
                      {suggestion.isHot && <Flame className="w-3 h-3 text-orange-400 ml-1" />}
                    </div>
                    
                    {/* Содержимое */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate transition-colors duration-300 ease-out">
                        {suggestion.title}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-gray-400 text-sm truncate transition-colors duration-300 ease-out">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>

                    {/* Тип */}
                    <div className="text-gray-500 text-xs bg-white/5 px-2 py-1 rounded">
                      {suggestion.type === 'promocode' && 'промокод'}
                      {suggestion.type === 'store' && 'магазин'}
                      {suggestion.type === 'category' && 'категория'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Загрузка */}
          {query.trim() && isLoading && (
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                <span className="text-sm">Поиск...</span>
              </div>
            </div>
          )}

          {/* Нет результатов */}
          {query.trim() && !isLoading && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <div className="text-gray-400 text-sm mb-3">
                По запросу &ldquo;{query}&rdquo; ничего не найдено
              </div>
              <button
                onClick={() => handleSearch(query)}
                // unified hover/focus
                className="text-blue-400 hover:text-blue-300 text-sm transition-all duration-300 ease-out hover:scale-105 px-3 py-1 rounded-lg hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              >
                Искать на всем сайте
              </button>
            </div>
          )}

          {/* История поиска */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-2 border-b border-white/10">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="text-gray-400 text-xs uppercase font-medium">
                  Последние запросы
                </div>
                <button
                  onClick={clearRecentSearches}
                  // unified hover/focus
                  className="text-gray-500 hover:text-gray-300 text-xs transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
                >
                  Очистить
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularQueryClick(recentQuery)}
                    // unified hover/focus
                    className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-white/10 transition-all duration-300 ease-out hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300 text-sm">{recentQuery}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Популярные запросы */}
          {!query.trim() && (
            <div className="p-2">
              <div className="text-gray-400 text-xs uppercase font-medium mb-2 px-2">
                Популярные запросы
              </div>
              <div className="grid grid-cols-2 gap-1">
                {popularQueries.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularQueryClick(item.text)}
                    // unified hover/focus
                    className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-white/10 transition-all duration-300 ease-out hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
                  >
                    {item.icon}
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}