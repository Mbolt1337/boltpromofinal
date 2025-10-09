'use client'

import { Clock, Wrench, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MaintenanceData {
  maintenance: boolean
  message: string
  retry_after?: string
}

export default function MaintenanceContent() {
  const [data, setData] = useState<MaintenanceData | null>(null)
  const [expectedEnd, setExpectedEnd] = useState<string | null>(null)
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null)

  useEffect(() => {
    // Получаем данные о тех. работах из API
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/health/`)
      .then(res => res.json())
      .then((data: MaintenanceData) => {
        setData(data)
        if (data.retry_after) {
          const date = new Date(data.retry_after)
          setExpectedEnd(date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }))
        }
      })
      .catch(() => {
        // Если API недоступен, используем дефолтное сообщение
        setData({
          maintenance: true,
          message: 'В данный момент проводятся плановые технические работы. Сервис будет восстановлен в ближайшее время.'
        })
      })

    // Пытаемся получить telegram URL из настроек
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/`)
      .then(res => res.json())
      .then((settings) => {
        if (settings.maintenance_telegram_url) {
          setTelegramUrl(settings.maintenance_telegram_url)
        }
      })
      .catch(() => {
        // Игнорируем ошибку
      })
  }, [])

  const message = data?.message || 'В данный момент проводятся плановые технические работы. Сервис будет восстановлен в ближайшее время.'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Анимированная иконка */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <Wrench className="w-16 h-16 text-blue-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-4">
            BoltPromo
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Технические работы
          </h1>
          <p className="text-xl text-white/70">
            Мы обновляем наш сервис для вас
          </p>
        </div>

        {/* Информационная карточка */}
        <div className="glass-card p-8 mb-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Временная недоступность</h3>
                <p className="text-white/70 text-sm">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Скоро вернемся</h3>
                <p className="text-white/70 text-sm">
                  Пожалуйста, попробуйте обновить страницу через несколько минут.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ожидаемое время завершения */}
        {expectedEnd && (
          <div className="glass-card p-6 mb-8 text-center border-emerald-500/30">
            <div className="text-sm text-white/60 uppercase tracking-wider mb-2">
              Ожидаемое завершение работ
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {expectedEnd}
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none"
          >
            <RefreshCw className="w-5 h-5" />
            Обновить страницу
          </button>

          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/12 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 border border-white/15 hover:border-white/25 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none"
            >
              <span>📱</span>
              Telegram-канал
            </a>
          )}
        </div>

        {/* Контакты */}
        <div className="text-center">
          <p className="text-white/50 text-sm">
            {telegramUrl ? (
              <>
                Следите за новостями в нашем{' '}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Telegram-канале
                </a>
              </>
            ) : (
              'Приносим извинения за временные неудобства'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
