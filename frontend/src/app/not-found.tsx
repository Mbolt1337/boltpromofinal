import { Suspense } from 'react'
import Link from 'next/link'
import { Home, Search, Flame, Store, Grid3X3, Gift } from 'lucide-react'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

// Основной компонент содержимого
function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container-main">
        <div className="glass-card p-12 text-center max-w-3xl mx-auto shadow-glass">
          {/* Большой номер 404 */}
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-transparent bg-gradient-to-r from-white/20 to-white/5 bg-clip-text">
              404
            </h1>
          </div>
          
          {/* Заголовок */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Страница не найдена
          </h2>
          
          {/* Описание */}
          <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            Упс! Эта страница переехала или не существует. 
            Но не расстраивайтесь — у нас есть тысячи актуальных промокодов и выгодных предложений!
          </p>
          
          {/* Действия */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              <span>На главную</span>
            </Link>
            
            <Link 
              href="/search" 
              className="inline-flex items-center px-8 py-4 glass-button-small rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              <Search className="w-5 h-5 mr-2" />
              <span>Поиск промокодов</span>
            </Link>
          </div>
          
          {/* Полезные ссылки */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Link 
              href="/hot"
              className="glass-card p-6 hover:scale-105 transition-all duration-300 group"
            >
              <Flame className="w-8 h-8 mx-auto mb-3 text-orange-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Горячие промокоды</h3>
              <p className="text-gray-400 text-sm">Ограниченные предложения</p>
            </Link>

            <Link 
              href="/stores"
              className="glass-card p-6 hover:scale-105 transition-all duration-300 group"
            >
              <Store className="w-8 h-8 mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Магазины</h3>
              <p className="text-gray-400 text-sm">Все партнеры</p>
            </Link>

            <Link 
              href="/categories"
              className="glass-card p-6 hover:scale-105 transition-all duration-300 group"
            >
              <Grid3X3 className="w-8 h-8 mx-auto mb-3 text-purple-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">Категории</h3>
              <p className="text-gray-400 text-sm">По интересам</p>
            </Link>
          </div>

          {/* Статистика */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-400" />
                <span>1000+ промокодов</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-400" />
                <span>100+ магазинов</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Ежедневные обновления</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ ИСПРАВЛЕНО: Обернуто в Suspense для решения ошибки useSearchParams
export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>}>
      <NotFoundContent />
    </Suspense>
  )
}

// SEO метаданные
export async function generateMetadata() {
  return {
    title: '404 - Страница не найдена | BoltPromo',
    description: 'Страница не найдена. Вернитесь на главную, чтобы найти лучшие промокоды и скидки.',
    robots: {
      index: false,
      follow: false
    }
  }
}