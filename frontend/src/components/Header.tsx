'use client'

import { useState, Suspense } from 'react'
import { Zap, Search, Menu, X } from 'lucide-react'
import Link from 'next/link'
import SearchBar from '@/components/search/SearchBar'

// Fallback для SearchBar при загрузке
function SearchBarSkeleton() {
  return (
    <div className="w-64 h-12 bg-white/10 rounded-xl animate-pulse border border-white/20"></div>
  )
}

// Fallback для мобильного SearchBar
function MobileSearchBarSkeleton() {
  return (
    <div className="w-full h-12 bg-white/10 rounded-xl animate-pulse border border-white/20"></div>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Категории', href: '/categories' },
    { name: 'Магазины', href: '/stores' },
    { name: 'Горячие', href: '/hot' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Контакты', href: '/contacts' },
  ]

  const handleMenuClose = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full pt-4">
      {/* Основной хедер с отступами */}
      <div className="container-main">
        <div className="glass-header-rounded">
          <div className="flex items-center justify-between h-18 px-8">
            {/* Логотип */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Zap className="w-8 h-8 text-white transition-all duration-300 group-hover:scale-110 group-hover:text-gray-200" />
              </div>
              <span className="text-2xl font-bold text-white transition-all duration-300 group-hover:text-gray-200">
                BoltPromo
              </span>
            </Link>

            {/* Навигация - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Поиск и меню */}
            <div className="flex items-center space-x-4">
              {/* Поиск - Desktop */}
              <div className="hidden md:flex items-center relative">
                <Suspense fallback={<SearchBarSkeleton />}>
                  <SearchBar />
                </Suspense>
              </div>

              {/* Кнопка поиска - Mobile */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden glass-button-small p-3"
              >
                <Search className="w-5 h-5 text-white" />
              </button>

              {/* Мобильное меню */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden glass-button-small p-3"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="lg:hidden glass-header-rounded mt-2 border-t-0">
            <div className="px-8 py-6 space-y-1">
              {/* Поиск в мобильном меню */}
              <div className="mb-4">
                <Suspense fallback={<MobileSearchBarSkeleton />}>
                  <SearchBar 
                    isMobile={true}
                    onClose={handleMenuClose}
                    className="w-full"
                  />
                </Suspense>
              </div>

              {/* Навигация в мобильном меню */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block nav-link py-3"
                  onClick={handleMenuClose}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}