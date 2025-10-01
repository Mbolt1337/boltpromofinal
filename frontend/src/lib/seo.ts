// frontend/src/lib/seo.ts
import type { Metadata } from 'next'

// ✅ ИСПРАВЛЕНО: Правильный URL .ru и email .ru
export const SITE_CONFIG = {
  name: 'BoltPromo',
  title: 'BoltPromo - Лучшие промокоды и скидки от популярных интернет-магазинов',
  description: 'Актуальные промокоды, купоны и скидки от популярных интернет-магазинов. Экономьте на покупках с BoltPromo.',
  url: 'https://boltpromo.ru', // ✅ ИСПРАВЛЕНО: .ru вместо .com
  ogImage: 'https://boltpromo.ru/og-image.jpg', // ✅ ИСПРАВЛЕНО: .ru вместо .com
  links: {
    twitter: 'https://twitter.com/boltpromo',
    telegram: 'https://t.me/boltpromo'
  }
}

// Типы для SEO данных
interface SEOData {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' // ✅ ИСПРАВЛЕНО: Убран 'product' для совместимости с Next.js 15
  jsonLd?: Record<string, any>
  noIndex?: boolean
}

// ✅ ДОБАВЛЕНО: Мемоизация метаданных для производительности
const metadataCache = new Map<string, Metadata>()

// Функция для создания метаданных
export function createMetadata(data: SEOData): Metadata {
  const cacheKey = JSON.stringify(data)
  
  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey)!
  }

  const title = data.title.includes(SITE_CONFIG.name) 
    ? data.title 
    : `${data.title} | ${SITE_CONFIG.name}`

  const metadata: Metadata = {
    title,
    description: data.description,
    keywords: data.keywords?.join(', '),
    openGraph: {
      title,
      description: data.description,
      url: data.canonical || SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: data.ogImage || SITE_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: 'ru_RU',
      type: data.ogType || 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: data.description,
      images: [data.ogImage || SITE_CONFIG.ogImage],
      creator: '@boltpromo'
    },
    robots: {
      index: !data.noIndex,
      follow: !data.noIndex,
      googleBot: {
        index: !data.noIndex,
        follow: !data.noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    alternates: {
      canonical: data.canonical
    }
  }

  // Кешируем результат
  metadataCache.set(cacheKey, metadata)
  return metadata
}

// JSON-LD компоненты
export const JsonLd = {
  // Организация для главной страницы
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@boltpromo.ru' // ✅ ИСПРАВЛЕНО: .ru вместо .com
    },
    sameAs: [
      SITE_CONFIG.links.twitter,
      SITE_CONFIG.links.telegram
    ]
  }),

  // Веб-сайт
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }),

  // Магазин
  store: (store: any) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    description: store.description || `Промокоды и скидки для магазина ${store.name}`,
    url: store.url,
    image: store.logo,
    aggregateRating: store.rating ? {
      '@type': 'AggregateRating',
      ratingValue: store.rating,
      ratingCount: store.reviews_count || 100,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    offers: store.promocodes_count ? {
      '@type': 'AggregateOffer',
      offerCount: store.promocodes_count,
      availability: 'https://schema.org/InStock'
    } : undefined
  }),

  // Категория с хлебными крошками
  category: (category: any, breadcrumbs: { name: string, url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `Промокоды и скидки в категории ${category.name}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    }
  }),

  // Промокод/Оффер
  promocode: (promo: any, store: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: promo.title,
    description: promo.description,
    seller: {
      '@type': 'Organization',
      name: store.name,
      url: store.url
    },
    availability: promo.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    validThrough: promo.expires_at,
    priceSpecification: promo.discount_amount ? {
      '@type': 'PriceSpecification',
      price: promo.discount_amount,
      priceCurrency: 'RUB'
    } : undefined
  })
}

// Генератор ключевых слов
export function generateKeywords(base: string[], specific: string[] = []): string[] {
  const commonKeywords = [
    'промокоды',
    'скидки', 
    'купоны',
    'акции',
    'распродажа',
    'кэшбэк',
    'выгода',
    'экономия',
    'интернет магазины',
    'онлайн покупки'
  ]
  
  return Array.from(new Set([...base, ...specific, ...commonKeywords]))
}

// Функции для конкретных страниц
export const generateHomeMetadata = async () => {
  try {
    // Здесь можно получить актуальную статистику
    const stats = {
      stores: 100,
      promocodes: 500,
      categories: 50
    }

    return createMetadata({
      title: 'BoltPromo - Лучшие промокоды и скидки от популярных интернет-магазинов',
      // ✅ ИСПРАВЛЕНО: Убраны эмодзи согласно ТЗ
      description: `Актуальные промокоды и скидки от ${stats.stores}+ магазинов! ${stats.promocodes}+ проверенных предложений в ${stats.categories}+ категориях. Экономьте на покупках прямо сейчас!`,
      keywords: generateKeywords([
        'лучшие промокоды',
        'актуальные скидки',
        'проверенные купоны',
        'экономия на покупках'
      ]),
      canonical: SITE_CONFIG.url,
      jsonLd: [
        JsonLd.organization(),
        JsonLd.website()
      ]
    })
  } catch (error) {
    console.error('Error generating home metadata:', error)
    return createMetadata({
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      canonical: SITE_CONFIG.url
    })
  }
}

export const generateStoreMetadata = (store: any) => {
  const keywords = generateKeywords([
    `промокоды ${store.name}`,
    `скидки ${store.name}`,
    `купоны ${store.name}`,
    store.name.toLowerCase()
  ])

  return createMetadata({
    title: `Промокоды ${store.name} - Актуальные скидки и купоны`,
    // ✅ ИСПРАВЛЕНО: Убраны эмодзи согласно ТЗ
    description: `Лучшие промокоды и скидки для ${store.name}! ${store.promocodes_count || 'Множество'} актуальных предложений. Экономьте на покупках в ${store.name} с BoltPromo.`,
    keywords,
    canonical: `${SITE_CONFIG.url}/stores/${store.slug}`,
    ogImage: store.logo || SITE_CONFIG.ogImage,
    jsonLd: JsonLd.store(store)
  })
}

export const generateCategoryMetadata = (category: any) => {
  const keywords = generateKeywords([
    `промокоды ${category.name}`,
    `скидки ${category.name}`,
    `купоны ${category.name}`,
    category.name.toLowerCase()
  ])

  const breadcrumbs = [
    { name: 'Главная', url: SITE_CONFIG.url },
    { name: 'Категории', url: `${SITE_CONFIG.url}/categories` },
    { name: category.name, url: `${SITE_CONFIG.url}/categories/${category.slug}` }
  ]

  return createMetadata({
    title: `Промокоды ${category.name} - Скидки и купоны в категории`,
    // ✅ ИСПРАВЛЕНО: Убраны эмодзи согласно ТЗ
    description: `Все промокоды и скидки в категории "${category.name}"! ${category.promocodes_count || 'Множество'} актуальных предложений от проверенных магазинов.`,
    keywords,
    canonical: `${SITE_CONFIG.url}/categories/${category.slug}`,
    jsonLd: JsonLd.category(category, breadcrumbs)
  })
}

export const generateSearchMetadata = (query: string, resultsCount: number = 0) => {
  return createMetadata({
    title: `Поиск "${query}" - Результаты поиска промокодов`,
    description: `Результаты поиска по запросу "${query}". ${resultsCount > 0 ? `Найдено ${resultsCount} предложений` : 'Ищите промокоды и скидки'} на BoltPromo.`,
    keywords: generateKeywords([
      query,
      `поиск ${query}`,
      `${query} промокоды`,
      `${query} скидки`
    ]),
    canonical: `${SITE_CONFIG.url}/search?q=${encodeURIComponent(query)}`,
    noIndex: resultsCount === 0 // Не индексируем пустые результаты
  })
}

// ✅ ДОБАВЛЕНО: Функция очистки кеша для dev режима
export const clearMetadataCache = () => {
  metadataCache.clear()
  console.log('[SEO] Metadata cache cleared')
}