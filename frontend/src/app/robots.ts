import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/', 
          '/_next/',
          '/private/',
          '/*?*', // Блокируем URL с параметрами
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      }
    ],
    sitemap: 'https://boltpromo.ru/sitemap.xml',
    host: 'https://boltpromo.ru'
  }
}