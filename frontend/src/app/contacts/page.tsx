import { Phone, Mail, MessageCircle, Send, MapPin, Clock, Users, CreditCard, ExternalLink } from 'lucide-react'
import { Suspense } from 'react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import ContactForm from '@/components/ContactForm'
import JsonLd from '@/components/seo/JsonLd'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

// Контактная информация (ОБНОВЛЕНО)
const contactInfo = [
  {
    icon: Mail,
    title: 'Email поддержки',
    value: 'support@boltpromo.ru',
    description: 'Ответим в течение 24 часов',
    link: 'mailto:support@boltpromo.ru',
    color: 'text-green-400'
  },
  {
    icon: MessageCircle,
    title: 'Telegram-бот',
    value: '@BoltPromoBot',
    description: 'Быстрые ответы и поддержка',
    link: 'https://t.me/BoltPromoBot',
    color: 'text-blue-400'
  },
  {
    icon: Users,
    title: 'Telegram-канал',
    value: '@boltpromomane',
    description: 'Эксклюзивные финансовые предложения',
    link: 'https://t.me/boltpromomane',
    color: 'text-purple-400'
  }
]

// Рабочее время
const workingHours = [
  { day: 'Понедельник - Пятница', time: '09:00 - 18:00' },
  { day: 'Суббота', time: '10:00 - 16:00' },
  { day: 'Воскресенье', time: 'Выходной' }
]

// Skeleton для загрузки
function ContactsPageSkeleton() {
  return (
    <>
      {/* Контактные карточки skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="glass-card p-6 animate-shimmer">
            <div className="w-12 h-12 bg-white/10 rounded-xl mb-4"></div>
            <div className="h-6 bg-white/10 rounded w-32 mb-2"></div>
            <div className="h-5 bg-white/10 rounded w-24 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-40"></div>
          </div>
        ))}
      </div>

      {/* Форма skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 animate-shimmer">
          <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-white/10 rounded"></div>
            <div className="h-12 bg-white/10 rounded"></div>
            <div className="h-32 bg-white/10 rounded"></div>
            <div className="h-12 bg-white/10 rounded"></div>
          </div>
        </div>
        <div className="glass-card p-8 animate-shimmer">
          <div className="h-8 bg-white/10 rounded w-40 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// Основной компонент с данными
function ContactsContent() {
  return (
    <>
      {/* Контактные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {contactInfo.map((contact, index) => (
          <div
            key={index}
            className="glass-card p-6 hover:scale-105 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <contact.icon className={`w-6 h-6 ${contact.color}`} />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {contact.title}
            </h3>
            
            <div className={`text-lg font-medium mb-2 ${contact.color}`}>
              {contact.value}
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              {contact.description}
            </p>

            {/* Кнопка действия */}
            <a
              href={contact.link}
              target={contact.link.startsWith('http') ? '_blank' : undefined}
              rel={contact.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              <span>Связаться</span>
              {contact.link.startsWith('http') ? (
                <ExternalLink className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </a>

            {/* Специальное описание для канала */}
            {contact.title === 'Telegram-канал' && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-purple-400 text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>Реферальные ссылки и финансовые предложения</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Форма обратной связи */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Форма обратной связи
          </h2>
          
          <ContactForm />
        </div>

        {/* Дополнительная информация */}
        <div className="space-y-6">
          
          {/* Время работы поддержки */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">
                Время работы поддержки
              </h3>
            </div>
            
            <div className="space-y-3">
              {workingHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                  <span className="text-gray-300">{schedule.day}</span>
                  <span className="text-white font-medium">{schedule.time}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Важно:</strong> В нерабочее время ответы могут задерживаться. 
                Для срочных вопросов используйте Telegram-бот.
              </p>
            </div>
          </div>

          {/* Часто задаваемые вопросы */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">
                Быстрые ответы
              </h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              Возможно, ответ на ваш вопрос уже есть в нашем FAQ
            </p>

            <a
              href="/faq"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
            >
              <span>Посмотреть FAQ</span>
              <Send className="w-4 h-4" />
            </a>
          </div>

          {/* Партнерам */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                Для партнеров
              </h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              Хотите разместить свои промокоды на нашей платформе?
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>•</span>
                <span>Бесплатное размещение</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>•</span>
                <span>Статистика использования</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>•</span>
                <span>Техническая поддержка</span>
              </div>
            </div>

            <div className="mt-4">
              <a
                href="mailto:support@boltpromo.ru?subject=Партнерство"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-purple-300 hover:text-purple-200 font-medium transition-all duration-300 hover:scale-105"
              >
                <span>Написать о партнерстве</span>
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Социальные сети и дополнительная информация */}
      <div className="mt-12 glass-card p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Следите за обновлениями
        </h3>
        
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Подписывайтесь на наши каналы, чтобы первыми узнавать о новых промокодах, 
          горячих предложениях и эксклюзивных скидках
        </p>

        <div className="flex items-center justify-center gap-4">
          {/* Telegram Bot */}
          <a
            href="https://t.me/BoltPromoBot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 hover:text-blue-200 font-medium transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Telegram Bot</span>
          </a>

          {/* Telegram Channel */}
          <a
            href="https://t.me/boltpromomane"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-300 hover:text-purple-200 font-medium transition-all duration-300 hover:scale-105"
          >
            <Users className="w-5 h-5" />
            <span>Telegram Канал</span>
          </a>
        </div>

        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-gray-400 text-sm">
            <strong>Telegram-канал</strong> содержит эксклюзивные финансовые предложения, 
            реферальные ссылки на выгодные банковские продукты и инвестиционные возможности
          </p>
        </div>
      </div>
    </>
  )
}

// Главный компонент страницы
export default function ContactsPage() {
  // Хлебные крошки для контактов
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Контакты', icon: <Phone className="w-4 h-4 text-white" /> }
  ]

  // JSON-LD данные для Organization и ContactPoint
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BoltPromo",
    "url": "https://boltpromo.ru",
    "logo": "https://boltpromo.ru/logo.png",
    "description": "Ведущая платформа промокодов и скидок России",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "email": "support@boltpromo.ru",
        "contactType": "customer service",
        "availableLanguage": "Russian",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      },
      {
        "@type": "ContactPoint",
        "url": "https://t.me/BoltPromoBot",
        "contactType": "customer service",
        "availableLanguage": "Russian"
      }
    ],
    "sameAs": [
      "https://t.me/BoltPromoBot",
      "https://t.me/boltpromomane"
    ]
  }

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Контакты - связаться с поддержкой BoltPromo",
    "description": "Свяжитесь с командой BoltPromo через email support@boltpromo.ru, Telegram @BoltPromoBot или форму обратной связи. Поддержка пользователей и партнерские предложения.",
    "url": "https://boltpromo.ru/contacts",
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
        "name": "Контакты",
        "item": "https://boltpromo.ru/contacts"
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

      {/* Заголовок страницы */}
      <section className="py-8">
        <div className="container-main">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Phone className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Связаться с нами
            </h1>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Есть вопросы о промокодах, предложения по сотрудничеству или техническая проблема? 
              Мы всегда готовы помочь и ответить на все ваши вопросы.
            </p>

            {/* Быстрая статистика */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Ответ в течение 24 часов</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Поддержка 6 дней в неделю</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="pb-16">
        <div className="container-main">
          <Suspense fallback={<ContactsPageSkeleton />}>
            <ContactsContent />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

// SEO метаданные (ОБНОВЛЕНО)
export async function generateMetadata() {
  return {
    title: 'Контакты - связаться с поддержкой BoltPromo',
    description: 'Свяжитесь с командой BoltPromo через email support@boltpromo.ru, Telegram @BoltPromoBot или форму обратной связи. Поддержка пользователей и партнерские предложения.',
    keywords: [
      'контакты BoltPromo',
      'поддержка промокодов',
      'обратная связь',
      'партнерство',
      'техническая поддержка'
    ].join(', '),
    openGraph: {
      title: 'Контакты - BoltPromo',
      description: 'Свяжитесь с нами по любым вопросам о промокодах и скидках',
      type: 'website',
      url: 'https://boltpromo.ru/contacts',
      siteName: 'BoltPromo',
      images: ['/og-image.jpg']
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Контакты - BoltPromo',
      description: 'Поддержка пользователей и партнерские предложения',
      images: ['/og-image.jpg']
    },
    alternates: {
      canonical: 'https://boltpromo.ru/contacts'
    }
  }
}

// Viewport конфигурация
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}