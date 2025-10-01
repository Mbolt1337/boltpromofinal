// frontend/src/app/manifest.ts
import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BoltPromo - Промокоды и скидки',
    short_name: 'BoltPromo',
    description: 'Лучшие промокоды и скидки от популярных интернет-магазинов',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    orientation: 'portrait-primary',
    categories: ['shopping', 'business', 'finance'],
    lang: 'ru',
    dir: 'ltr',
    scope: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'BoltPromo на мобильном устройстве'
      },
      {
        src: '/screenshot-desktop.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'BoltPromo на десктопе'
      }
    ],
    shortcuts: [
      {
        name: 'Поиск промокодов',
        short_name: 'Поиск',
        description: 'Быстрый поиск промокодов и скидок',
        url: '/search',
        icons: [
          {
            src: '/icon-search-96.png',
            sizes: '96x96'
          }
        ]
      },
      {
        name: 'Горячие предложения',
        short_name: 'Горячие',
        description: 'Самые выгодные предложения',
        url: '/hot',
        icons: [
          {
            src: '/icon-hot-96.png',
            sizes: '96x96'
          }
        ]
      },
      {
        name: 'Категории',
        short_name: 'Категории',
        description: 'Все категории товаров',
        url: '/categories',
        icons: [
          {
            src: '/icon-categories-96.png',
            sizes: '96x96'
          }
        ]
      }
    ]
  }
}