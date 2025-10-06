'use client'

import { Virtuoso } from 'react-virtuoso'
import { Promocode } from '@/lib/api'
import PromoCard from './PromoCard'

interface VirtualizedPromoListProps {
  promocodes: Promocode[]
  showStore?: boolean
  showCategory?: boolean
  className?: string
}

export default function VirtualizedPromoList({
  promocodes,
  showStore = true,
  showCategory = false,
  className = ''
}: VirtualizedPromoListProps) {
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
        itemContent={(index, promo) => (
          <div className="mb-6" key={promo.id}>
            <PromoCard promo={promo} />
          </div>
        )}
        style={{ height: '100vh' }}
        overscan={200}
        increaseViewportBy={{ top: 600, bottom: 600 }}
      />
    </div>
  )
}
