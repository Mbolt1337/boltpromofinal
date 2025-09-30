'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'
import type { PaginationInfo } from '@/types'

interface PaginationProps {
  pagination: PaginationInfo
  showQuickJump?: boolean
  showPageInfo?: boolean
  className?: string
}

// Skeleton для пагинации
function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {[...Array(7)].map((_, index) => (
        <div key={index} className="w-12 h-12 bg-white/5 rounded-xl animate-shimmer"></div>
      ))}
    </div>
  )
}

export { PaginationSkeleton }

export default function Pagination({ 
  pagination, 
  showQuickJump = false, 
  showPageInfo = false,
  className = "" 
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jumpPage, setJumpPage] = useState('')

  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination

  // Если всего одна страница, не показываем пагинацию
  if (totalPages <= 1) return null

  // Функция для перехода на страницу
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return

    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }

    const queryString = params.toString()
    const currentPath = window.location.pathname
    const newUrl = `${currentPath}${queryString ? `?${queryString}` : ''}`
    
    router.push(newUrl)
  }

  // Быстрый переход на страницу
  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(jumpPage, 10)
    if (page && page >= 1 && page <= totalPages) {
      goToPage(page)
      setJumpPage('')
    }
  }

  // Генерация номеров страниц для отображения
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Максимальное количество видимых страниц

    if (totalPages <= maxVisible) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Сложная логика для большого количества страниц
      if (currentPage <= 4) {
        // Если в начале
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Если в конце
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Если в середине
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      
      {/* Информация о страницах */}
      {showPageInfo && (
        <div className="text-gray-400 text-sm text-center">
          Показано {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–{Math.min(currentPage * itemsPerPage, totalItems)} из {totalItems} результатов
        </div>
      )}

      {/* Основная пагинация */}
      <div className="flex items-center gap-2">
        
        {/* Переход к первой странице */}
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="glass-button-small p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 text-white"
          title="Первая страница"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Предыдущая страница */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="glass-button-small p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 text-white"
          title="Предыдущая страница"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Номера страниц */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-400 flex items-center justify-center min-w-[44px]">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              ) : (
                <button
                  onClick={() => goToPage(page as number)}
                  className={`
                    px-4 py-3 min-w-[44px] rounded-xl font-semibold transition-all duration-300 text-sm
                    ${page === currentPage 
                      ? 'bg-white/15 border border-white/25 text-white shadow-glass scale-[1.02]' 
                      : 'glass-button-small text-gray-300 hover:text-white hover:scale-105'
                    }
                  `}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Следующая страница */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="glass-button-small p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 text-white"
          title="Следующая страница"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Переход к последней странице */}
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="glass-button-small p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 text-white"
          title="Последняя страница"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Быстрый переход */}
      {showQuickJump && totalPages > 10 && (
        <div className="glass-card p-4 rounded-xl">
          <form onSubmit={handleQuickJump} className="flex items-center gap-3">
            <span className="text-gray-400 text-sm whitespace-nowrap">Перейти к странице:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="w-20 px-3 py-2 glass-input rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
              placeholder={currentPage.toString()}
            />
            <button
              type="submit"
              className="glass-button-small px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:scale-105"
            >
              Перейти
            </button>
          </form>
        </div>
      )}

      {/* Мобильная версия (упрощенная) */}
      <div className="flex sm:hidden items-center justify-between w-full max-w-xs">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="glass-button-small flex items-center gap-2 px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed text-sm text-white rounded-xl transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div className="glass-card px-4 py-2 rounded-xl">
          <span className="text-white font-semibold text-sm">
            {currentPage} / {totalPages}
          </span>
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="glass-button-small flex items-center gap-2 px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed text-sm text-white rounded-xl transition-all duration-300"
        >
          <span>Вперед</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}