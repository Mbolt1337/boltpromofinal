import { Suspense } from 'react'
import { 
  Zap, 
  Shield, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Mail,
  MessageCircle,
  Phone,
  Target,
  Clock,
  Gift
} from 'lucide-react'
import Link from 'next/link'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

// Хлебные крошки
const breadcrumbItems = [
  { label: 'Главная', href: '/' },
  { label: 'О проекте', icon: <Zap className="w-4 h-4 text-white" /> }
]

// Преимущества платформы
const advantages = [
  {
    icon: <Shield className="w-8 h-8 text-blue-400" />,
    title: 'Проверенные магазины',
    description: 'Сотрудничаем только с надежными интернет-магазинами с проверенной репутацией'
  },
  {
    icon: <Sparkles className="w-8 h-8 text-purple-400" />,
    title: 'Актуальные промокоды',
    description: 'Регулярно обновляем базу промокодов и удаляем неработающие предложения'
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-green-400" />,
    title: 'Максимальная экономия',
    description: 'Собираем лучшие скидки и эксклюзивные предложения для наших пользователей'
  },
  {
    icon: <Users className="w-8 h-8 text-orange-400" />,
    title: 'Сообщество экономных',
    description: 'Тысячи пользователей ежедневно экономят с помощью нашей платформы'
  },
  {
    icon: <Clock className="w-8 h-8 text-indigo-400" />,
    title: 'Экономия времени',
    description: 'Не нужно искать промокоды — мы уже собрали их все в одном месте'
  },
  {
    icon: <Heart className="w-8 h-8 text-red-400" />,
    title: 'Бесплатно навсегда',
    description: 'Никаких скрытых платежей или подписок — все промокоды абсолютно бесплатно'
  }
]

// Статистика проекта
const stats = [
  { number: '1000+', label: 'Активных промокодов', icon: <Gift className="w-6 h-6 text-blue-400" /> },
  { number: '500+', label: 'Проверенных магазинов', icon: <Shield className="w-6 h-6 text-green-400" /> },
  { number: '50K+', label: 'Довольных пользователей', icon: <Users className="w-6 h-6 text-purple-400" /> },
  { number: '₽10M+', label: 'Сэкономлено рублей', icon: <TrendingUp className="w-6 h-6 text-orange-400" /> }
]

// Ключевые особенности
const features = [
  'Ежедневное обновление промокодов',
  'Проверка работоспособности скидок',
  'Удобная система поиска и фильтрации',
  'Уведомления о горячих предложениях',
  'Мобильная версия и Telegram-бот',
  'Партнерские эксклюзивные скидки'
]

// Основной компонент содержимого
function AboutContent() {
  // JSON-LD данные для Organization и WebPage
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BoltPromo",
    "url": "https://boltpromo.ru",
    "logo": "https://boltpromo.ru/logo.png",
    "description": "Ведущая платформа промокодов и скидок России. Более 1000 актуальных промокодов от 500+ проверенных магазинов.",
    "foundingDate": "2025",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@boltpromo.ru",
      "contactType": "customer service",
      "availableLanguage": "Russian"
    },
    "sameAs": [
      "https://t.me/BoltPromoBot",
      "https://t.me/boltpromomane"
    ]
  }

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "О проекте BoltPromo - лучшая платформа промокодов России",
    "description": "Узнайте больше о BoltPromo - ведущей платформе промокодов России. Более 1000 актуальных промокодов от 500+ проверенных магазинов.",
    "url": "https://boltpromo.ru/about",
    "inLanguage": "ru",
    "isPartOf": {
      "@type": "WebSite",
      "name": "BoltPromo",
      "url": "https://boltpromo.ru"
    }
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://boltpromo.ru"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "О проекте",
        "item": "https://boltpromo.ru/about"
      }
    ]
  }

  return (
    <div className="min-h-screen">
      {/* JSON-LD разметка */}
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Хлебные крошки */}
      <div className="container-main py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Hero секция */}
      <section className="py-16">
        <div className="container-main">
          <div className="text-center mb-16">
            {/* Логотип */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-8">
              <Zap className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              О проекте <span className="text-gradient">BoltPromo</span>
            </h1>
            
            <p className="text-gray-300 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
              Мы создали платформу, которая помогает миллионам россиян экономить на покупках. 
              BoltPromo — это ваш надежный помощник в мире скидок и промокодов.
            </p>

            {/* Статистика */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-center mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Миссия и ценности */}
      <section className="py-16">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Левая колонка - текст */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl lg:text-4xl font-bold text-white">
                  Наша миссия
                </h2>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Мы верим, что каждый покупатель заслуживает лучшую цену. Наша цель — сделать 
                экономию простой и доступной для всех пользователей интернет-магазинов.
              </p>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                BoltPromo объединяет лучшие предложения от сотен проверенных магазинов, 
                помогая вам находить актуальные промокоды за считанные секунды.
              </p>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Мы тщательно отбираем каждый промокод и магазин-партнер, отмечая особо выгодные предложения бейджем &ldquo;Мы рекомендуем&rdquo;.
                Наша монетизация основана на честных партнерских программах — мы получаем небольшую комиссию с покупок,
                что позволяет держать сервис бесплатным для пользователей.
              </p>

              {/* Ключевые особенности */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Правая колонка - карточка */}
            <div className="glass-card p-8 lg:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Почему выбирают нас?
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Star className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Высокое качество</h4>
                    <p className="text-gray-400 text-sm">Строгий отбор магазинов и постоянная проверка промокодов</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Быстрота</h4>
                    <p className="text-gray-400 text-sm">Мгновенный поиск и копирование промокодов одним кликом</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Безопасность</h4>
                    <p className="text-gray-400 text-sm">Все ссылки ведут на официальные сайты проверенных магазинов</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Преимущества BoltPromo
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Узнайте, что делает нашу платформу лучшим выбором для экономии на покупках
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <div 
                key={index} 
                className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  {advantage.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">
                  {advantage.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="py-16">
        <div className="container-main">
          <div className="glass-card p-8 lg:p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Готовы начать экономить?
            </h2>
            
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам пользователей, которые уже экономят с BoltPromo. 
              Найдите свой первый промокод прямо сейчас!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/hot" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                <span>Горячие промокоды</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <Link 
                href="/stores" 
                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
              >
                <Shield className="w-5 h-5 mr-2" />
                <span>Все магазины</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section className="py-16">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Связаться с нами
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Есть вопросы или предложения? Мы всегда готовы помочь!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Email */}
            <a 
              href="mailto:support@boltpromo.ru"
              className="glass-card p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Email поддержка</h3>
              <p className="text-gray-400 text-sm">support@boltpromo.ru</p>
            </a>

            {/* Telegram */}
            <a 
              href="https://t.me/BoltPromoBot"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Telegram-бот</h3>
              <p className="text-gray-400 text-sm">Быстрые ответы 24/7</p>
            </a>

            {/* Контакты */}
            <Link 
              href="/contacts"
              className="glass-card p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Все контакты</h3>
              <p className="text-gray-400 text-sm">Полная информация</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ✅ ИСПРАВЛЕНО: Обернуто в Suspense для решения ошибки useSearchParams
export default function AboutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>}>
      <AboutContent />
    </Suspense>
  )
}

// SEO метаданные
export async function generateMetadata() {
  return {
    title: 'О проекте BoltPromo - лучшая платформа промокодов и скидок России',
    description: 'Узнайте больше о BoltPromo - ведущей платформе промокодов России. Более 1000 актуальных промокодов от 500+ проверенных магазинов. Экономьте на покупках каждый день!',
    keywords: [
      'о проекте BoltPromo',
      'платформа промокодов',
      'экономия на покупках',
      'скидки интернет-магазинов',
      'промокоды России',
      'онлайн экономия'
    ].join(', '),
    openGraph: {
      title: 'О проекте BoltPromo - платформа промокодов №1 в России',
      description: 'Более 1000 промокодов, 500+ магазинов, 50K+ довольных пользователей. Присоединяйтесь к сообществу экономных покупателей!',
      type: 'website',
      url: 'https://boltpromo.ru/about',
      siteName: 'BoltPromo',
      images: ['/og-image.jpg']
    },
    twitter: {
      card: 'summary_large_image',
      title: 'О проекте BoltPromo - платформа промокодов',
      description: 'Лучшие промокоды и скидки от проверенных магазинов России',
      images: ['/og-image.jpg']
    },
    alternates: {
      canonical: 'https://boltpromo.ru/about'
    }
  }
}

// Viewport конфигурация
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}