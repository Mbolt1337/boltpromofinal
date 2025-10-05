import { getPromocodes } from '@/lib/api'
import { Flame, Clock, Zap, Timer, AlertTriangle, Filter } from 'lucide-react'
import { Suspense } from 'react'
import Link from 'next/link'
import HotPromoCard from '@/components/HotPromoCard'
import HotFilters from '@/components/hot/HotFilters'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import Pagination from '@/components/ui/Pagination'
import type { Promocode } from '@/lib/api'
import type { PaginationInfo } from '@/types'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

interface HotPageProps {
  searchParams?: Promise<{
    page?: string
    limit?: string
    urgency?: string
    sort?: string
  }>
}

// ✅ ИСПРАВЛЕНО: Функция для проверки, истекает ли промокод скоро (в течение 7 дней)
function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false
  
  try {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const daysDiff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysDiff <= 7 && daysDiff > 0
  } catch {
    return false
  }
}

// ✅ ИСПРАВЛЕНО: Функция для определения уровня срочности
function getUrgencyLevel(expiresAt?: string): 'critical' | 'urgent' | 'soon' | 'normal' {
  if (!expiresAt) return 'normal'
  try {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const totalHours = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (totalHours <= 6) return 'critical'
    if (totalHours <= 24) return 'urgent'
    if (totalHours <= 168) return 'soon'
    return 'normal'
  } catch {
    return 'normal'
  }
}

// Улучшенная функция для получения горячих промокодов с фильтрами
async function getHotPromocodes(
  page: number = 1, 
  limit: number = 18,
  urgency: string = 'all',
  sort: string = 'urgency'
) {
  try {
    // Получаем больше промокодов для фильтрации
    const response = await getPromocodes({
      page_size: limit * 3, // Берем в 3 раза больше для фильтрации
      ordering: '-created_at'
    })

    // ✅ ИСПРАВЛЕНО: Фильтруем по срочности с правильным полем expires_at
    let filteredPromos = response.results.filter(promo => {
      switch (urgency) {
        case 'hot':
          return promo.is_hot
        case 'critical':
          return getUrgencyLevel(promo.expires_at) === 'critical'
        case 'urgent':
          return getUrgencyLevel(promo.expires_at) === 'urgent'
        case 'all':
        default:
          return promo.is_hot || isExpiringSoon(promo.expires_at)
      }
    })

    // ✅ ИСПРАВЛЕНО: Сортируем согласно выбранной опции с правильным полем expires_at
    filteredPromos.sort((a, b) => {
      switch (sort) {
        case 'urgency':
          // Сначала по срочности, потом горячие, потом по дате
          const aUrgency = getUrgencyLevel(a.expires_at)
          const bUrgency = getUrgencyLevel(b.expires_at)
          
          const urgencyOrder = { critical: 4, urgent: 3, soon: 2, normal: 1 }
          if (urgencyOrder[aUrgency] !== urgencyOrder[bUrgency]) {
            return urgencyOrder[bUrgency] - urgencyOrder[aUrgency]
          }
          
          if (a.is_hot && !b.is_hot) return -1
          if (!a.is_hot && b.is_hot) return 1
          
          const aDate = new Date(a.created_at || '').getTime()
          const bDate = new Date(b.created_at || '').getTime()
          return bDate - aDate

        case 'newest':
          const aCreated = new Date(a.created_at || '').getTime()
          const bCreated = new Date(b.created_at || '').getTime()
          return bCreated - aCreated

        case 'popular':
          return (b.views_count || 0) - (a.views_count || 0)

        case 'discount':
          // Простая сортировка по наличию скидки
          if (a.discount_text && !b.discount_text) return -1
          if (!a.discount_text && b.discount_text) return 1
          return 0

        default:
          return 0
      }
    })

    // Пагинация
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = filteredPromos.slice(startIndex, endIndex)
    
    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages: Math.ceil(filteredPromos.length / limit),
      totalItems: filteredPromos.length,
      itemsPerPage: limit,
      hasNext: endIndex < filteredPromos.length,
      hasPrevious: page > 1
    }

    // ✅ ИСПРАВЛЕНО: Подсчитываем статистику для всех горячих и истекающих промокодов с правильным полем expires_at
    const allHotAndExpiring = response.results.filter(p => p.is_hot || isExpiringSoon(p.expires_at))

    return {
      items: paginatedItems,
      pagination,
      totalHot: allHotAndExpiring.filter(p => p.is_hot).length,
      totalExpiring: allHotAndExpiring.filter(p => isExpiringSoon(p.expires_at)).length
    }
  } catch (error) {
    console.error('Ошибка загрузки горячих промокодов:', error)
    return {
      items: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        hasNext: false,
        hasPrevious: false
      },
      totalHot: 0,
      totalExpiring: 0
    }
  }
}

// Компонент статистики горячих промокодов
function HotStatsCards({ totalHot, totalExpiring, totalActive }: { 
  totalHot: number
  totalExpiring: number 
  totalActive: number
}) {
  const statCards = [
    {
      icon: Flame,
      value: totalHot,
      label: 'Горячих промокодов',
      color: 'text-white'
    },
    {
      icon: Timer,
      value: totalExpiring,
      label: 'Истекают скоро',
      color: 'text-white'
    },
    {
      icon: Zap,
      value: totalActive,
      label: 'Активных предложений',
      color: 'text-white'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300"
        >
          <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
          <div className="text-2xl font-bold text-white mb-1">
            {stat.value.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton для загрузки
function HotPageSkeleton() {
  return (
    <>
      {/* Фильтры skeleton */}
      <div className="glass-card p-6 mb-8 animate-shimmer">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="h-12 bg-white/10 rounded-xl flex-1 max-w-md"></div>
          <div className="h-6 bg-white/10 rounded w-32"></div>
          <div className="h-12 bg-white/10 rounded-xl w-48"></div>
        </div>
      </div>

      {/* Статистика skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="glass-card p-6 animate-shimmer">
            <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4"></div>
            <div className="h-8 bg-white/10 rounded w-16 mx-auto mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-32 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Сетка промокодов skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(18)].map((_, index) => (
          <div key={index} className="glass-card p-6 animate-shimmer">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 bg-white/10 rounded w-24 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-20"></div>
              </div>
            </div>
            <div className="h-6 bg-white/10 rounded w-full mb-3"></div>
            <div className="h-4 bg-white/10 rounded w-2/3 mb-4"></div>
            <div className="h-12 bg-white/10 rounded w-full"></div>
          </div>
        ))}
      </div>
    </>
  )
}

// Основной компонент с данными
async function HotContent({ searchParams }: { searchParams: any }) {
  const page = parseInt(searchParams?.page || '1', 10)
  const limit = parseInt(searchParams?.limit || '18', 10)
  const urgency = searchParams?.urgency || 'all'
  const sort = searchParams?.sort || 'urgency'

  const result = await getHotPromocodes(page, limit, urgency, sort)

  if (result.items.length === 0) {
    return (
      <>
        {/* Фильтры */}
        <HotFilters
          totalHot={result.totalHot}
          totalExpiring={result.totalExpiring}
          totalActive={result.totalHot + result.totalExpiring}
        />

        {/* Статистика */}
        <HotStatsCards 
          totalHot={result.totalHot}
          totalExpiring={result.totalExpiring}
          totalActive={result.totalHot + result.totalExpiring}
        />

        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">
            {urgency === 'all' ? 'Горячих промокодов пока нет' : 'По выбранным фильтрам ничего не найдено'}
          </h3>
          <p className="text-gray-400 mb-6">
            {urgency === 'all' 
              ? 'Следите за обновлениями - скоро появятся новые горячие предложения'
              : 'Попробуйте изменить фильтры или сбросить их'
            }
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 glass-button-small rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
          >
            Вернуться на главную
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Фильтры */}
      <HotFilters
        totalHot={result.totalHot}
        totalExpiring={result.totalExpiring}
        totalActive={result.totalHot + result.totalExpiring}
      />

      {/* Статистика */}
      <HotStatsCards 
        totalHot={result.totalHot}
        totalExpiring={result.totalExpiring}
        totalActive={result.totalHot + result.totalExpiring}
      />

      {/* Уведомление о фильтрах */}
      {(urgency !== 'all' || sort !== 'urgency') && (
        <div className="glass-card p-4 mb-6 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-blue-300 font-medium text-sm">
                Применены фильтры
              </p>
              <p className="text-blue-400 text-xs">
                Показаны результаты согласно выбранным настройкам
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Уведомление об обновлении */}
      <div className="glass-card p-4 mb-8 border border-white/10">
        <div className="flex items-center gap-3">
          <Flame className="w-6 h-6 text-white" />
          <div>
            <p className="text-white font-medium">
              Горячие предложения обновляются каждый час
            </p>
            <p className="text-gray-400 text-sm">
              Не упустите ограниченные по времени скидки
            </p>
          </div>
        </div>
      </div>

      {/* ✅ ИСПРАВЛЕНО: Сетка промокодов - HotPromoCard теперь унифицирован с PromoCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.items.map((promo) => (
          <HotPromoCard
            key={promo.id}
            promo={promo}
          />
        ))}
      </div>

      {/* Пагинация */}
      {result.pagination.totalPages > 1 && (
        <div className="mt-12">
          <Pagination 
            pagination={result.pagination}
            showQuickJump={true}
            showPageInfo={true}
          />
        </div>
      )}
    </>
  )
}

// Главный компонент страницы
export default async function HotPage({ searchParams }: HotPageProps) {
  const resolvedSearchParams = await searchParams

  // Хлебные крошки для горячих промокодов
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Горячие', icon: <Flame className="w-4 h-4 text-orange-400" /> }
  ]

  return (
    <div className="min-h-screen">
      {/* Хлебные крошки */}
      <div className="container-main py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Заголовок страницы */}
      <section className="py-8">
        <div className="container-main">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Flame className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Горячие промокоды
            </h1>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Самые выгодные предложения и промокоды, которые скоро истекают. 
              Успейте воспользоваться ограниченными по времени скидками!
            </p>

            {/* Призыв к действию */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-300 text-sm">
              <Clock className="w-4 h-4" />
              <span>Обновляется в реальном времени</span>
            </div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="pb-16">
        <div className="container-main">
          <Suspense fallback={<HotPageSkeleton />}>
            <HotContent searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

// SEO метаданные
export async function generateMetadata() {
  try {
    const hotData = await getHotPromocodes(1, 100)
    
    return {
      title: 'Горячие промокоды - лучшие скидки ограниченного времени | BoltPromo',
      description: `${hotData.totalHot} горячих промокодов и ${hotData.totalExpiring} предложений, которые скоро истекают. Успейте воспользоваться самыми выгодными скидками!`,
      keywords: [
        'горячие промокоды',
        'ограниченные скидки',
        'срочные предложения',
        'промокоды истекают',
        'лучшие скидки'
      ].join(', '),
      openGraph: {
        title: 'Горячие промокоды - BoltPromo',
        description: `${hotData.totalHot + hotData.totalExpiring} горячих предложений ограниченного времени`,
        type: 'website',
        url: 'https://boltpromo.ru/hot'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Горячие промокоды - BoltPromo',
        description: 'Лучшие скидки ограниченного времени'
      },
      alternates: {
        canonical: 'https://boltpromo.ru/hot'
      }
    }
  } catch (error) {
    console.error('Ошибка генерации метаданных:', error)
    return {
      title: 'Горячие промокоды - BoltPromo',
      description: 'Самые выгодные предложения и промокоды ограниченного времени'
    }
  }
}

// Viewport конфигурация
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}