import { Search, Filter, Tag, Store, Grid3X3, AlertCircle } from 'lucide-react'
import { Suspense } from 'react'
import Link from 'next/link'
import { searchAll } from '@/lib/search'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import SearchFilters from '@/components/search/SearchFilters'
import SearchResults from '@/components/search/SearchResults'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string
    type?: 'all' | 'promocodes' | 'stores' | 'categories'
    page?: string
    sort?: string
  }>
}

// Skeleton для загрузки результатов поиска
function SearchPageSkeleton() {
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

      {/* Результаты skeleton */}
      <div className="space-y-8">
        {/* Секция промокодов */}
        <div>
          <div className="h-8 bg-white/10 rounded w-48 mb-4 animate-shimmer"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="glass-card p-6 animate-shimmer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-white/10 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-6 bg-white/10 rounded w-full mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// Основной компонент с результатами
async function SearchContent({ searchParams }: { searchParams: any }) {
  const query = searchParams?.q || ''
  const type = searchParams?.type || 'all'
  const page = parseInt(searchParams?.page || '1', 10)
  const sort = searchParams?.sort || 'relevance'

  // Если нет поискового запроса, показываем пустое состояние
  if (!query.trim()) {
    return (
      <div className="glass-card p-12 text-center">
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-4">
          Введите поисковый запрос
        </h3>
        <p className="text-gray-400 mb-6">
          Используйте поиск в шапке сайта, чтобы найти промокоды, магазины или категории
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['техника', 'одежда', 'красота', 'еда', 'путешествия'].map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="glass-button-small px-4 py-2 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // Выполняем поиск
  const searchResults = await searchAll(query, { 
    type: type as any, 
    page, 
    limit: 20 
  })

  return (
    <>
      {/* Фильтры поиска */}
      <SearchFilters 
        query={query}
        type={type}
        totalResults={searchResults.total}
        results={searchResults}
      />

      {/* Результаты поиска */}
      <SearchResults
        query={query}
        results={searchResults}
        type={type}
        sort={sort}
      />
    </>
  )
}

// Главный компонент страницы
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams?.q || ''

  // Хлебные крошки для поиска
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { 
      label: query ? `Поиск: ${query}` : 'Поиск', 
      icon: <Search className="w-4 h-4 text-white" /> 
    }
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
              <Search className="w-10 h-10 text-white" />
            </div>
            
            {query ? (
              <>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                  Результаты поиска
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                  Поиск по запросу: <span className="text-white font-semibold">&quot;{query}&quot;</span>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                  Поиск промокодов
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                  Найдите лучшие промокоды, скидки и предложения от популярных интернет-магазинов
                </p>
              </>
            )}

            {/* Быстрая статистика поиска */}
            {query && (
              <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>Промокоды</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span>Магазины</span>
                </div>
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  <span>Категории</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="pb-16">
        <div className="container-main">
          <Suspense fallback={<SearchPageSkeleton />}>
            <SearchContent searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

// SEO метаданные
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const query = resolvedParams?.q

  if (query) {
    return {
      title: `Поиск: ${query} - результаты поиска промокодов | BoltPromo`,
      description: `Результаты поиска по запросу "${query}". Найдите лучшие промокоды, скидки и предложения от интернет-магазинов на BoltPromo.`,
      keywords: [
        `поиск ${query}`,
        `промокоды ${query}`,
        `скидки ${query}`,
        'поиск промокодов',
        'поиск скидок'
      ].join(', '),
      openGraph: {
        title: `Поиск: ${query} - BoltPromo`,
        description: `Результаты поиска промокодов и скидок по запросу "${query}"`,
        type: 'website',
        url: `https://boltpromo.com/search?q=${encodeURIComponent(query)}`
      },
      robots: {
        index: false, // Не индексируем страницы поиска
        follow: true
      }
    }
  }

  return {
    title: 'Поиск промокодов и скидок - BoltPromo',
    description: 'Найдите лучшие промокоды, скидки и предложения от популярных интернет-магазинов. Быстрый и удобный поиск по всем категориям.',
    keywords: [
      'поиск промокодов',
      'поиск скидок',
      'найти промокод',
      'найти скидку',
      'поиск по магазинам'
    ].join(', '),
    openGraph: {
      title: 'Поиск промокодов - BoltPromo',
      description: 'Найдите лучшие промокоды и скидки от популярных магазинов',
      type: 'website',
      url: 'https://boltpromo.com/search'
    },
    alternates: {
      canonical: 'https://boltpromo.com/search'
    }
  }
}

// Viewport конфигурация
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}