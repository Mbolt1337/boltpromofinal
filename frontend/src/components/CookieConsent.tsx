'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

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
    localStorage.setItem('cookieConsent', 'accepted')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setIsVisible(false)
    setTimeout(() => setShowBanner(false), 300)
  }

  const declineAnalytics = () => {
    localStorage.setItem('cookieConsent', 'essential-only')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setIsVisible(false)
    setTimeout(() => setShowBanner(false), 300)
  }

  if (!showBanner) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      {/* Фон с размытием */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 to-transparent backdrop-blur-md" />

      <div className="relative container-main py-6">
        <div className="glass-card p-6 max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">

            {/* Иконка и текст */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-amber-400" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Мы используем cookies
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Мы используем необходимые cookies для работы сайта и аналитические cookies для улучшения вашего опыта.
                  Подробнее о том, как мы обрабатываем ваши данные, читайте в{' '}
                  <Link
                    href="/privacy"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                  >
                    Политике конфиденциальности
                  </Link>.
                </p>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <button
                onClick={declineAnalytics}
                className="px-6 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all duration-300 hover:border-white/30 whitespace-nowrap"
              >
                Только необходимые
              </button>

              <button
                onClick={acceptCookies}
                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/20 whitespace-nowrap"
              >
                Принять все
              </button>
            </div>
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={declineAnalytics}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
