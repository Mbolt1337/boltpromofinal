import { Zap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container-main">
        <div className="text-center">
          {/* Анимированная иконка */}
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Zap className="w-10 h-10 text-white animate-bounce" />
          </div>
          
          {/* Заголовок */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Загружаем лучшие предложения
          </h2>
          
          {/* Описание */}
          <p className="text-gray-400 mb-8">
            Ищем самые выгодные промокоды и скидки для вас...
          </p>

          {/* Анимированная полоса загрузки */}
          <div className="w-64 h-2 bg-white/5 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>

          {/* Skeleton контент */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="glass-card p-6 animate-shimmer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-white/10 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-6 bg-white/10 rounded w-full mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}