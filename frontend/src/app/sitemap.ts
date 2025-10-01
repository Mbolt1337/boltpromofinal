import { MetadataRoute } from 'next'
import { getCategories, getStores, getPromocodes, getShowcases } from '@/lib/api'
import { SITE_CONFIG } from '@/lib/seo'

// ✅ ИСПРАВЛЕНО: Принудительно делаем route динамическим
export const dynamic = 'force-dynamic'

// Конфигурация sitemap
const SITEMAP_CONFIG = {
  MAX_STORES: 1000,      // Максимум магазинов
  MAX_PROMOCODES: 5000,  // Максимум промокодов
  BATCH_SIZE: 100,       // Размер батча для пагинации
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url

  // Статические страницы с приоритетами
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stores`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/showcases`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hot`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    }
  ]

  try {
    console.log('[SITEMAP] Генерация динамического sitemap...')

    // Параллельно загружаем категории и витрины
    const categoriesPromise = loadCategories(baseUrl)
    const showcasesPromise = loadShowcases(baseUrl)

    // Последовательно загружаем магазины и промокоды (они могут быть большими)
    const storesPromise = loadAllStores(baseUrl)
    const promocodesPromise = loadAllPromocodes(baseUrl)

    // Ждем все результаты
    const [categoryPages, showcasePages, storePages, promocodePages] = await Promise.allSettled([
      categoriesPromise,
      showcasesPromise,
      storesPromise,
      promocodesPromise
    ])

    // Собираем результаты
    const allPages: MetadataRoute.Sitemap = [
      ...staticPages,
      ...(categoryPages.status === 'fulfilled' ? categoryPages.value : []),
      ...(showcasePages.status === 'fulfilled' ? showcasePages.value : []),
      ...(storePages.status === 'fulfilled' ? storePages.value : []),
      ...(promocodePages.status === 'fulfilled' ? promocodePages.value : [])
    ]

    console.log(`[SITEMAP] Сгенерировано ${allPages.length} URL:`)
    console.log(`- Статические: ${staticPages.length}`)
    console.log(`- Категории: ${categoryPages.status === 'fulfilled' ? categoryPages.value.length : 0}`)
    console.log(`- Витрины: ${showcasePages.status === 'fulfilled' ? showcasePages.value.length : 0}`)
    console.log(`- Магазины: ${storePages.status === 'fulfilled' ? storePages.value.length : 0}`)
    console.log(`- Промокоды: ${promocodePages.status === 'fulfilled' ? promocodePages.value.length : 0}`)

    return allPages

  } catch (error) {
    console.error('[SITEMAP] Критическая ошибка при генерации:', error)

    // В случае критической ошибки возвращаем только статические страницы
    return staticPages
  }
}

// Загрузка категорий
async function loadCategories(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    console.log('[SITEMAP] Загрузка категорий...')

    const categories = await getCategories()

    const categoryPages: MetadataRoute.Sitemap = categories
      .filter(category => category.is_active !== false) // Только активные
      .map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))

    console.log(`[SITEMAP] Загружено ${categoryPages.length} категорий`)
    return categoryPages

  } catch (error) {
    console.error('[SITEMAP] Ошибка загрузки категорий:', error)
    return []
  }
}

// Загрузка витрин
async function loadShowcases(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    console.log('[SITEMAP] Загрузка витрин...')

    const { results: showcases } = await getShowcases({ page_size: 100 })

    const showcasePages: MetadataRoute.Sitemap = showcases
      .filter(showcase => showcase.is_active !== false)
      .map((showcase) => ({
        url: `${baseUrl}/showcases/${showcase.slug}`,
        lastModified: showcase.updated_at ? new Date(showcase.updated_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))

    console.log(`[SITEMAP] Загружено ${showcasePages.length} витрин`)
    return showcasePages

  } catch (error) {
    console.error('[SITEMAP] Ошибка загрузки витрин:', error)
    return []
  }
}

// Загрузка всех магазинов с пагинацией
async function loadAllStores(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    console.log('[SITEMAP] Загрузка магазинов...')

    const allStores = []
    let currentPage = 1
    let hasMore = true

    while (hasMore && allStores.length < SITEMAP_CONFIG.MAX_STORES) {
      const response = await getStores({
        page: currentPage,
        page_size: SITEMAP_CONFIG.BATCH_SIZE,
        ordering: '-updated_at' // Сначала недавно обновленные
      })

      // Фильтруем только активные магазины
      const activeStores = response.results.filter(store => store.is_active !== false)
      allStores.push(...activeStores)

      // Проверяем, есть ли еще страницы
      hasMore = !!response.next && response.results.length === SITEMAP_CONFIG.BATCH_SIZE
      currentPage++

      console.log(`[SITEMAP] Загружена страница ${currentPage - 1}, магазинов: ${activeStores.length}`)
    }

    const storePages: MetadataRoute.Sitemap = allStores
      .slice(0, SITEMAP_CONFIG.MAX_STORES) // Лимитируем
      .map((store) => ({
        url: `${baseUrl}/stores/${store.slug}`,
        lastModified: store.updated_at ? new Date(store.updated_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }))

    console.log(`[SITEMAP] Загружено ${storePages.length} магазинов`)
    return storePages

  } catch (error) {
    console.error('[SITEMAP] Ошибка загрузки магазинов:', error)
    return []
  }
}

// Загрузка всех промокодов с пагинацией
async function loadAllPromocodes(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    console.log('[SITEMAP] Загрузка промокодов...')

    const allPromocodes = []
    let currentPage = 1
    let hasMore = true

    while (hasMore && allPromocodes.length < SITEMAP_CONFIG.MAX_PROMOCODES) {
      const response = await getPromocodes({
        page: currentPage,
        page_size: SITEMAP_CONFIG.BATCH_SIZE,
        ordering: '-updated_at' // Сначала недавно обновленные
      })

      // Добавляем все промокоды (фильтрация активных происходит на бэкенде)
      allPromocodes.push(...response.results)

      // Проверяем, есть ли еще страницы
      hasMore = !!response.next && response.results.length === SITEMAP_CONFIG.BATCH_SIZE
      currentPage++

      console.log(`[SITEMAP] Загружена страница ${currentPage - 1}, промокодов: ${response.results.length}`)
    }

    const promocodePages: MetadataRoute.Sitemap = allPromocodes
      .slice(0, SITEMAP_CONFIG.MAX_PROMOCODES) // Лимитируем
      .map((promocode) => ({
        url: `${baseUrl}/promo/${promocode.id}`,
        lastModified: promocode.updated_at ? new Date(promocode.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: promocode.is_hot ? 0.8 : 0.6, // Горячие промокоды важнее
      }))

    console.log(`[SITEMAP] Загружено ${promocodePages.length} промокодов`)
    return promocodePages

  } catch (error) {
    console.error('[SITEMAP] Ошибка загрузки промокодов:', error)
    return []
  }
}

// ✅ ИСПРАВЛЕНО: Убран revalidate для полностью динамического sitemap
// Sitemap будет генерироваться при каждом запросе