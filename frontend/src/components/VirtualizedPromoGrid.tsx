'use client'

import { useState, useCallback } from 'react'
import { VirtuosoGrid } from 'react-virtuoso'
import { Promocode, getPromocodes, PromocodesParams } from '@/lib/api'
import PromoCard from './PromoCard'
import { Loader2 } from 'lucide-react'

interface VirtualizedPromoGridProps {
  initialPromos: Promocode[]
  filters?: PromocodesParams
  showStore?: boolean
  showCategory?: boolean
  className?: string
}

/**
 * Компонент для отображения промокодов в grid с виртуализацией и infinite scroll
 *
 * Использует react-virtuoso VirtuosoGrid для grid layout
 * Автоматически подгружает следующие страницы при скролле
 *
 * @example
 * ```tsx
 * <VirtualizedPromoGrid
 *   initialPromos={promos}
 *   filters={{ category: 'electronics' }}
 * />
 * ```
 */
export default function VirtualizedPromoGrid({
  initialPromos,
  filters = {},
  showStore = true,
  showCategory = false,
  className = ''
}: VirtualizedPromoGridProps) {
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
      <VirtuosoGrid
        data={promocodes}
        endReached={loadMore}
        itemContent={(index, promo) => (
          <PromoCard
            key={promo.id}
            promo={promo}
          />
        )}
        components={{
          List: ({ children, ...props }) => (
            <div
              {...props}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {children}
            </div>
          ),
          Footer: () => {
            if (!hasMore) {
              return (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">Все промокоды загружены</p>
                </div>
              )
            }
            return (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
              </div>
            )
          }
        }}
        style={{ height: '100vh' }}
        overscan={600}
      />
    </div>
  )
}
