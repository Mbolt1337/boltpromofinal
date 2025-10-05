import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'
import DynamicMetaTags from '@/components/DynamicMetaTags'
import CookieConsent from '@/components/CookieConsent'
import { SITE_CONFIG } from '@/lib/seo'
import { Toaster } from 'sonner'

// B2: Оптимизированные шрифты для лучшей производительности
const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap', // Предотвращает FOIT (Flash of Invisible Text)
  variable: '--font-inter',
  preload: true, // Только критически важный шрифт
  fallback: ['system-ui', 'arial'],
  // B2: Оптимизация диапазона символов
  adjustFontFallback: false // Используем стандартные fallback
})

const manrope = Manrope({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-manrope',
  preload: false, // Не критично для initial render
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false
})

// B2: Оптимизированные метаданные для производительности
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    template: '%s | BoltPromo',
    default: 'BoltPromo - Лучшие промокоды и скидки от популярных интернет-магазинов России'
  },
  description: 'Лучшие промокоды от 100+ магазинов России. 500+ актуальных предложений. Экономьте на покупках техники, одежды, красоты.',
  applicationName: SITE_CONFIG.name,
  authors: [{ name: 'BoltPromo Team', url: SITE_CONFIG.url }],
  generator: 'Next.js',
  keywords: [
    'промокоды',
    'скидки', 
    'купоны',
    'кэшбэк',
    'интернет магазины',
    'онлайн покупки',
    'акции',
    'распродажа',
    'экономия',
    'выгодные покупки',
    'BoltPromo'
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'BoltPromo',
  publisher: 'BoltPromo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ],
    shortcut: '/favicon.ico'
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: 'Лучшие промокоды от 100+ популярных интернет-магазинов России. 500+ актуальных предложений.',
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
        type: 'image/jpeg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: 'Лучшие промокоды от 100+ популярных интернет-магазинов России.',
    images: [SITE_CONFIG.ogImage],
    creator: '@boltpromo',
    site: '@boltpromo'
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  category: 'shopping',
  classification: 'Промокоды и скидки',
  other: {
    'msapplication-TileColor': '#0a0a0a',
    'msapplication-config': '/browserconfig.xml'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  colorScheme: 'dark light'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        {/* B2: Критически важный meta description */}
        <meta name="description" content="Лучшие промокоды от 100+ магазинов России. 500+ актуальных предложений. Экономьте на покупках техники, одежды, красоты." />

        {/* Dynamic meta tags from SiteAssets API */}
        <DynamicMetaTags />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BoltPromo" />

        <link rel="alternate" hrefLang="ru" href={SITE_CONFIG.url} />
        <link rel="alternate" hrefLang="x-default" href={SITE_CONFIG.url} />

        {/* B2: Условная DNS prefetch только для production */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL && (
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
        )}

        {/* B2: Security headers для улучшения Lighthouse */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />

        {/* B2: Resource hints для производительности */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {/* B2: Оптимизированный JSON-LD для Organization */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: SITE_CONFIG.name,
                url: SITE_CONFIG.url,
                description: 'Лучшие промокоды и скидки от популярных интернет-магазинов России',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`
                  },
                  'query-input': 'required name=search_term_string'
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'BoltPromo',
                  url: SITE_CONFIG.url,
                  logo: `${SITE_CONFIG.url}/logo.png`
                }
              })
            }}
          />
          
          <Header />
          <main id="main-content" role="main">
            {children}
          </main>
          <Footer />
          <CookieConsent />
          <Toaster
            position="bottom-center"
            richColors
            closeButton
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                marginBottom: 'env(safe-area-inset-bottom, 0px)',
              },
            }}
          />
        </ErrorBoundary>

        {/* B3: Регистрация Service Worker для PWA (только в production) */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('[SW] Registration successful:', registration.scope);
                        
                        // Проверяем обновления SW
                        registration.addEventListener('updatefound', function() {
                          console.log('[SW] Update found');
                        });
                      })
                      .catch(function(error) {
                        console.log('[SW] Registration failed:', error);
                      });
                  });
                }
              `
            }}
          />
        )}
      </body>
    </html>
  )
}