// frontend/src/components/search/SearchResults.tsx
'use client'

import Link from 'next/link'
import { Tag, Store, Grid3X3, Flame, ExternalLink, AlertCircle, ArrowRight, TrendingUp, Search } from 'lucide-react'
import type { SearchResult } from '@/lib/search'

interface SearchResultsProps {
  query: string
  results: SearchResult
  type: string
  sort: string
}

export default function SearchResults({ query, results, type, sort }: SearchResultsProps) {
  const { promocodes, stores, categories, total } = results

  // Если нет результатов - улучшенный empty state
  if (total === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 transition-all duration-300 ease-out">
          <Search className="w-10 h-10 text-gray-400" />
        </div>
        
        <h3 className="text-2xl font-semibold text-white mb-4">
          По запросу "{query}" ничего не найдено
        </h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Попробуйте изменить поисковый запрос, проверить правописание или воспользоваться популярными категориями
        </p>
        
        {/* Советы по поиску */}
        <div className="glass-card p-6 mb-8 bg-white/3 border border-white/8">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2 justify-center">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Советы для лучшего поиска
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Используйте более общие термины</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Проверьте правописание</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Ищите по названию магазина</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>Попробуйте синонимы</span>
            </div>
          </div>
        </div>
        
        {/* Популярные поисковые запросы */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm mb-4">Популярные запросы:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['техника', 'одежда', 'красота', 'еда', 'путешествия', 'спорт'].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                // unified hover/focus
                className="glass-button-small px-4 py-2 rounded-xl text-gray-300 hover:text-white transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>

        {/* Ссылки на разделы */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
          <Link
            href="/categories"
            // unified hover/focus - исправил hover scale
            className="glass-card p-4 hover:scale-[1.02] transition-all duration-300 ease-out group text-center focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
          >
            <Grid3X3 className="w-6 h-6 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform duration-300 ease-out" />
            <span className="text-sm font-medium text-white">Категории</span>
          </Link>
          <Link
            href="/stores"
            // unified hover/focus
            className="glass-card p-4 hover:scale-[1.02] transition-all duration-300 ease-out group text-center focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
          >
            <Store className="w-6 h-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform duration-300 ease-out" />
            <span className="text-sm font-medium text-white">Магазины</span>
          </Link>
          <Link
            href="/hot"
            // unified hover/focus
            className="glass-card p-4 hover:scale-[1.02] transition-all duration-300 ease-out group text-center focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
          >
            <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400 group-hover:scale-110 transition-transform duration-300 ease-out" />
            <span className="text-sm font-medium text-white">Горячие</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      
      {/* Промокоды */}
      {(type === 'all' || type === 'promocodes') && promocodes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <Tag className="w-6 h-6 text-green-400" />
                Промокоды
              </h2>
              <p className="text-gray-400 text-sm">
                Найдено {promocodes.length} {promocodes.length === 1 ? 'промокод' : promocodes.length < 5 ? 'промокода' : 'промокодов'}
              </p>
            </div>
            
            {type === 'all' && promocodes.length >= 3 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&type=promocodes`}
                // unified hover/focus - исправил hover scale
                className="glass-button-small px-4 py-2 rounded-xl text-green-400 hover:text-green-300 transition-all duration-300 ease-out hover:scale-105 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              >
                <span className="text-sm">Все промокоды</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promocodes.map((promo) => (
              <Link
                key={promo.id}
                href={promo.href}
                // unified hover/focus - исправил hover scale + добавил focus
                className="glass-card p-6 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-400 transition-all duration-300 ease-out group-hover:scale-110" />
                    {promo.isHot && <Flame className="w-4 h-4 text-orange-400 transition-all duration-300 ease-out group-hover:scale-110" />}
                  </div>
                  <div className="text-gray-500 text-xs bg-white/5 px-2 py-1 rounded">промокод</div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-green-400 transition-colors duration-300 ease-out">
                  {promo.title}
                </h3>
                
                {promo.subtitle && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4 group-hover:text-gray-300 transition-colors duration-300 ease-out">
                    {promo.subtitle}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-green-400 text-sm font-medium transition-colors duration-300 ease-out">Получить промокод</span>
                  <ExternalLink className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 to-emerald-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none"></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Магазины */}
      {(type === 'all' || type === 'stores') && stores.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <Store className="w-6 h-6 text-blue-400" />
                Магазины
              </h2>
              <p className="text-gray-400 text-sm">
                Найдено {stores.length} {stores.length === 1 ? 'магазин' : stores.length < 5 ? 'магазина' : 'магазинов'}
              </p>
            </div>
            
            {type === 'all' && stores.length >= 3 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&type=stores`}
                // unified hover/focus
                className="glass-button-small px-4 py-2 rounded-xl text-blue-400 hover:text-blue-300 transition-all duration-300 ease-out hover:scale-105 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              >
                <span className="text-sm">Все магазины</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={store.href}
                // unified hover/focus
                className="glass-card p-6 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-400 transition-all duration-300 ease-out group-hover:scale-110" />
                  </div>
                  <div className="text-gray-500 text-xs bg-white/5 px-2 py-1 rounded">магазин</div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors duration-300 ease-out">
                  {store.title}
                </h3>
                
                {store.subtitle && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4 group-hover:text-gray-300 transition-colors duration-300 ease-out">
                    {store.subtitle}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-blue-400 text-sm font-medium transition-colors duration-300 ease-out">Перейти в магазин</span>
                  <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none"></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Категории */}
      {(type === 'all' || type === 'categories') && categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <Grid3X3 className="w-6 h-6 text-purple-400" />
                Категории
              </h2>
              <p className="text-gray-400 text-sm">
                Найдено {categories.length} {categories.length === 1 ? 'категория' : categories.length < 5 ? 'категории' : 'категорий'}
              </p>
            </div>
            
            {type === 'all' && categories.length >= 3 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&type=categories`}
                // unified hover/focus
                className="glass-button-small px-4 py-2 rounded-xl text-purple-400 hover:text-purple-300 transition-all duration-300 ease-out hover:scale-105 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              >
                <span className="text-sm">Все категории</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                // unified hover/focus
                className="glass-card p-6 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out group text-center relative overflow-hidden focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110">
                  <Grid3X3 className="w-7 h-7 text-purple-400 group-hover:scale-110 transition-transform duration-300 ease-out" />
                </div>
                
                <h3 className="text-base font-semibold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors duration-300 ease-out">
                  {category.title}
                </h3>
                
                {category.subtitle && (
                  <p className="text-gray-400 text-xs line-clamp-2 group-hover:text-gray-300 transition-colors duration-300 ease-out">
                    {category.subtitle}
                  </p>
                )}

                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-pink-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none"></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Подсказка для улучшения поиска */}
      {total > 0 && total < 5 && (
        <div className="glass-card p-6 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-yellow-300 font-semibold mb-2">Мало результатов?</h3>
              <div className="text-yellow-200 text-sm space-y-2">
                <p>Советы для улучшения поиска:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Используйте более общие термины</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Проверьте правописание</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Ищите по категории</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Попробуйте синонимы</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Статистика поиска */}
      {total > 0 && (
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm">
            Показано <span className="text-white font-semibold">{total}</span> {total === 1 ? 'результат' : total < 5 ? 'результата' : 'результатов'} 
            {' '}по запросу <span className="text-white font-semibold">"{query}"</span>
          </p>
        </div>
      )}
    </div>
  )
}