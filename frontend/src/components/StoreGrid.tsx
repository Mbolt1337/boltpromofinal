import { getStores, Store } from '@/lib/api'
import { Store as StoreIcon, Star, Tag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import SectionContainer from '@/components/ui/SectionContainer'
import SectionHeader from '@/components/ui/SectionHeader'

interface StoreGridProps {
  stores?: Store[]
  limit?: number
  showHeader?: boolean
}

// ОПТИМИЗАЦИЯ: Константы классов вынесены наружу
const GRID_CLASSES = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
const CARD_CLASSES = "glass-card p-6 hover:scale-[1.02] transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-white/10 group block focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
const LOGO_WRAPPER_CLASSES = "w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/15 transition-all duration-300 ease-out flex-shrink-0 group-hover:-translate-y-0.5 group-hover:scale-110"
const STORE_NAME_CLASSES = "font-semibold text-white text-lg mb-1 truncate group-hover:text-blue-400 transition-colors duration-300 ease-out"
const RATING_CLASSES = "flex items-center gap-1 text-sm"
const DESCRIPTION_CLASSES = "text-gray-400 text-sm line-clamp-2 leading-relaxed transition-colors duration-300 ease-out group-hover:text-gray-300"
const FALLBACK_DESCRIPTION_CLASSES = "text-gray-500 text-sm italic"
const STATS_CLASSES = "flex items-center justify-between text-sm"
const PROMOCODES_CLASSES = "flex items-center gap-1 text-green-400 transition-colors duration-300 ease-out group-hover:text-green-300"
const STATUS_CLASSES = "flex items-center gap-1 text-blue-400 transition-colors duration-300 ease-out group-hover:text-blue-300"
const HOVER_EFFECT_CLASSES = "absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out rounded-2xl pointer-events-none"

// ОПТИМИЗАЦИЯ: Функции вынесены наружу компонента
function formatRating(rating: any): string | null {
  if (!rating) return null
  
  const numRating = typeof rating === 'number' ? rating : parseFloat(String(rating))
  
  if (isNaN(numRating) || numRating <= 0) return null
  
  return numRating.toFixed(1)
}

function getPromocodePlural(count: number): string {
  if (count === 1) return 'промокод'
  if (count >= 2 && count <= 4) return 'промокода'
  return 'промокодов'
}

function filterStores(stores: Store[], limit: number): Store[] {
  // Фильтруем только магазины с промокодами для "популярных"
  const storesWithPromocodes = stores.filter(store => 
    store.is_active !== false && 
    (store.promocodes_count || 0) > 0
  )
  
  // Если мало магазинов с промокодами, добавляем остальные активные
  const finalStores = storesWithPromocodes.length >= limit 
    ? storesWithPromocodes 
    : [
        ...storesWithPromocodes,
        ...stores.filter(store => 
          store.is_active !== false && 
          !storesWithPromocodes.includes(store)
        )
      ]
  
  return limit ? finalStores.slice(0, limit) : finalStores
}

// Skeleton для загрузки магазинов
function StoreGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass-card p-6 animate-shimmer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-5 bg-white/10 rounded w-32 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-24"></div>
            </div>
          </div>
          <div className="h-4 bg-white/10 rounded w-full mb-3"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

// ОПТИМИЗАЦИЯ: Компонент рейтинга
function StoreRating({ rating }: { rating: any }) {
  const formattedRating = formatRating(rating)
  
  if (!formattedRating || parseFloat(formattedRating) <= 0) return null
  
  return (
    <div className={RATING_CLASSES}>
      <Star className="w-4 h-4 text-yellow-400 fill-current transition-all duration-300 ease-out group-hover:scale-110" />
      <span className="text-yellow-400 font-medium transition-colors duration-300 ease-out">
        {formattedRating}
      </span>
      <span className="text-gray-400 transition-colors duration-300 ease-out group-hover:text-gray-300">рейтинг</span>
    </div>
  )
}

// ОПТИМИЗАЦИЯ: Компонент статистики магазина
function StoreStats({ store }: { store: Store }) {
  const promoCount = store.promocodes_count || 0
  
  return (
    <div className={STATS_CLASSES}>
      {/* Промокоды */}
      <div className={PROMOCODES_CLASSES}>
        <Tag className="w-4 h-4 transition-all duration-300 ease-out group-hover:scale-110" />
        <span className="font-medium">
          {promoCount}
        </span>
        <span className="text-gray-400 transition-colors duration-300 ease-out group-hover:text-gray-300">
          {getPromocodePlural(promoCount)}
        </span>
      </div>
      
      {/* Статус активности */}
      <div className={STATUS_CLASSES}>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs">Активен</span>
      </div>
    </div>
  )
}

// ОПТИМИЗАЦИЯ: Компонент карточки магазина
function StoreCard({ store, index }: { store: Store, index: number }) {
  // B2: Оптимизированные настройки изображений
  const isTopPriority = index < 6 // Первые 6 магазинов - приоритет
  
  return (
    <Link
      href={`/stores/${store.slug}`}
      className={CARD_CLASSES}
    >
      {/* Заголовок магазина */}
      <div className="flex items-center space-x-4 mb-4">
        {/* Логотип */}
        <div className={LOGO_WRAPPER_CLASSES}>
          {store.logo ? (
            <Image
              src={store.logo}
              alt={store.name}
              width={64}
              height={64}
              className="rounded-xl object-cover w-full h-full transition-all duration-300 ease-out"
              // B2: Responsive sizes для лучшей производительности
              sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 64px, 64px"
              // B2: Ленивая загрузка для всех кроме первых
              loading={isTopPriority ? "eager" : "lazy"}
              // B2: Приоритет только для топ-6
              priority={isTopPriority}
              // B2: Качество в зависимости от приоритета
              quality={isTopPriority ? 85 : 75}
            />
          ) : (
            <StoreIcon className="w-8 h-8 text-white/60 transition-all duration-300 ease-out group-hover:scale-110" />
          )}
        </div>
        
        {/* Информация */}
        <div className="flex-1 min-w-0">
          <h3 className={STORE_NAME_CLASSES}>
            {store.name}
          </h3>
          
          <StoreRating rating={store.rating} />
        </div>
      </div>
      
      {/* Описание с фиксированной высотой */}
      <div className="mb-4 min-h-[2.5rem]">
        {store.description ? (
          <p className={DESCRIPTION_CLASSES}>
            {store.description}
          </p>
        ) : (
          <p className={FALLBACK_DESCRIPTION_CLASSES}>
            Популярный интернет-магазин
          </p>
        )}
      </div>
      
      {/* Статистика */}
      <StoreStats store={store} />

      {/* Hover эффект */}
      <div className={HOVER_EFFECT_CLASSES}></div>
    </Link>
  )
}

// ОПТИМИЗАЦИЯ: Компонент пустого состояния
function EmptyState({ showHeader }: { showHeader: boolean }) {
  const content = (
    <>
      {showHeader && (
        <SectionHeader
          title="Популярные магазины"
          subtitle="Лучшие предложения от проверенных партнеров"
          align="center"
        />
      )}

      <div className="glass-card p-12 text-center">
        <StoreIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-4">
          Магазины скоро появятся
        </h3>
        <p className="text-gray-400">
          Мы работаем над добавлением новых партнеров
        </p>
      </div>
    </>
  )

  return showHeader ? <SectionContainer>{content}</SectionContainer> : content
}

// ОПТИМИЗАЦИЯ: Компонент ошибки с кнопкой обновления
function ErrorState({ showHeader }: { showHeader: boolean }) {
  const content = (
    <>
      {showHeader && (
        <SectionHeader
          title="Популярные магазины"
          subtitle="Лучшие предложения от проверенных партнеров"
          align="center"
        />
      )}

      <div className="glass-card p-12 text-center">
        <StoreIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-4">
          Временные неполадки
        </h3>
        <p className="text-gray-400 mb-6">
          Не удается загрузить список магазинов. Попробуйте обновить страницу.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-300 transition-all duration-300 ease-out"
        >
          Обновить
        </button>
      </div>
    </>
  )

  return showHeader ? <SectionContainer>{content}</SectionContainer> : content
}

export { StoreGridSkeleton }

export default async function StoreGrid({ 
  stores: passedStores,
  limit = 12, 
  showHeader = true 
}: StoreGridProps) {
  try {
    // ОПТИМИЗАЦИЯ: Используем переданные данные или получаем из API
    const storesResponse = passedStores 
      ? { results: passedStores, count: passedStores.length } 
      : await getStores({
          page_size: Math.max(limit * 2, 50),
          ordering: '-rating'
        })
    
    const allStores = storesResponse.results || []
    
    // ОПТИМИЗАЦИЯ: Фильтруем магазины один раз
    const displayStores = filterStores(allStores, limit)

    if (displayStores.length === 0) {
      return <EmptyState showHeader={showHeader} />
    }

    const content = (
      <>
        {showHeader && (
          <SectionHeader
            title="Популярные магазины"
            subtitle="Лучшие предложения от проверенных партнеров"
            align="center"
          />
        )}

        {/* B2: Сетка магазинов с индексами для оптимизации */}
        <div className={GRID_CLASSES}>
          {displayStores.map((store, index) => (
            <StoreCard key={store.id} store={store} index={index} />
          ))}
        </div>

        {/* Кнопка "Смотреть все" */}
        {!passedStores && showHeader && allStores.length > limit && (
          <div className="section-footer-gap flex justify-center">
            <Link href="/stores" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
              <span>Смотреть все магазины ({allStores.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </>
    )

    return showHeader ? <SectionContainer>{content}</SectionContainer> : content
    
  } catch (error) {
    console.error('Ошибка загрузки магазинов:', error)
    return <ErrorState showHeader={showHeader} />
  }
}