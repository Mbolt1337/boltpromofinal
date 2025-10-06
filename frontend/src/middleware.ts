import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware для проверки maintenance mode
 * Редиректит на страницу техработ, если API возвращает 503
 */
export async function middleware(request: NextRequest) {
  // Пропускаем проверку для самой страницы maintenance и статики
  if (
    request.nextUrl.pathname.startsWith('/maintenance') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

    // Проверяем статус API (используем health endpoint)
    const response = await fetch(`${API_BASE_URL}/api/v1/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      // Короткий timeout чтобы не замедлять все запросы
      signal: AbortSignal.timeout(3000)
    })

    // Если 503 - редиректим на maintenance
    if (response.status === 503) {
      const maintenanceUrl = new URL('/maintenance', request.url)
      return NextResponse.redirect(maintenanceUrl)
    }
  } catch (error) {
    // При ошибке проверки (timeout, сеть) пропускаем запрос
    // Лучше показать сайт с ошибками, чем редиректить на maintenance
    console.warn('[Middleware] Health check failed:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
