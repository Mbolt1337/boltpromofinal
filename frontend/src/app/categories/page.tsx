import { getCategories } from '@/lib/api'
import { Tag, Grid3X3, TrendingUp, Users } from 'lucide-react'
import { Suspense } from 'react'
import CategoryGrid, { CategoryGridSkeleton } from '@/components/CategoryGrid'
import CategoryFilter from '@/components/filters/CategoryFilter'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import Pagination from '@/components/ui/Pagination'
import type { Category } from '@/lib/api'
// ✅ ИСПРАВЛЕНО: Используем новый интерфейс PagedResult вместо FilteredResult
import type { CategoryFilters, PaginationInfo, PagedResult, CategoryStats } from '@/types'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

interface CategoriesPageProps {
  searchParams?: Promise<{
    search?: string
    sort?: string
    page?: string
    limit?: string
  }>
}

// Функция для фильтрации и сортировки категорий
function filterAndSortCategories(
  categories: Category[], 
  filters: CategoryFilters
): PagedResult<Category> {
  let filtered = [...categories]
  
  // Поиск по названию и описанию
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      (category.description && category.description.toLowerCase().includes(searchTerm))
    )
  }
  
  // Фильтр по активности (только если явно указан)
  if (filters.isActive !== undefined) {
    filtered = filtered.filter(category => category.is_active === filters.isActive)
  }
  
  // Сортировка
  switch (filters.sortBy) {
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      break
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name, 'ru'))
      break
    case 'promo-count-desc':
      filtered.sort((a, b) => (b.promocodes_count || 0) - (a.promocodes_count || 0))
      break
    case 'promo-count-asc':
      filtered.sort((a, b) => (a.promocodes_count || 0) - (b.promocodes_count || 0))
      break
    case 'newest':
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime()
        const dateB = new Date(b.created_at || '').getTime()
        return dateB - dateA
      })
      break
    case 'oldest':
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime()
        const dateB = new Date(b.created_at || '').getTime()
        return dateA - dateB
      })
      break
    case 'popular':
    default:
      // Сортировка по популярности (количество промокодов + активность)
      filtered.sort((a, b) => {
        const scoreA = (a.promocodes_count || 0) * (a.is_active ? 1.2 : 1)
        const scoreB = (b.promocodes_count || 0) * (b.is_active ? 1.2 : 1)
        return scoreB - scoreA
      })
      break
  }
  
  // Пагинация
  const page = filters.page || 1
  const limit = filters.limit || 18
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = filtered.slice(startIndex, endIndex)
  
  const pagination: PaginationInfo = {
    currentPage: page,
    totalPages: Math.ceil(filtered.length / limit),
    totalItems: filtered.length,
    itemsPerPage: limit,
    hasNext: endIndex < filtered.length,
    hasPrevious: page > 1
  }
  
  return {
    items: paginatedItems,
    pagination,
    filters
  }
}

// Функция для вычисления статистики
function calculateStats(categories: Category[]): CategoryStats {
  const activeCategories = categories.filter(cat => cat.is_active !== false)
  const totalPromocodes = categories.reduce((sum, cat) => sum + (cat.promocodes_count || 0), 0)
  
  return {
    totalCategories: categories.length,
    totalPromocodes,
    activeCategories: activeCategories.length,
    averagePromocodesPerCategory: 0 // Не используем, но оставляем для совместимости
  }
}

// Компонент статистики
function CategoryStatsCards({ stats }: { stats: CategoryStats }) {
  const statCards = [
    {
      icon: Grid3X3,
      value: stats.totalCategories,
      label: 'Всего категорий',
      color: 'text-blue-400'
    },
    {
      icon: Tag,
      value: stats.totalPromocodes,
      label: 'Всего промокодов',
      color: 'text-green-400'
    },
    {
      icon: TrendingUp,
      value: stats.activeCategories,
      label: 'Активных категорий',
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

// Основной компонент с данными
async function CategoriesContent({ searchParams }: { searchParams: any }) {
  try {
    const categories = await getCategories()
    
    if (!categories || categories.length === 0) {
      return (
        <div className="glass-card p-12 text-center">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-4">
            Категории загружаются
          </h3>
          <p className="text-gray-400">
            Скоро здесь появятся категории товаров и услуг
          </p>
        </div>
      )
    }

    // Парсинг параметров поиска
    const filters: CategoryFilters = {
      search: searchParams?.search || undefined,
      sortBy: searchParams?.sort || 'popular',
      page: parseInt(searchParams?.page || '1', 10),
      limit: parseInt(searchParams?.limit || '18', 10)
      // Убрали фильтр isActive: true - показываем все категории
    }

    // Фильтрация и сортировка
    const result = filterAndSortCategories(categories, filters)
    const stats = calculateStats(categories)

    console.log('Debug categories:', {
      totalCategories: categories.length,
      filteredCategories: result.items.length,
      categoriesData: categories.map(cat => ({ 
        name: cat.name, 
        is_active: cat.is_active,
        promocodes_count: cat.promocodes_count 
      }))
    })

    return (
      <>
        {/* Статистика */}
        <CategoryStatsCards stats={stats} />

        {/* Фильтры */}
        <CategoryFilter totalResults={result.pagination.totalItems} />

        {/* Результаты */}
        {result.items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              Категории не найдены
            </h3>
            <p className="text-gray-400 mb-6">
              Попробуйте изменить параметры поиска или сбросить фильтры
            </p>
            <a 
              href="/categories"
              className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
            >
              Сбросить фильтры
            </a>
          </div>
        ) : (
          <>
            {/* Сетка категорий */}
            <CategoryGrid 
              categories={result.items} 
              showHeader={false}
            />

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
        )}
      </>
    )
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    throw error
  }
}

// Skeleton для загрузки
function CategoriesPageSkeleton() {
  return (
    <>
      {/* Статистика skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="glass-card p-6 animate-shimmer">
            <div className="w-8 h-8 bg-white/10 rounded-lg mx-auto mb-3"></div>
            <div className="h-6 bg-white/10 rounded w-16 mx-auto mb-1"></div>
            <div className="h-4 bg-white/10 rounded w-24 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Фильтры skeleton */}
      <div className="glass-card p-6 mb-8 animate-shimmer">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="h-12 bg-white/10 rounded-xl flex-1 max-w-md"></div>
          <div className="h-6 bg-white/10 rounded w-32"></div>
          <div className="h-12 bg-white/10 rounded-xl w-48"></div>
        </div>
      </div>

      {/* Сетка категорий skeleton */}
      <CategoryGridSkeleton count={18} />
    </>
  )
}

// Главный компонент страницы
export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const resolvedSearchParams = await searchParams

  // Хлебные крошки для категорий
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Категории' }
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
              <Grid3X3 className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Каталог категорий
            </h1>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Найдите промокоды и скидки в интересующих вас категориях. 
              Удобный поиск, фильтры и сортировка для быстрого поиска лучших предложений.
            </p>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="pb-16">
        <div className="container-main">
          <Suspense fallback={<CategoriesPageSkeleton />}>
            <CategoriesContent searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

// SEO метаданные
export async function generateMetadata() {
  try {
    const categories = await getCategories()
    const totalCategories = categories.length
    const totalPromocodes = categories.reduce((sum, cat) => sum + (cat.promocodes_count || 0), 0)
    
    return {
      title: 'Каталог категорий - промокоды и скидки по интересам | BoltPromo',
      description: `Выберите из ${totalCategories} категорий товаров и услуг с ${totalPromocodes} актуальными промокодами. Удобный поиск, фильтры и сортировка для поиска лучших скидок.`,
      keywords: [
        'категории промокодов',
        'скидки по категориям', 
        'каталог промокодов',
        'поиск промокодов',
        'фильтр промокодов'
      ].join(', '),
      openGraph: {
        title: 'Каталог категорий промокодов - BoltPromo',
        description: `${totalCategories} категорий с ${totalPromocodes} актуальными промокодами`,
        type: 'website',
        url: 'https://boltpromo.com/categories'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Каталог категорий промокодов - BoltPromo',
        description: `${totalCategories} категорий с ${totalPromocodes} актуальными промокодами`
      },
      alternates: {
        canonical: 'https://boltpromo.com/categories'
      }
    }
  } catch (error) {
    console.error('Ошибка генерации метаданных:', error)
    return {
      title: 'Каталог категорий - BoltPromo',
      description: 'Каталог категорий промокодов и скидок. Найдите лучшие предложения по интересам.'
    }
  }
}

// Viewport конфигурация
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}