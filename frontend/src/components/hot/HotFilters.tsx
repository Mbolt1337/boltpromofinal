// frontend/src/components/hot/HotFilters.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Flame, Clock, AlertTriangle, Timer, RotateCcw, ChevronDown } from 'lucide-react'

interface HotFiltersProps {
  totalHot: number
  totalExpiring: number
  totalActive: number
  className?: string
}

const sortOptions = [
  { value: 'urgency', label: 'По срочности' },
  { value: 'newest', label: 'Сначала новые' },
  { value: 'popular', label: 'По популярности' },
  { value: 'discount', label: 'Лучшие скидки' }
]

const urgencyFilters = [
  { 
    value: 'all', 
    label: 'Все предложения', 
    icon: Filter,
    description: 'Горячие и истекающие'
  },
  { 
    value: 'critical', 
    label: 'Критичные', 
    icon: AlertTriangle,
    description: 'Менее 6 часов'
  },
  { 
    value: 'urgent', 
    label: 'Срочные', 
    icon: Timer,
    description: 'Менее 24 часов'
  },
  { 
    value: 'hot', 
    label: 'Горячие', 
    icon: Flame,
    description: 'Отмечены как горячие'
  }
]

export default function HotFilters({ 
  totalHot, 
  totalExpiring, 
  totalActive,
  className = "" 
}: HotFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedUrgency, setSelectedUrgency] = useState(searchParams.get('urgency') || 'all')
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'urgency')
  const [isExpanded, setIsExpanded] = useState(false)

  // Синхронизация с URL
  useEffect(() => {
    setSelectedUrgency(searchParams.get('urgency') || 'all')
    setSelectedSort(searchParams.get('sort') || 'urgency')
  }, [searchParams])

  // Обновление URL при изменении фильтров
  const updateFilters = (urgency: string, sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (urgency !== 'all') {
      params.set('urgency', urgency)
    } else {
      params.delete('urgency')
    }
    
    if (sort !== 'urgency') {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }

    // Сбрасываем страницу при изменении фильтров
    params.delete('page')

    const queryString = params.toString()
    const newUrl = `/hot${queryString ? `?${queryString}` : ''}`
    
    router.push(newUrl)
  }

  // Обработчик изменения срочности
  const handleUrgencyChange = (urgency: string) => {
    setSelectedUrgency(urgency)
    updateFilters(urgency, selectedSort)
  }

  // Обработчик изменения сортировки
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort)
    updateFilters(selectedUrgency, sort)
  }

  // Сброс фильтров
  const handleReset = () => {
    setSelectedUrgency('all')
    setSelectedSort('urgency')
    updateFilters('all', 'urgency')
  }

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = selectedUrgency !== 'all' || selectedSort !== 'urgency'

  // Получаем количество для каждого фильтра
  const getFilterCount = (filterValue: string) => {
    switch (filterValue) {
      case 'all': return totalActive
      case 'hot': return totalHot
      case 'critical': 
      case 'urgent': 
        return totalExpiring // Упрощенно, в реальности нужно считать точнее
      default: return 0
    }
  }

  // Получаем активную опцию сортировки
  const activeSortOption = sortOptions.find(option => option.value === selectedSort)

  return (
    <div className={`space-y-6 mb-8 ${className}`}>
      {/* Основная информационная карточка */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Информация о горячих промокодах */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">
              Горячие промокоды
            </h2>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-gray-400">
                  горячих: <span className="text-orange-400 font-semibold">{totalHot}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400">
                  истекают: <span className="text-yellow-400 font-semibold">{totalExpiring}</span>
                </span>
              </div>
              <div className="text-gray-400">
                всего: <span className="text-white font-semibold">{totalActive}</span>
              </div>
            </div>
          </div>

          {/* Сортировка для десктопа */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium text-sm">Сортировка:</span>
            </div>
            
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm px-4 py-3 pr-10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 min-w-48 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex items-center gap-3">
            {/* Кнопка сброса */}
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-sm rounded-xl text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
                title="Сбросить фильтры"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Сбросить</span>
              </button>
            )}

            {/* Кнопка для мобильного разворачивания */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-sm rounded-xl text-white transition-all duration-300"
            >
              <Filter className="w-4 h-4" />
              <span>Фильтры</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Мобильные фильтры */}
        {isExpanded && (
          <div className="lg:hidden mt-6 pt-6 border-t border-white/10">
            <div className="space-y-6">
              {/* Фильтр срочности */}
              <div>
                <label className="block text-white font-semibold mb-3">Тип предложений</label>
                <div className="grid grid-cols-1 gap-3">
                  {urgencyFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => handleUrgencyChange(filter.value)}
                      className={`flex items-center justify-between p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        selectedUrgency === filter.value
                          ? 'bg-white/15 border-white/30 text-white shadow-lg'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <filter.icon className="w-4 h-4" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{filter.label}</div>
                          <div className="text-xs text-gray-400">{filter.description}</div>
                        </div>
                      </div>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded">
                        {getFilterCount(filter.value)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Сортировка */}
              <div>
                <label className="block text-white font-semibold mb-3">Сортировка</label>
                <div className="relative">
                  <select
                    value={selectedSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm px-4 py-3 pr-10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Фильтры по срочности (десктоп) - ИСПРАВЛЕННЫЕ СТИЛИ */}
      <div className="hidden lg:block">
        {/* Контейнер с правильными отступами */}
        <div className="px-1"> {/* Добавляем небольшой отступ */}
          <div className="flex items-center gap-4 overflow-x-auto overflow-y-visible pb-2 -mx-1"> {/* Компенсируем отступ */}
            {urgencyFilters.map((filter, index) => {
              const count = getFilterCount(filter.value)
              const isActive = selectedUrgency === filter.value
              
              return (
                <button
                  key={filter.value}
                  onClick={() => handleUrgencyChange(filter.value)}
                  className={`group flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 whitespace-nowrap hover:scale-[1.02] active:scale-95 shadow-lg ${
                    isActive
                      ? 'bg-gradient-to-r from-white/20 to-white/10 border-white/30 text-white shadow-xl ring-1 ring-white/20'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 hover:text-white hover:shadow-xl'
                  } ${index === 0 ? 'ml-1' : ''} ${index === urgencyFilters.length - 1 ? 'mr-1' : ''}`} /* Отступы для первой и последней кнопки */
                >
                  {/* Иконка */}
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-gray-400 group-hover:bg-white/15 group-hover:text-white'
                  }`}>
                    <filter.icon className="w-4 h-4" />
                  </div>
                  
                  {/* Текст */}
                  <div className="text-left">
                    <div className="font-semibold text-sm leading-tight">{filter.label}</div>
                    <div className="text-xs text-gray-400 leading-tight mt-0.5">{filter.description}</div>
                  </div>
                  
                  {/* Счетчик */}
                  <div className={`flex items-center justify-center min-w-[28px] h-7 text-xs font-bold rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/25 text-white' 
                      : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'
                  }`}>
                    {count}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Индикатор активных фильтров */}
      {hasActiveFilters && (
        <div className="glass-card p-4 border border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-red-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-xl">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-orange-300 font-semibold text-sm">Активные фильтры</p>
                <div className="flex items-center gap-2 text-xs text-orange-400 mt-1">
                  {selectedUrgency !== 'all' && (
                    <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full font-medium">
                      {urgencyFilters.find(f => f.value === selectedUrgency)?.label}
                    </span>
                  )}
                  {selectedSort !== 'urgency' && (
                    <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full font-medium">
                      {activeSortOption?.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-sm rounded-xl text-orange-400 hover:text-orange-300 transition-all duration-300 hover:scale-105"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-xs font-medium">Сбросить</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}