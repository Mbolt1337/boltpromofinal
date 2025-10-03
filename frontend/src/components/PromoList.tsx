import { getPromocodes, getStores } from '@/lib/api'
import PromoCard from './PromoCard'
import PromoCarouselMobile from './PromoCarouselMobile'
import { ArrowRight, Tag, Store, Grid3X3, Zap, Users, ShoppingBag, CreditCard, Gift, Percent, Copy } from 'lucide-react'
import Link from 'next/link'
import SectionContainer from '@/components/ui/SectionContainer'
import SectionHeader from '@/components/ui/SectionHeader'

interface PromoListProps {
  limit?: number
  showHeader?: boolean
  showActions?: boolean
  showStats?: boolean
  offerType?: 'coupon' | 'deal' | 'financial' | 'cashback'
}

// 🚀 ОПТИМИЗАЦИЯ: Константы вынесены наружу компонента
const OFFER_TYPE_LABELS = {
  coupon: 'Промокоды',
  deal: 'Скидки', 
  financial: 'Финансовые услуги',
  cashback: 'Кэшбэк предложения'
} as const

// 🚀 ОПТИМИЗАЦИЯ: Конфигурация статистических карточек
const STATS_CONFIG = [
  {
    key: 'offers',
    icon: ShoppingBag,
    label: 'Активных предложений',
    gradient: 'from-green-500/3 to-emerald-500/3',
    hoverColor: 'group-hover:text-green-300',
    iconHoverColor: 'group-hover:text-green-300'
  },
  {
    key: 'promocodes', 
    icon: Copy,
    label: 'Промокодов',
    gradient: 'from-blue-500/3 to-cyan-500/3',
    hoverColor: 'group-hover:text-blue-300',
    iconHoverColor: 'group-hover:text-blue-300'
  },
  {
    key: 'stores',
    icon: Users, 
    label: 'Магазинов-партнеров',
    gradient: 'from-purple-500/3 to-violet-500/3',
    hoverColor: 'group-hover:text-purple-300',
    iconHoverColor: 'group-hover:text-purple-300'
  }
] as const

// 🚀 ОПТИМИЗАЦИЯ: Стили кнопок действий
const ACTION_BUTTON_CLASSES = "inline-flex items-center px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 ease-out bg-white/8 hover:bg-white/12 border border-white/15 hover:border-white/25 hover:scale-105 group shadow-lg hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none"

// 🚀 ОПТИМИЗАЦИЯ: Стили статистических карточек
const STATS_CARD_CLASSES = "glass-card p-8 text-center hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out group relative overflow-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none"

// Skeleton для загрузки промокодов
function PromoListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass-card p-6 animate-shimmer h-[420px]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-5 bg-white/10 rounded w-24 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-20"></div>
            </div>
          </div>
          <div className="h-6 bg-white/10 rounded w-full mb-3"></div>
          <div className="h-4 bg-white/10 rounded w-2/3 mb-4"></div>
          <div className="space-y-3 mt-auto">
            <div className="h-12 bg-white/10 rounded w-full"></div>
            <div className="h-10 bg-white/10 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 🚀 ОПТИМИЗАЦИЯ: Компонент статистической карточки
function StatCard({ config, value }: { config: typeof STATS_CONFIG[number], value: number }) {
  const Icon = config.icon
  
  return (
    <div className={STATS_CARD_CLASSES} tabIndex={0}>
      <div className="relative z-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300 ease-out">
          <Icon className={`w-8 h-8 text-white ${config.iconHoverColor} transition-colors duration-300 ease-out`} />
        </div>
        <div className={`text-3xl font-bold text-white mb-2 ${config.hoverColor} transition-colors duration-300 ease-out`}>
          {value.toLocaleString()}
        </div>
        <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300 ease-out">
          {config.label}
        </div>
      </div>
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`}></div>
    </div>
  )
}

// 🚀 ОПТИМИЗАЦИЯ: Компонент пустого состояния
function EmptyState({ offerType, showHeader }: { offerType?: string, showHeader: boolean }) {
  const title = offerType ? OFFER_TYPE_LABELS[offerType as keyof typeof OFFER_TYPE_LABELS] : 'Популярные промокоды'
  const description = offerType
    ? `Предложения типа "${OFFER_TYPE_LABELS[offerType as keyof typeof OFFER_TYPE_LABELS]}" скоро появятся`
    : 'Лучшие предложения скоро появятся'

  const content = (
    <>
      {showHeader && (
        <SectionHeader title={title} subtitle={description} align="center" />
      )}

      <div className="glass-card p-12 text-center">
        <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4 transition-transform duration-300 ease-out hover:scale-110" />
        <h3 className="text-2xl font-semibold text-white mb-4">
          Промокоды загружаются...
        </h3>
        <p className="text-gray-400">
          Актуальные предложения будут добавлены в ближайшее время
        </p>
      </div>
    </>
  )

  return showHeader ? <SectionContainer>{content}</SectionContainer> : content
}

// 🚀 ОПТИМИЗАЦИЯ: Компонент кнопок действий
function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
      <Link href="/stores" className={ACTION_BUTTON_CLASSES}>
        <Store className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300 ease-out" />
        <span>Перейти в магазины</span>
        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
      </Link>

      <Link href="/categories" className={ACTION_BUTTON_CLASSES}>
        <Grid3X3 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300 ease-out" />
        <span>Перейти в категории</span>
        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
      </Link>
    </div>
  )
}

export { PromoListSkeleton }

export default async function PromoList({ 
  limit = 6, 
  showHeader = true,
  showActions = true,
  showStats = true,
  offerType
}: PromoListProps) {
  try {
    // 🚀 ОПТИМИЗАЦИЯ: Параллельные запросы для улучшения производительности
    const [promoResponse, storesResponse] = await Promise.all([
      getPromocodes({
        limit,
        offer_type: offerType,
        ordering: '-is_recommended,-views_count'
      }),
      showStats ? getStores({ page_size: 100 }) : Promise.resolve({ count: 0, results: [] })
    ])

    const promos = promoResponse.results
    const stores = storesResponse.results || []

    if (promos.length === 0) {
      return <EmptyState offerType={offerType} showHeader={showHeader} />
    }

    // 🚀 ОПТИМИЗАЦИЯ: Предварительно вычисляем значения для статистики
    const statsValues = {
      offers: promoResponse.count,
      promocodes: promoResponse.count, 
      stores: storesResponse.count
    }

    // 🚀 ОПТИМИЗАЦИЯ: Подготавливаем заголовок
    const headerTitle = offerType 
      ? OFFER_TYPE_LABELS[offerType as keyof typeof OFFER_TYPE_LABELS] 
      : 'Популярные промокоды'
      
    const headerDescription = offerType 
      ? `Лучшие предложения типа "${OFFER_TYPE_LABELS[offerType as keyof typeof OFFER_TYPE_LABELS]}"`
      : 'Лучшие предложения от проверенных магазинов'

    const content = (
      <>
        {showHeader && (
          <SectionHeader title={headerTitle} subtitle={headerDescription} align="center" />
        )}

        {/* Мобильная карусель промокодов */}
        <PromoCarouselMobile promos={promos} />

        {/* 🚀 ОПТИМИЗАЦИЯ: Кнопки действий (мобилка - после карусели) */}
        {showActions && (
          <div className="md:hidden">
            <ActionButtons />
          </div>
        )}

        {/* 🚀 ОПТИМИЗАЦИЯ: Сетка промокодов (десктоп) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>

        {/* 🚀 ОПТИМИЗАЦИЯ: Кнопки действий (десктоп - после grid) */}
        {showActions && (
          <div className="hidden md:block">
            <ActionButtons />
          </div>
        )}

        {/* 🚀 ОПТИМИЗАЦИЯ: Статистика с переиспользуемыми компонентами */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATS_CONFIG.map((config, index) => (
              <StatCard
                key={config.key}
                config={config}
                value={statsValues[config.key as keyof typeof statsValues]}
              />
            ))}
          </div>
        )}
      </>
    )

    return showHeader ? <SectionContainer>{content}</SectionContainer> : content
    
  } catch (error) {
    console.error('Ошибка загрузки промокодов:', error)

    const errorContent = (
      <>
        {showHeader && (
          <SectionHeader
            title="Популярные промокоды"
            subtitle="Временные проблемы с загрузкой"
            align="center"
          />
        )}

        <div className="glass-card p-12 text-center">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4 transition-transform duration-300 ease-out hover:scale-110" />
          <h3 className="text-2xl font-semibold text-white mb-4">
            Ошибка загрузки
          </h3>
          <p className="text-gray-400">
            Проверьте подключение к серверу
          </p>
        </div>
      </>
    )

    return showHeader ? <SectionContainer>{errorContent}</SectionContainer> : errorContent
  }
}