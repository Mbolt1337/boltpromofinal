import { getStore, getPromocodes, getRelatedStores, getStoreStats } from '@/lib/api'
import type { Promocode } from '@/lib/api'
import { Store, ArrowLeft, ExternalLink, Calendar, Star, TrendingUp, Flame, Users, Tag, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import PromoCard from '@/components/PromoCard'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SITE_CONFIG } from '@/lib/seo'

interface StorePageProps {
  params: Promise<{
    slug: string
  }>
}

// Skeleton компоненты - определены локально
function StoreStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="glass-card p-6 text-center animate-shimmer">
          <div className="w-8 h-8 bg-white/10 rounded-lg mx-auto mb-3"></div>
          <div className="h-6 bg-white/10 rounded w-16 mx-auto mb-1"></div>
          <div className="h-4 bg-white/10 rounded w-20 mx-auto"></div>
        </div>
      ))}
    </div>
  )
}

function RelatedStoresSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass-card p-6 animate-shimmer">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-16"></div>
            </div>
          </div>
          <div className="h-4 bg-white/10 rounded w-full mb-3"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

// Компонент рейтинга с звездочками
function StoreRating({ rating }: { rating?: number }) {
  if (!rating || typeof rating !== 'number' || isNaN(rating)) return null
  
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center">
        {/* Полные звезды */}
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
        
        {/* Половинчатая звезда */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-5 h-5 text-gray-400" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>
        )}
        
        {/* Пустые звезды */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-gray-400" />
        ))}
      </div>
      
      <span className="text-white font-semibold text-lg">{rating.toFixed(1)}</span>
      <span className="text-gray-400 text-sm">из 5</span>
    </div>
  )
}

// Компонент статистики магазина
async function StoreStats({ slug }: { slug: string }) {
  try {
    const stats = await getStoreStats(slug)
    
    const statItems = [
      {
        icon: Tag,
        value: stats.promocodes_count,
        label: 'Промокодов',
        color: 'text-blue-400'
      },
      {
        icon: Flame,
        value: stats.hot_promocodes,
        label: 'Горячих',
        color: 'text-orange-400'
      },
      {
        icon: Users,
        value: stats.total_views,
        label: 'Просмотров',
        color: 'text-green-400'
      },
      {
        icon: TrendingUp,
        value: stats.active_promocodes,
        label: 'Активных',
        color: 'text-purple-400'
      }
    ]
    
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statItems.map((item, index) => (
          <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
            <item.icon className={`w-8 h-8 mx-auto mb-3 ${item.color}`} />
            <div className="text-2xl font-bold text-white mb-1">
              {item.value.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    // Возвращаем skeleton при ошибке
    return <StoreStatsSkeleton />
  }
}

// Компонент похожих магазинов
async function RelatedStores({ slug }: { slug: string }) {
  try {
    const relatedStores = await getRelatedStores(slug, 6)
    
    if (relatedStores.length === 0) {
      return (
        <section className="py-16">
          <div className="container-main">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-4">
                Другие магазины
              </h3>
              <p className="text-gray-400 mb-8">
                Рекомендации временно недоступны
              </p>
              <Link href="/stores" className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105">
                <Store className="w-5 h-5 mr-2" />
                <span>Смотреть все магазины</span>
              </Link>
            </div>
          </div>
        </section>
      )
    }
    
    return (
      <section className="py-16">
        <div className="container-main">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Похожие магазины
            </h3>
            <p className="text-gray-400 text-lg">
              Другие популярные магазины со скидками
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedStores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
              >
                {/* Логотип и информация */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300 flex-shrink-0">
                    {store.logo ? (
                      <Image
                        src={store.logo}
                        alt={store.name}
                        width={48}
                        height={48}
                        className="rounded-xl object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <Store className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-lg truncate group-hover:text-blue-300 transition-colors">
                      {store.name}
                    </h4>
                    {store.rating && typeof store.rating === 'number' && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-yellow-400 font-medium">{store.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {store.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                    {store.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400 font-medium">
                    {store.promocodes_count || 0} промокодов
                  </span>
                  {store.is_active && (
                    <div className="flex items-center gap-1 text-blue-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs">Активен</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/stores" className="inline-flex items-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105">
              <Store className="w-5 h-5 mr-2" />
              <span>Все магазины</span>
            </Link>
          </div>
        </div>
      </section>
    )
  } catch (error) {
    // При ошибке показываем fallback
    return (
      <section className="py-16">
        <div className="container-main">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Популярные магазины
            </h3>
            <p className="text-gray-400 mb-8">
              Временные проблемы с загрузкой рекомендаций
            </p>
            <Link href="/stores" className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105">
              <Store className="w-5 h-5 mr-2" />
              <span>Смотреть все магазины</span>
            </Link>
          </div>
        </div>
      </section>
    )
  }
}

export default async function StorePage({ params }: StorePageProps) {
  try {
    const { slug } = await params
    const store = await getStore(slug)
    
    // Проверка на null для store
    if (!store) {
      notFound()
    }
    
    // Добавлен правильный тип Promocode[]
    let promocodes: Promocode[] = []
    try {
      // Загружаем промокоды ТОЛЬКО для этого магазина
      const response = await getPromocodes({
        store: slug,
        page_size: 999  // Загружаем все промокоды магазина
      })
      promocodes = response.results
    } catch (error) {
      // Тихо обрабатываем ошибку загрузки промокодов
      promocodes = []
    }

    // Хлебные крошки
    const breadcrumbItems = [
      { label: 'Главная', href: '/' },
      { label: 'Магазины', href: '/stores' },
      { label: store.name }
    ]

    return (
      <div className="min-h-screen">
        {/* JSON-LD Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              'name': store.name,
              'url': store.url || `${SITE_CONFIG.url}/stores/${store.slug}`,
              ...(store.logo && { 'logo': store.logo }),
              ...(store.description && { 'description': store.description })
            }, null, 0)
          }}
        />

        {/* Хлебные крошки */}
        <div className="container-main py-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Информация о магазине */}
        <section className="py-8">
          <div className="container-main">
            <div className="glass-card p-8 mb-8">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Логотип */}
                <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform duration-300">
                  {store.logo ? (
                    <Image
                      src={store.logo}
                      alt={store.name}
                      width={128}
                      height={128}
                      className="rounded-3xl object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <Store className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                        {store.name}
                      </h1>
                      
                      {/* Рейтинг */}
                      <StoreRating rating={store.rating} />
                    </div>
                    
                    {/* Кнопка перехода в магазин - убрана ссылка на site_url */}
                    {store.url && (
                      <Link
                        href={store.url}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>Перейти в магазин</span>
                        <ExternalLink className="w-5 h-5 ml-2" />
                      </Link>
                    )}
                  </div>

                  {/* Описание */}
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {store.description || 'Популярный интернет-магазин с широким ассортиментом товаров и выгодными предложениями для покупателей.'}
                  </p>

                  {/* Категории магазина */}
                  {store.categories && store.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {store.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white text-sm transition-all duration-300"
                        >
                          <Tag className="w-3 h-3" />
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Статистика магазина */}
            <Suspense fallback={<StoreStatsSkeleton />}>
              <StoreStats slug={slug} />
            </Suspense>
          </div>
        </section>

        {/* Промокоды */}
        <section className="py-8">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Актуальные промокоды
              </h2>
              <p className="text-gray-400 text-lg">
                Все доступные предложения от {store.name}
              </p>
            </div>

            {promocodes.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Промокоды скоро появятся
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Мы работаем над добавлением актуальных предложений от {store.name}. 
                  Тем временем посмотрите другие магазины с промокодами.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/stores"
                    className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    <span>Другие магазины</span>
                  </Link>
                  <Link
                    href="/hot"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    <span>Горячие промокоды</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promocodes.map((promo) => (
                  <PromoCard key={promo.id} promo={promo} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Похожие магазины */}
        <Suspense fallback={
          <section className="py-16">
            <div className="container-main">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Похожие магазины
                </h3>
              </div>
              <RelatedStoresSkeleton count={6} />
            </div>
          </section>
        }>
          <RelatedStores slug={slug} />
        </Suspense>
      </div>
    )
    
  } catch (error) {
    console.error('Критическая ошибка загрузки страницы магазина:', error)
    notFound()
  }
}

// SEO метаданные
export async function generateMetadata({ params }: StorePageProps) {
  try {
    const { slug } = await params
    const store = await getStore(slug)
    
    // Проверка на null для store в метаданных
    if (!store) {
      return {
        title: 'Магазин - BoltPromo',
        description: 'Промокоды и скидки от популярных магазинов',
      }
    }
    
    return {
      title: store.meta_title || `${store.name} - промокоды и скидки | BoltPromo`,
      description: store.meta_description || store.description || `Актуальные промокоды и скидки ${store.name}. Экономьте на покупках с лучшими предложениями от проверенного партнера.`,
      keywords: [
        `промокоды ${store.name}`,
        `скидки ${store.name}`,
        store.name,
        'промокоды',
        'скидки',
        'купоны'
      ].join(', '),
      openGraph: {
        title: `${store.name} - промокоды и скидки | BoltPromo`,
        description: store.description || `Актуальные промокоды ${store.name}`,
        images: store.logo ? [store.logo] : [],
        type: 'website',
        url: `https://boltpromo.com/stores/${slug}`
      },
      twitter: {
        card: 'summary_large_image',
        title: `${store.name} - промокоды и скидки`,
        description: store.description || `Актуальные промокоды ${store.name}`
      },
      alternates: {
        canonical: `https://boltpromo.com/stores/${slug}`
      }
    }
  } catch (error) {
    return {
      title: 'Магазин - BoltPromo',
      description: 'Промокоды и скидки от популярных магазинов',
    }
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}