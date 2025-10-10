'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, Check, X } from 'lucide-react'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем, дал ли пользователь согласие
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      // Показываем баннер с небольшой задержкой для лучшего UX
      setTimeout(() => {
        setShowBanner(true)
        setTimeout(() => setIsVisible(true), 100)
      }, 1000)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookieConsent', 'accepted')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())

    // Отправляем событие для Analytics компонента
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: 'accepted' }))

    setIsVisible(false)
    setTimeout(() => setShowBanner(false), 300)
  }

  const declineAnalytics = () => {
    localStorage.setItem('cookie-consent', 'essential-only')
    localStorage.setItem('cookieConsent', 'essential-only')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())

    // Отправляем событие для Analytics компонента
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: 'essential-only' }))

    setIsVisible(false)
    setTimeout(() => setShowBanner(false), 300)
  }

  if (!showBanner) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      {/* Градиентный фон с размытием */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/98 via-gray-900/95 to-transparent backdrop-blur-2xl" />

      <div className="relative container-main py-4 sm:py-5">
        <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 shadow-2xl shadow-black/40 transition-all duration-300 hover:bg-white/[0.07] group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

            {/* Иконка и текст */}
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Cookie className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  Использование cookies
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Мы используем необходимые cookies для работы сайта и аналитические для улучшения сервиса.{' '}
                  <Link
                    href="/privacy"
                    className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                  >
                    Подробнее
                  </Link>
                </p>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={declineAnalytics}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs sm:text-sm transition-all duration-300 hover:border-white/25 hover:scale-105 whitespace-nowrap"
              >
                Отклонить
              </button>

              <button
                onClick={acceptCookies}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm hover:bg-emerald-500/20 text-emerald-200 hover:text-emerald-100 font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:outline-none whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                Принять все
              </button>

              {/* Кнопка закрытия */}
              <button
                onClick={declineAnalytics}
                className="hidden sm:flex p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90 flex-shrink-0"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
