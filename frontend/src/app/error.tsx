'use client'

import { useEffect } from 'react'
import { Flame, Home, Gift, Zap } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container-main">
        <div className="glass-card p-12 text-center max-w-2xl mx-auto shadow-glass">
          {/* Иконка */}
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-white" />
          </div>
          
          {/* Заголовок */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Небольшая техническая неполадка
          </h1>
          
          {/* Описание */}
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            Пока мы исправляем ошибку, посмотрите наши лучшие промокоды 
            и горячие предложения с огромными скидками!
          </p>
          
          {/* Детали ошибки (только в development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 glass-card border border-red-500/20 bg-red-500/5 text-left">
              <p className="text-red-400 text-sm font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-red-300 text-xs mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
          
          {/* Действия */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={reset}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              <span>Попробовать снова</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-8 py-4 glass-button-small rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              <span>На главную</span>
            </button>
          </div>

          {/* Призыв к действию */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-4">
              А тем временем можете посмотреть:
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/hot'}
                className="inline-flex items-center gap-2 px-4 py-2 glass-button-small rounded-xl text-orange-300 hover:text-orange-200 transition-all duration-300 hover:scale-105"
              >
                <Flame className="w-4 h-4" />
                <span>Горячие промокоды</span>
              </button>

              <button
                onClick={() => window.location.href = '/stores'}
                className="inline-flex items-center gap-2 px-4 py-2 glass-button-small rounded-xl text-blue-300 hover:text-blue-200 transition-all duration-300 hover:scale-105"
              >
                <Gift className="w-4 h-4" />
                <span>Топ магазины</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}