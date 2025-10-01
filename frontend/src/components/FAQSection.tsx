'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, Filter, X, HelpCircle } from 'lucide-react'

interface FAQItem {
  id: number
  category: string
  question: string
  answer: string
}

interface FAQSectionProps {
  faqData: FAQItem[]
  categories: string[]
  searchParams?: {
    search?: string
    category?: string
  }
}

export default function FAQSection({ faqData, categories, searchParams }: FAQSectionProps) {
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.category || 'all')
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Дебаунс для поиска
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Фильтрация FAQ
  const filteredFAQ = useMemo(() => {
    let filtered = faqData

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Поиск по вопросу и ответу
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [faqData, selectedCategory, debouncedSearchQuery])

  // Подсветка найденных терминов
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400/30 text-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  // Переключение открытия/закрытия FAQ
  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  // Открыть все результаты поиска
  const openAllResults = () => {
    const allResultIds = new Set(filteredFAQ.map(item => item.id))
    setOpenItems(allResultIds)
  }

  // Закрыть все
  const closeAll = () => {
    setOpenItems(new Set())
  }

  // Сброс фильтров
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setOpenItems(new Set())
  }

  // Автооткрытие результатов поиска
  useEffect(() => {
    if (debouncedSearchQuery.trim() && filteredFAQ.length <= 3) {
      const allResultIds = new Set(filteredFAQ.map(item => item.id))
      setOpenItems(allResultIds)
    }
  }, [debouncedSearchQuery, filteredFAQ])

  return (
    <div className="space-y-8">
      {/* Поиск и фильтры */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          
          {/* Поиск */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по вопросам..."
                className="pl-12 pr-4 py-3 w-full glass-input rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Фильтр по категориям */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium text-sm">Категория:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 min-w-48"
            >
              <option value="all" className="bg-gray-800 text-white">Все категории</option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-gray-800 text-white">
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Управление аккордеоном */}
          {filteredFAQ.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={openAllResults}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-gray-300 hover:text-white transition-all duration-300"
              >
                Открыть все
              </button>
              <button
                onClick={closeAll}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-gray-300 hover:text-white transition-all duration-300"
              >
                Закрыть все
              </button>
            </div>
          )}
        </div>

        {/* Индикатор активных фильтров */}
        {(searchQuery.trim() || selectedCategory !== 'all') && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                Найдено: <span className="text-white font-semibold">{filteredFAQ.length}</span> {
                  filteredFAQ.length === 1 ? 'вопрос' : 
                  filteredFAQ.length < 5 ? 'вопроса' : 'вопросов'
                }
              </div>
              
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded text-gray-400 hover:text-white transition-all duration-300"
              >
                <X className="w-4 h-4" />
                <span>Сбросить</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Результаты */}
      {filteredFAQ.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-4">
            Вопросы не найдены
          </h3>
          <p className="text-gray-400 mb-6">
            Попробуйте изменить поисковый запрос или выбрать другую категорию
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
          >
            Показать все вопросы
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFAQ.map((item) => {
            const isOpen = openItems.has(item.id)
            
            return (
              <div
                key={item.id}
                className="glass-card border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                {/* Заголовок вопроса */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-300"
                >
                  <div className="flex-1 pr-4">
                    {/* Категория */}
                    <div className="inline-flex items-center px-2 py-1 bg-white/10 border border-white/20 rounded text-gray-300 text-xs font-medium mb-3">
                      {item.category}
                    </div>
                    
                    {/* Вопрос */}
                    <h3 className="text-lg font-semibold text-white leading-tight">
                      {highlightText(item.question, debouncedSearchQuery)}
                    </h3>
                  </div>
                  
                  {/* Иконка */}
                  <div className="flex-shrink-0 ml-4">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Ответ */}
                {isOpen && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-gray-300 leading-relaxed">
                        {highlightText(item.answer, debouncedSearchQuery)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Подсказка */}
      {searchQuery.trim() && filteredFAQ.length > 0 && filteredFAQ.length <= 3 && (
        <div className="glass-card p-4 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <p className="text-blue-300 text-sm">
              Найдено немного результатов. Вопросы автоматически раскрыты для удобства.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}