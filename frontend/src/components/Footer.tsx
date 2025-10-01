import { Zap, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { name: 'О проекте', href: '/about' },
    { name: 'Контакты', href: '/contacts' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Политика конфиденциальности', href: '/privacy' },
    { name: 'Пользовательское соглашение', href: '/terms' },
  ]

  return (
    <footer className="relative mt-auto">
      <div className="container-main pb-6">
        <div className="glass-header-rounded">
          <div className="px-8 py-8">
            
            {/* Верхняя часть футера */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
              
              {/* Логотип и слоган */}
              <div className="flex flex-col items-center lg:items-start">
                <Link href="/" className="flex items-center space-x-3 group mb-2">
                  <Zap className="w-7 h-7 text-white transition-all duration-300 group-hover:scale-110" />
                  <span className="text-xl font-bold text-white transition-all duration-300 group-hover:text-gray-200">
                    BoltPromo
                  </span>
                </Link>
                <p className="text-gray-400 text-sm text-center lg:text-left">
                  Платформа промокодов и скидок
                </p>
              </div>

              {/* Ссылки */}
              <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:scale-105"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Telegram бот */}
              <div className="flex items-center">
                <a
                  href="#"
                  className="btn-outline flex items-center space-x-2 text-sm px-6 py-3"
                >
                  <span>Telegram бот</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Разделитель */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Копирайт */}
                <p className="text-gray-500 text-sm text-center sm:text-left">
                  © {currentYear} BoltPromo. Все права защищены.
                </p>

                {/* Дополнительная информация */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Версия 1.0</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Сделано с ❤️</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}