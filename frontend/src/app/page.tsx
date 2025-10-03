// frontend/src/app/page.tsx
import { Suspense } from 'react'
import { lazy } from 'react'
import type { Metadata } from 'next'
import BannerCarousel from '@/components/BannerCarousel'
import JsonLd from '@/components/seo/JsonLd'
import { getCategories, getGlobalStats } from '@/lib/api'
import { JsonLd as JsonLdSchemas, SITE_CONFIG } from '@/lib/seo'
import { CategoryGridSkeleton } from '@/components/CategoryGrid'
import ShowcaseSection from '@/components/ShowcaseSection'
import { createOgImageObject } from '@/lib/og-utils'

// B2: Ленивая загрузка неприоритетных компонентов для улучшения LCP
const PromoList = lazy(() => import('@/components/PromoList'))
const StoreGrid = lazy(() => import('@/components/StoreGrid'))
const CategoryGrid = lazy(() => import('@/components/CategoryGrid'))
const PartnersCarousel = lazy(() => import('@/components/PartnersCarousel'))

// B2: Скелеты для ленивых компонентов
function PromoListSkeleton() {
  return (
    <section className="py-16">
      <div className="container-main">
        <div className="text-center mb-12">
          <div className="h-10 bg-white/10 rounded-xl w-64 mx-auto mb-4 animate-shimmer"></div>
          <div className="h-6 bg-white/10 rounded-lg w-96 mx-auto animate-shimmer"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
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
      </div>
    </section>
  )
}

function StoreGridSkeleton() {
  return (
    <section className="py-16">
      <div className="container-main">
        <div className="text-center mb-12">
          <div className="h-10 bg-white/10 rounded-xl w-64 mx-auto mb-4 animate-shimmer"></div>
          <div className="h-6 bg-white/10 rounded-lg w-96 mx-auto animate-shimmer"></div>
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
      </div>
    </section>
  )
}

function PartnersCarouselSkeleton() {
  return (
    <section className="py-16">
      <div className="container-main">
        <div className="glass-card p-8 mb-12 animate-shimmer">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-xl mx-auto mb-4"></div>
            <div className="h-8 bg-white/10 rounded-xl w-64 mx-auto mb-3"></div>
            <div className="h-5 bg-white/10 rounded-lg w-96 mx-auto"></div>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div 
                key={index} 
                className="glass-card p-8 h-32 w-48 flex-shrink-0 animate-shimmer"
              >
                <div className="w-full h-full bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Компонент для загрузки категорий
async function CategoriesSection() {
  try {
    const categories = await getCategories()
    return <CategoryGrid categories={categories} limit={12} />
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    return <CategoryGridSkeleton count={12} />
  }
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD структурированные данные для главной страницы */}
      <JsonLd data={[
        JsonLdSchemas.organization(),
        JsonLdSchemas.website()
      ]} />
      
      {/* B2: Приоритетная карусель баннеров - НЕ ленивая для LCP */}
      <section aria-label="Рекламные баннеры">
        <BannerCarousel
          autoplay={true}
          interval={6000}
          showControls={true}
          priority={true}
        />
      </section>

      {/* Showcase Section - Подборки промокодов */}
      <section aria-label="Подборки промокодов">
        <Suspense fallback={<div className="py-12"><div className="container mx-auto px-4"><div className="h-64 bg-white/5 rounded-2xl animate-pulse"></div></div></div>}>
          <ShowcaseSection />
        </Suspense>
      </section>

      {/* B2: Ленивая загрузка промокодов (ниже fold) */}
      <section aria-label="Популярные промокоды">
        <Suspense fallback={<PromoListSkeleton />}>
          <PromoList limit={6} />
        </Suspense>
      </section>

      {/* B2: Ленивая загрузка магазинов */}
      <section aria-label="Топ магазины">
        <Suspense fallback={<StoreGridSkeleton />}>
          <StoreGrid limit={12} />
        </Suspense>
      </section>

      {/* B2: Ленивая загрузка категорий */}
      <section aria-label="Популярные категории">
        <Suspense fallback={<CategoryGridSkeleton count={12} />}>
          <CategoriesSection />
        </Suspense>
      </section>

      {/* B2: Ленивая загрузка партнеров (самая низкая секция) */}
      <section aria-label="Наши партнеры">
        <Suspense fallback={<PartnersCarouselSkeleton />}>
          <PartnersCarousel />
        </Suspense>
      </section>

      {/* Скрытый контент для SEO */}
      <div className="sr-only">
        <h1>BoltPromo - Промокоды и скидки от интернет-магазинов</h1>
        <p>
          BoltPromo предлагает актуальные промокоды, купоны и скидки от популярных 
          интернет-магазинов. Экономьте на покупках техники, одежды, красоты, еды 
          и других товаров. Все предложения проверены и регулярно обновляются.
        </p>
        <ul>
          <li>Актуальные промокоды от 100+ магазинов</li>
          <li>Проверенные скидки и купоны</li>
          <li>Удобный поиск по категориям</li>
          <li>Регулярные обновления предложений</li>
          <li>Бесплатное использование сервиса</li>
        </ul>
      </div>
    </>
  )
}

// SEO метаданные для главной страницы
export async function generateMetadata() {
  try {
    const [globalStats, ogImage] = await Promise.all([
      getGlobalStats(),
      createOgImageObject()
    ])

    const categoriesCount = globalStats.active_categories || 50
    const storesCount = globalStats.active_stores || 100
    const promocodesCount = globalStats.active_promocodes || 500

    const description = `Лучшие промокоды и скидки от ${storesCount}+ популярных интернет-магазинов России. ${promocodesCount}+ актуальных предложений в ${categoriesCount}+ категориях. Экономьте на покупках техники, одежды, красоты и многого другого. Все промокоды проверены и регулярно обновляются.`

    return {
      title: 'BoltPromo - Лучшие промокоды и скидки от популярных интернет-магазинов России',
      description: description,
      keywords: [
        'промокоды',
        'скидки',
        'купоны',
        'кэшбэк',
        'интернет магазины',
        'онлайн покупки',
        'экономия',
        'выгодные покупки',
        'акции магазинов',
        'распродажи',
        'дисконт',
        'промо акции',
        'скидочные купоны',
        'коды скидок',
        'выгодные предложения'
      ].join(', '),
      openGraph: {
        title: 'BoltPromo - Экономьте на покупках с лучшими промокодами России',
        description: `${promocodesCount}+ актуальных промокодов от ${storesCount}+ проверенных магазинов. Экономьте на каждой покупке!`,
        url: SITE_CONFIG.url,
        siteName: SITE_CONFIG.name,
        images: ogImage ? [ogImage] : [
          {
            url: `${SITE_CONFIG.url}/og-home.jpg`,
            width: 1200,
            height: 630,
            alt: 'BoltPromo - промокоды и скидки от популярных магазинов'
          }
        ],
        locale: 'ru_RU',
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: 'BoltPromo - Промокоды от 100+ магазинов России',
        description: `Экономьте на покупках с ${promocodesCount}+ актуальными промокодами от проверенных магазинов!`,
        images: ogImage ? [ogImage.url] : [`${SITE_CONFIG.url}/og-home.jpg`],
        creator: '@boltpromo'
      },
      alternates: {
        canonical: SITE_CONFIG.url
      },
      other: {
        'application-name': SITE_CONFIG.name,
        'apple-mobile-web-app-title': SITE_CONFIG.name,
        'msapplication-tooltip': 'Лучшие промокоды и скидки России',
        'rating': 'general',
        'distribution': 'global',
        'revisit-after': '1 days',
        'language': 'ru',
        'geo.region': 'RU',
        'geo.country': 'Russia'
      }
    }
  } catch (error) {
    console.error('Ошибка при генерации метаданных главной страницы:', error)

    return {
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      alternates: {
        canonical: SITE_CONFIG.url
      }
    }
  }
}