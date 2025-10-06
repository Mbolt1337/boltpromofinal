'use client'

import { Clock, Wrench, RefreshCw } from 'lucide-react'

export default function MaintenanceContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
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
                  В данный момент проводятся плановые технические работы. Сервис будет восстановлен в ближайшее время.
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

        {/* Кнопка обновления */}
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            Обновить страницу
          </button>
        </div>

        {/* Контакты */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">
            Если у вас есть срочный вопрос, свяжитесь с нами через{' '}
            <a href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">
              форму обратной связи
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
