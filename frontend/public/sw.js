// public/sw.js - Service Worker для PWA
// B3: КРИТИЧНО - API запросы ИСКЛЮЧЕНЫ из кеширования

const CACHE_NAME = 'boltpromo-v1'
const STATIC_CACHE_NAME = 'boltpromo-static-v1'

// B3: Ресурсы для кеширования (БЕЗ API)
const STATIC_ASSETS = [
  '/',
  '/categories',
  '/stores',
  '/hot',
  '/about',
  '/faq',
  '/contacts',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// B3: КРИТИЧНО - Паттерны для ИСКЛЮЧЕНИЯ из кеша
const NO_CACHE_PATTERNS = [
  /\/api\//, // Все API запросы
  /\/_next\/static\/chunks\/pages\/api\//, // Next.js API роуты
  /\/search\?/, // Поисковые запросы
  /page=/, // Пагинация
  /\?.*search=/, // Любые поисковые параметры
]

// B3: Проверка - нужно ли исключить из кеша
function shouldExcludeFromCache(url) {
  return NO_CACHE_PATTERNS.some(pattern => pattern.test(url))
}

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
  )
})

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Activated')
        return self.clients.claim()
      })
  )
})

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // B3: КРИТИЧНО - НЕ кешируем API запросы и поиск
  if (shouldExcludeFromCache(request.url)) {
    console.log('[SW] Skipping cache for:', request.url)
    event.respondWith(fetch(request))
    return
  }
  
  // B3: Кешируем только статические ресурсы и страницы
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url)
            return cachedResponse
          }
          
          // Если в кеше нет, запрашиваем и кешируем
          return fetch(request)
            .then((response) => {
              // Кешируем только успешные ответы
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
              }
              return response
            })
            .catch((error) => {
              console.error('[SW] Fetch failed:', error)
              
              // Для навигационных запросов возвращаем fallback
              if (request.mode === 'navigate') {
                return caches.match('/')
              }
              
              throw error
            })
        })
    )
  }
})

// Обработка сообщений (для обновления кеша)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested')
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    console.log('[SW] Cache update requested')
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(STATIC_ASSETS))
    )
  }
})