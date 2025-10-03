import { NextResponse } from 'next/server'
import { getSiteAssets } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

export async function GET() {
  let assets

  try {
    assets = await getSiteAssets()
  } catch (error) {
    console.error('[manifest] Failed to load site assets:', error)
    // Fallback to defaults
    assets = {
      theme_color: '#0b1020',
      background_color: '#0b1020'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  const {
    pwa_192,
    pwa_512,
    pwa_maskable,
    theme_color = '#0b1020',
    background_color = '#0b1020'
  } = assets

  const manifest = {
    name: 'BoltPromo - Промокоды и скидки',
    short_name: 'BoltPromo',
    description: 'Лучшие промокоды от 100+ магазинов России. 500+ актуальных предложений.',
    start_url: '/',
    display: 'standalone',
    background_color,
    theme_color,
    orientation: 'portrait-primary',
    icons: [
      ...(pwa_192 ? [{
        src: `${baseUrl}${pwa_192}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      }] : []),
      ...(pwa_512 ? [{
        src: `${baseUrl}${pwa_512}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }] : []),
      ...(pwa_maskable ? [{
        src: `${baseUrl}${pwa_maskable}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }] : [])
    ].filter(Boolean),
    categories: ['shopping', 'lifestyle'],
    lang: 'ru',
    dir: 'ltr',
    scope: '/',
    prefer_related_applications: false
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
