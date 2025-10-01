import Link from 'next/link'
import { ArrowLeft, Tag, Search, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <section className="py-8 lg:py-16">
        <div className="container-main">
          <div className="max-w-lg lg:max-w-2xl mx-auto text-center px-4">
            
            {/* Главная карточка */}
            <div className="glass-card p-6 sm:p-8 lg:p-12 hover:scale-[1.01] transition-all duration-300 ease-out group">
              
              {/* Фоновый эффект */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out pointer-events-none bg-gradient-to-br from-red-500/3 to-orange-500/3 group-hover:opacity-100 rounded-2xl"></div>
              
              <div className="relative z-10">
                {/* Иконка */}
                <div className="w-20 h-20 lg:w-28 lg:h-28 mx-auto mb-6 lg:mb-8 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-white/8">
                  <Tag className="w-10 h-10 lg:w-14 lg:h-14 text-gray-400 group-hover:text-gray-300 transition-colors duration-300 ease-out" />
                </div>
                
                {/* Заголовок */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4 leading-tight group-hover:text-blue-300 transition-colors duration-300 ease-out">
                  Промокод не найден
                </h1>
                
                {/* Код ошибки */}
                <div className="inline-flex items-center px-4 py-2 bg-red-500/15 border border-red-500/25 rounded-full text-red-300 text-sm font-medium mb-4 lg:mb-6 transition-all duration-300 ease-out hover:scale-105">
                  <span>Ошибка 404</span>
                </div>
                
                {/* Описание */}
                <p className="text-base lg:text-xl text-gray-400 mb-8 lg:mb-10 leading-relaxed max-w-md lg:max-w-none mx-auto group-hover:text-gray-300 transition-colors duration-300 ease-out">
                  К сожалению, промокод который вы ищете не существует или был удален. Возможно, срок его действия истек.
                </p>
                
                {/* Действия */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center">
                  
                  {/* Главная кнопка - Вернуться на главную */}
                  <Link 
                    href="/"
                    className="group inline-flex items-center px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-300 hover:text-blue-200 rounded-xl font-semibold transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none touch-target"
                  >
                    <Home className="w-5 h-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300 ease-out" />
                    <span>Главная страница</span>
                  </Link>
                  
                  {/* Вторичная кнопка - Поиск */}
                  <Link 
                    href="/search"
                    className="group inline-flex items-center px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none touch-target"
                  >
                    <Search className="w-5 h-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-300 ease-out" />
                    <span>Найти промокоды</span>
                  </Link>
                </div>
                
                {/* Дополнительная информация */}
                <div className="mt-8 lg:mt-10 p-4 lg:p-6 bg-white/3 border border-white/10 rounded-xl transition-all duration-300 ease-out hover:bg-white/5">
                  <h3 className="text-lg font-semibold text-white mb-2">Что можно сделать:</h3>
                  <ul className="text-gray-400 text-sm lg:text-base space-y-1 leading-relaxed">
                    <li>• Проверьте правильность ссылки</li>
                    <li>• Воспользуйтесь поиском промокодов</li>
                    <li>• Просмотрите актуальные предложения на главной</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}