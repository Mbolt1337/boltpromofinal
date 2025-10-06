'use client'

import { useState, useCallback } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { Promocode, getPromocodes, PromocodesParams } from '@/lib/api'
import PromoCard from './PromoCard'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollPromoListProps {
  initialPromos: Promocode[]
  filters?: PromocodesParams
  showStore?: boolean
  showCategory?: boolean
  className?: string
}

/**
 * Компонент для бесконечного скролла промокодов с виртуализацией
 *
 * Использует react-virtuoso для оптимальной производительности
 * при отображении большого количества элементов
 *
 * @example
 * ```tsx
 * <InfiniteScrollPromoList
 *   initialPromos={promos}
 *   filters={{ category: 'electronics' }}
 * />
 * ```
 */
export default function InfiniteScrollPromoList({
  initialPromos,
  filters = {},
  showStore = true,
  showCategory = false,
  className = ''
}: InfiniteScrollPromoListProps) {
  const [promocodes, setPromocodes] = useState<Promocode[]>(initialPromos)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const nextPage = page + 1
      const response = await getPromocodes({
        ...filters,
        page: nextPage,
        page_size: 24
      })

      if (response.results.length === 0) {
        setHasMore(false)
      } else {
        setPromocodes(prev => [...prev, ...response.results])
        setPage(nextPage)

        // Проверяем, есть ли еще страницы
        if (!response.next) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки промокодов:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [page, filters, hasMore, isLoading])

  if (promocodes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Промокоды не найдены</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <Virtuoso
        data={promocodes}
        endReached={loadMore}
        itemContent={(index, promo) => (
          <div className="mb-6 px-4 sm:px-0" key={promo.id}>
            <PromoCard promo={promo} />
          </div>
        )}
        components={{
          Footer: () => {
            if (!hasMore) return null
            return (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
              </div>
            )
          }
        }}
        style={{ height: '100vh' }}
        overscan={400}
        increaseViewportBy={{ top: 800, bottom: 800 }}
      />
    </div>
  )
}
