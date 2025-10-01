import { getStores, getGlobalStats } from '@/lib/api'
import { Store, ShoppingBag, Star, TrendingUp, Users } from 'lucide-react'
import { Suspense } from 'react'
import StoreGrid from '@/components/StoreGrid'
import StoreFilter from '@/components/filters/StoreFilter'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import Pagination from '@/components/ui/Pagination'
import type { Store as StoreType, GlobalStats } from '@/lib/api'
import type { StoreFilters, PaginationInfo, FilteredResult } from '@/types'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

interface StoresPageProps {
  searchParams?: Promise<{
    search?: string
    sort?: string
    page?: string
    limit?: string
    rating?: string
  }>
}

// ✅ ИСПРАВЛЕНО: Использует новый глобальный endpoint статистики
interface StoreStats {
  totalStores: number;
  totalPromocodes: number;
  activeStores: number;
  averageRating: number;
}

async function getStoreStatistics(): Promise<StoreStats> {
  try {
    // ✅ КРИТИЧНО: Используем новый endpoint для получения полной статистики
    const globalStats = await getGlobalStats();
    
    console.log(`[STATS] Глобальная статистика: всего ${globalStats.total_stores}, активных ${globalStats.active_stores}`);
    
    return {
      totalStores: globalStats.total_stores, // Полная статистика включая неактивные
      totalPromocodes: globalStats.total_promocodes,
      activeStores: globalStats.active_stores, // Только активные
      averageRating: 4.2 // Примерный средний рейтинг, можно добавить в API позже
    };
  } catch (error) {
    console.error('Ошибка получения статистики магазинов:', error);
    
    // Fallback статистика при ошибке
    return {
      totalStores: 0,
      totalPromocodes: 0,
      activeStores: 0,
      averageRating: 0
    };
  }
}

// Компонент статистики
function StoreStatsCards({ stats }: { stats: StoreStats }) {
  const statCards = [
    {
      icon: Store,
      value: stats.totalStores,
      label: 'Всего магазинов',
      color: 'text-blue-400'
    },
    {
      icon: ShoppingBag,
      value: stats.totalPromocodes,
      label: 'Всего промокодов',
      color: 'text-green-400'
    },
    {
      icon: TrendingUp,
      value: stats.activeStores,
      label: 'Активных магазинов',
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
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

// Skeleton для загрузки магазинов
function StoresPageSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="glass-card p-6 animate-shimmer">
            <div className="w-8 h-8 bg-white/10 rounded-lg mx-auto mb-3"></div>
            <div className="h-6 bg-white/10 rounded w-16 mx-auto mb-1"></div>
            <div className="h-4 bg-white/10 rounded w-24 mx-auto"></div>
          </div>
        ))}
      </div>
      <div className="glass-card p-6 mb-8 animate-shimmer">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="h-12 bg-white/10 rounded-xl flex-1 max-w-md"></div>
          <div className="h-6 bg-white/10 rounded w-32"></div>
          <div className="h-12 bg-white/10 rounded-xl w-32"></div>
          <div className="h-12 bg-white/10 rounded-xl w-48"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(12)].map((_, index) => (
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
    </>
  )
}

// ✅ ИСПРАВЛЕНО: Основной компонент с правильной статистикой
async function StoresContent({ searchParams }: { searchParams: any }) {
  try {
    // ✅ ИСПРАВЛЕНО: Гарантируем что page и limit всегда числа
    const page = parseInt(searchParams?.page || '1', 10) || 1;
    const limit = parseInt(searchParams?.limit || '12', 10) || 12;
    
    const filters: StoreFilters = {
      search: searchParams?.search || undefined,
      sortBy: searchParams?.sort || 'name-asc',
      page: page,
      limit: limit,
      rating: searchParams?.rating ? parseFloat(searchParams.rating) : undefined
    };

    // ✅ ИСПРАВЛЕНО: Параллельно получаем полную статистику и пагинированные данные
    const [storeStats, storesData] = await Promise.all([
      getStoreStatistics(), // Использует новый endpoint с полной статистикой
      getStores({
        page: filters.page,
        search: filters.search,
        sort: filters.sortBy,
        page_size: filters.limit
      })
    ]);

    // ✅ ИСПРАВЛЕНО: Проверка на пустые результаты
    if (!storesData || storesData.results.length === 0) {
      if (filters.search) {
        return (
          <>
            <StoreStatsCards stats={storeStats} />
            <StoreFilter totalResults={0} />
            <div className="glass-card p-12 text-center">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                Магазины не найдены
              </h3>
              <p className="text-gray-400 mb-6">
                По запросу "{filters.search}" ничего не найдено. 
                Попробуйте изменить поисковый запрос или сбросить фильтры.
              </p>
              <a 
                href="/stores"
                className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
              >
                Сбросить фильтры
              </a>
            </div>
          </>
        )
      }
      
      return (
        <>
          <StoreStatsCards stats={storeStats} />
          <div className="glass-card p-12 text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              Магазины отсутствуют
            </h3>
            <p className="text-gray-400">
              В каталоге пока нет добавленных магазинов. Скоро здесь появятся лучшие предложения!
            </p>
          </div>
        </>
      )
    }

    // ✅ ИСПРАВЛЕНО: Формирование пагинации с гарантированными числами
    const pagination: PaginationInfo = {
      currentPage: page, // Теперь гарантированно number
      totalPages: Math.ceil(storesData.count / limit), // limit тоже гарантированно number
      totalItems: storesData.count,
      itemsPerPage: limit,
      hasNext: !!storesData.next,
      hasPrevious: !!storesData.previous
    };

    // ✅ ИСПРАВЛЕНО: Количество найденных магазинов из API
    const foundStoresCount = storesData.count;

    return (
      <>
        <StoreStatsCards stats={storeStats} />
        <StoreFilter totalResults={foundStoresCount} />
        <StoreGrid 
          stores={storesData.results} 
          showHeader={false}
        />
        {pagination.totalPages > 1 && (
          <div className="mt-12">
            <Pagination 
              pagination={pagination}
              showQuickJump={true}
              showPageInfo={true}
            />
          </div>
        )}
      </>
    )
  } catch (error) {
    console.error('Ошибка загрузки магазинов:', error)
    return (
      <div className="glass-card p-12 text-center">
        <Store className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-4">
          Ошибка загрузки
        </h3>
        <p className="text-gray-400 mb-6">
          Не удалось загрузить список магазинов. Проверьте подключение к серверу.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
        >
          Попробовать снова
        </button>
      </div>
    )
  }
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const resolvedSearchParams = await searchParams

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Магазины' }
  ]

  return (
    <div className="min-h-screen">
      <div className="container-main py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <section className="py-8">
        <div className="container-main">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Каталог магазинов
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Откройте для себя лучшие интернет-магазины с актуальными промокодами и скидками. 
              Удобный поиск по рейтингу, категориям и специальным предложениям.
            </p>
          </div>
        </div>
      </section>
      <section className="pb-16">
        <div className="container-main">
          <Suspense fallback={<StoresPageSkeleton />}>
            <StoresContent searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

// ✅ ИСПРАВЛЕНО: Метаданные с правильной статистикой
export async function generateMetadata() {
  try {
    const storeStats = await getStoreStatistics();
    
    return {
      title: 'Каталог магазинов - промокоды и скидки от лучших ритейлеров | BoltPromo',
      description: `Изучите ${storeStats.totalStores} проверенных интернет-магазинов с ${storeStats.totalPromocodes} актуальными промокодами. Найдите лучшие предложения от надежных продавцов.`,
      keywords: [
        'интернет магазины',
        'промокоды магазинов', 
        'скидки в магазинах',
        'каталог магазинов',
        'лучшие магазины',
        'рейтинг магазинов'
      ].join(', '),
      openGraph: {
        title: 'Каталог магазинов с промокодами - BoltPromo',
        description: `${storeStats.totalStores} магазинов с ${storeStats.totalPromocodes} актуальными промокодами`,
        type: 'website',
        url: 'https://boltpromo.ru/stores'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Каталог магазинов с промокодами - BoltPromo',
        description: `${storeStats.totalStores} магазинов с ${storeStats.totalPromocodes} актуальными промокодами`
      },
      alternates: {
        canonical: 'https://boltpromo.ru/stores'
      }
    }
  } catch (error) {
    console.error('Ошибка генерации метаданных:', error)
    return {
      title: 'Каталог магазинов - BoltPromo',
      description: 'Каталог интернет-магазинов с промокодами и скидками. Найдите лучшие предложения от проверенных продавцов.'
    }
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}