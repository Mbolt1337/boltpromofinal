import { getCategory, getCategoryPromocodes } from '@/lib/api'
import { Tag, ArrowLeft, Calendar, Home, ChevronRight, Filter } from 'lucide-react'
import { getCategoryIcon } from '@/lib/utils'
import Link from 'next/link'
import PromoCard from '@/components/PromoCard'
import Pagination from '@/components/ui/Pagination'
import CategorySearch from '@/components/CategorySearch'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CategoryGridSkeleton } from '@/components/CategoryGrid'
import type { PaginationInfo } from '@/types'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{
    sort?: string
    page?: string
    search?: string
  }>
}

// Компонент хлебных крошек
function Breadcrumbs({ category }: { category: { name: string; slug: string } }) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-8">
      <Link 
        href="/" 
        className="text-gray-400 hover:text-white transition-colors flex items-center"
      >
        <Home className="w-4 h-4 mr-1" />
        Главная
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-500" />
      <Link 
        href="/categories" 
        className="text-gray-400 hover:text-white transition-colors"
      >
        Категории
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-500" />
      <span className="text-white font-medium">
        {category.name || category.slug}
      </span>
    </nav>
  )
}

// ИСПРАВЛЕНО: Компонент блока фильтров с сохранением всех параметров
function CategoryFilters({ 
  currentSort = 'new',
  currentSearch = '',
  currentPage = 1
}: { 
  currentSort?: string
  currentSearch?: string
  currentPage?: number
}) {
  const sortOptions = [
    { value: 'new', label: 'Новые' },
    { value: 'popular', label: 'Популярные' },
    { value: 'expiring', label: 'Скоро истекают' },
    { value: 'hot', label: 'Горячие' }
  ]

  const buildUrl = (newSort: string) => {
    const params = new URLSearchParams()
    
    // ИСПРАВЛЕНО: Сохраняем поиск если есть
    if (currentSearch.trim()) {
      params.set('search', currentSearch.trim())
    }
    
    if (newSort !== 'new') {
      params.set('sort', newSort)
    }
    
    // НЕ сохраняем page - сбрасываем к первой при смене сортировки
    
    const queryString = params.toString()
    return `${queryString ? `?${queryString}` : ''}`
  }

  return (
    <div className="glass-card p-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-white font-medium">Сортировка:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={buildUrl(option.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                currentSort === option.value
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ИСПРАВЛЕНО: Компонент списка промокодов категории с правильными пустыми состояниями
async function CategoryPromoList({ 
  slug, 
  sort = 'new',
  page = 1,
  search = ''
}: { 
  slug: string
  sort?: string 
  page?: number
  search?: string
}) {
  try {
    // ИСПРАВЛЕНО: Передаем search параметр если он есть
    const response = await getCategoryPromocodes(slug, {
      ordering: sort === 'new' ? '-created_at' : 
                sort === 'popular' ? '-views_count' :
                sort === 'expiring' ? 'expires_at' :
                sort === 'hot' ? '-is_hot' : '-created_at',
      page: page,
      limit: 12, // ✅ Соответствует backend PAGE_SIZE
      search: search || undefined
    })

    // ИСПРАВЛЕНО: Деструктурируем правильные поля
    const { results: promocodes, count, next, previous, category } = response

    // ИСПРАВЛЕНО: ПОЛЬЗОВАТЕЛЬСКИЕ тексты вместо админских
    if (promocodes.length === 0) {
      return (
        <div className="space-y-8">
          <div className="glass-card p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              {search ? 'По вашему запросу ничего не найдено' : 'Промокоды скоро появятся'}
            </h3>
            <p className="text-gray-400 mb-6">
              {search 
                ? `Попробуйте изменить поисковый запрос "${search}" или посмотрите другие категории`
                : `В категории "${category?.name || slug}" пока нет доступных предложений. Загляните позже или посмотрите другие категории.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/categories" 
                className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Все категории</span>
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 hover:text-blue-200 font-medium transition-all duration-300 hover:scale-105"
              >
                <span>На главную</span>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // ИСПРАВЛЕНО: Создаем объект пагинации для компонента Pagination
    const totalPages = Math.ceil(count / 12)
    const paginationInfo: PaginationInfo = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: count,
      itemsPerPage: 12,
      hasNext: !!next,
      hasPrevious: !!previous
    }

    return (
      <div className="space-y-8">
        {/* Информация о результатах */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            {search 
              ? `Найдено ${count} ${count === 1 ? 'промокод' : count < 5 ? 'промокода' : 'промокодов'} по запросу "${search}"`
              : `Показано ${count} ${count === 1 ? 'промокод' : count < 5 ? 'промокода' : 'промокодов'}`
            }
          </p>
          <p className="text-gray-400 text-sm">
            Страница {page} из {totalPages}
          </p>
        </div>

        {/* Сетка промокодов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promocodes.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>

        {/* ДОБАВЛЕНО: Компонент пагинации */}
        {totalPages > 1 && (
          <Pagination 
            pagination={paginationInfo} 
            showQuickJump={totalPages > 10}
            showPageInfo={true}
            className="mt-12"
          />
        )}
      </div>
    )
  } catch (error) {
    console.error('Ошибка загрузки промокодов категории:', error)
    return (
      <div className="glass-card p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-4">
          Временные неполадки
        </h3>
        <p className="text-gray-400 mb-6">
          Произошла ошибка при загрузке промокодов. Попробуйте обновить страницу или вернуться позже.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/categories" 
            className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Все категории</span>
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 hover:text-blue-200 font-medium transition-all duration-300 hover:scale-105"
          >
            <span>Обновить страницу</span>
          </button>
        </div>
      </div>
    )
  }
}

// Skeleton для загрузки промокодов
function CategoryPromoSkeleton() {
  return (
    <div className="space-y-8">
      {/* Skeleton для информации о результатах */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-white/10 rounded w-48"></div>
        <div className="h-4 bg-white/10 rounded w-24"></div>
      </div>

      {/* Skeleton для сетки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="glass-card p-6 animate-shimmer rounded-2xl"
          >
            <div className="animate-pulse">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
                  <div>
                    <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-white/10 rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="mb-6">
                <div className="h-6 bg-white/10 rounded w-full mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
              
              {/* Button */}
              <div className="h-12 bg-white/10 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton для пагинации */}
      <div className="flex items-center justify-center gap-2 py-8">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="w-12 h-12 bg-white/5 rounded-xl animate-shimmer"></div>
        ))}
      </div>
    </div>
  )
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  try {
    const { slug } = await params
    const searchParamsResolved = await searchParams
    
    // ИСПРАВЛЕНО: Читаем все параметры включая search
    const sort = searchParamsResolved?.sort || 'new'
    const page = parseInt(searchParamsResolved?.page || '1', 10)
    const search = searchParamsResolved?.search || ''
    
    // Получаем категорию
    const category = await getCategory(slug)
    
    if (!category) {
      notFound()
    }

    // Создаем fallback название если name пустое
    const displayName = category.name || category.slug.charAt(0).toUpperCase() + category.slug.slice(1).replace(/-/g, ' ')

    // ИСПРАВЛЕНО: Получаем динамическую иконку категории
    const CategoryIconComponent = getCategoryIcon(category.icon || category.slug)

    return (
      <div className="min-h-screen">
        {/* Навигация и хлебные крошки */}
        <div className="container-main py-6">
          <Link
            href="/categories"
            className="inline-flex items-center px-4 py-2 mb-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Все категории</span>
          </Link>
          
          <Breadcrumbs category={{ ...category, name: displayName }} />
        </div>

        {/* Герой-блок категории */}
        <section className="py-8">
          <div className="container-main">
            <div className="glass-card p-8 mb-8 text-center">
              <div className="max-w-4xl mx-auto">
                {/* ИСПРАВЛЕНО: Динамическая иконка категории */}
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <CategoryIconComponent className="w-10 h-10 text-white" />
                </div>
                
                {/* Заголовок */}
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                  {displayName}
                </h1>
                
                {/* Описание */}
                <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                  {category.description?.trim() || `Актуальные промокоды и скидки в категории ${displayName}. Экономьте на покупках с лучшими предложениями от проверенных партнеров.`}
                </p>
                
                {/* Статистика */}
                {category.promocodes_count !== undefined && (
                  <div className="inline-flex items-center px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                    <Tag className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-white font-semibold">
                      {category.promocodes_count} {category.promocodes_count === 1 ? 'промокод' : category.promocodes_count < 5 ? 'промокода' : 'промокодов'} доступно
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ИСПРАВЛЕНО: Поиск внутри категории с передачей параметров */}
        <section className="pb-4">
          <div className="container-main">
            <CategorySearch currentSort={sort} />
          </div>
        </section>

        {/* ИСПРАВЛЕНО: Фильтры с передачей всех параметров */}
        <section className="pb-8">
          <div className="container-main">
            <CategoryFilters 
              currentSort={sort} 
              currentSearch={search}
              currentPage={page}
            />
          </div>
        </section>

        {/* Промокоды категории */}
        <section className="pb-16">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {search ? `Результаты поиска: "${search}"` : 'Актуальные предложения'}
              </h2>
              <p className="text-gray-400 text-lg">
                Промокоды и скидки в категории {displayName}
              </p>
            </div>

            <Suspense fallback={<CategoryPromoSkeleton />}>
              <CategoryPromoList 
                slug={slug} 
                sort={sort} 
                page={page}
                search={search}
              />
            </Suspense>
          </div>
        </section>
      </div>
    )
    
  } catch (error) {
    console.error('Ошибка загрузки страницы категории:', error)
    notFound()
  }
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  try {
    const { slug } = await params
    const category = await getCategory(slug)
    
    if (!category) {
      return {
        title: 'Категория не найдена - BoltPromo',
        description: 'Запрашиваемая категория не найдена',
      }
    }

    const displayName = category.name || category.slug.charAt(0).toUpperCase() + category.slug.slice(1).replace(/-/g, ' ')
    
    return {
      title: category.meta_title || `${displayName} - промокоды и скидки | BoltPromo`,
      description: category.meta_description || category.description || `Актуальные промокоды и скидки в категории ${displayName}. Экономьте на покупках с лучшими предложениями от проверенных партнеров.`,
      openGraph: {
        title: `${displayName} - промокоды и скидки`,
        description: category.description || `Актуальные промокоды в категории ${displayName}`,
        type: 'website',
      },
      // JSON-LD структурированные данные
      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CategoryPage',
          name: displayName,
          description: category.description,
          url: `https://boltpromo.com/categories/${category.slug}`,
          mainEntity: {
            '@type': 'ItemList',
            name: `Промокоды ${displayName}`,
            description: `Список актуальных промокодов в категории ${displayName}`
          }
        })
      }
    }
  } catch (error) {
    return {
      title: 'Категория - BoltPromo',
      description: 'Промокоды и скидки по категориям',
    }
  }
}

// Добавляем viewport
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
}