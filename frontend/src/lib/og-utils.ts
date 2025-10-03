import { getSiteAssets } from './api'

let cachedOgImage: string | null = null
let cacheTime: number = 0
const CACHE_DURATION = 3600000 // 1 hour in ms

/**
 * Получить default OG image из SiteAssets
 * Кэшируется на 1 час для производительности
 */
export async function getDefaultOgImage(): Promise<string | null> {
  const now = Date.now()

  // Проверяем кэш
  if (cachedOgImage && (now - cacheTime) < CACHE_DURATION) {
    return cachedOgImage
  }

  try {
    const assets = await getSiteAssets()
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

    if (assets.og_default) {
      cachedOgImage = `${baseUrl}${assets.og_default}`
      cacheTime = now
      return cachedOgImage
    }
  } catch (error) {
    console.error('[getDefaultOgImage] Failed to load:', error)
  }

  return null
}

/**
 * Хелпер для generateMetadata с fallback на default OG image
 */
export async function createOgImageObject(customImage?: string): Promise<any> {
  const imageUrl = customImage || await getDefaultOgImage()

  if (!imageUrl) {
    return undefined
  }

  return {
    url: imageUrl,
    width: 1200,
    height: 630,
    alt: 'BoltPromo - Промокоды и скидки',
    type: 'image/jpeg'
  }
}
