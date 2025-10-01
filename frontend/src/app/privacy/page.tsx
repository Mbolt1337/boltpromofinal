import { Shield, Lock, Eye, Users, Mail, Calendar } from 'lucide-react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

// Данные политики конфиденциальности (ОБНОВЛЕНО)
const privacyData = {
  lastUpdated: '14 августа 2025',
  effectiveDate: '14 августа 2025',
  companyName: 'BoltPromo',
  websiteUrl: 'boltpromo.ru',
  contactEmail: 'support@boltpromo.ru'
}

// Разделы политики
const privacySections = [
  {
    id: 'overview',
    title: 'Общие положения',
    icon: Eye,
    content: [
      'Настоящая Политика конфиденциальности описывает, как BoltPromo собирает, использует и защищает вашу персональную информацию при использовании нашего веб-сайта и сервисов.',
      'Используя наш сайт, вы соглашаетесь с условиями данной Политики конфиденциальности.',
      'Мы серьезно относимся к защите вашей приватности и обязуемся обеспечить безопасность ваших персональных данных.'
    ]
  },
  {
    id: 'data-collection',
    title: 'Какие данные мы собираем',
    icon: Users,
    content: [
      'Информация, которую вы предоставляете добровольно: имя, email при обращении через форму обратной связи.',
      'Технические данные: IP-адрес, тип браузера, операционная система, время посещения.',
      'Данные об использовании: страницы, которые вы посещаете, время пребывания на сайте, переходы по ссылкам.',
      'Cookies и аналогичные технологии для улучшения работы сайта.'
    ]
  },
  {
    id: 'data-usage',
    title: 'Как мы используем данные',
    icon: Lock,
    content: [
      'Предоставление и улучшение наших услуг по поиску промокодов.',
      'Ответы на ваши запросы и предоставление поддержки.',
      'Анализ использования сайта для улучшения пользовательского опыта.',
      'Обеспечение безопасности и предотвращение мошенничества.',
      'Соблюдение правовых требований.'
    ]
  },
  {
    id: 'data-sharing',
    title: 'Передача данных третьим лицам',
    icon: Shield,
    content: [
      'Мы не продаем, не сдаем в аренду и не передаем ваши персональные данные третьим лицам без вашего согласия.',
      'Исключения составляют случаи, требуемые законом или для защиты наших прав.',
      'Мы можем работать с надежными сервис-провайдерами (хостинг, аналитика) при условии соблюдения ими конфиденциальности.',
      'При переходе в интернет-магазины по нашим ссылкам действуют политики конфиденциальности этих магазинов.'
    ]
  },
  {
    id: 'data-security',
    title: 'Защита данных',
    icon: Lock,
    content: [
      'Мы применяем современные технические и организационные меры для защиты ваших данных.',
      'Данные передаются по защищенному соединению (SSL/TLS).',
      'Доступ к персональным данным имеют только уполномоченные сотрудники.',
      'Мы регулярно обновляем системы безопасности и проводим аудит.'
    ]
  },
  {
    id: 'user-rights',
    title: 'Ваши права',
    icon: Users,
    content: [
      'Право на доступ: вы можете запросить информацию о том, какие данные мы храним о вас.',
      'Право на исправление: вы можете попросить исправить неточные данные.',
      'Право на удаление: вы можете запросить удаление ваших персональных данных.',
      'Право на ограничение обработки: вы можете попросить ограничить использование ваших данных.',
      'Для реализации ваших прав обращайтесь по адресу: support@boltpromo.ru'
    ]
  },
  {
    id: 'cookies',
    title: 'Использование Cookies',
    icon: Eye,
    content: [
      'Мы используем cookies для улучшения работы сайта и анализа трафика.',
      'Необходимые cookies: обеспечивают базовую функциональность сайта.',
      'Аналитические cookies: помогают понять, как пользователи взаимодействуют с сайтом.',
      'Вы можете управлять cookies через настройки браузера, но это может повлиять на функциональность сайта.'
    ]
  },
  {
    id: 'changes',
    title: 'Изменения в политике',
    icon: Calendar,
    content: [
      'Мы можем обновлять данную Политику конфиденциальности время от времени.',
      'Существенные изменения будут опубликованы на этой странице с указанием даты вступления в силу.',
      'Рекомендуем периодически просматривать данную страницу для отслеживания изменений.',
      'Продолжение использования сайта после внесения изменений означает ваше согласие с новой версией политики.'
    ]
  }
]

export default function PrivacyPage() {
  // Хлебные крошки
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Политика конфиденциальности', icon: <Shield className="w-4 h-4 text-white" /> }
  ]

  // JSON-LD данные для WebPage и CreativeWork
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Политика конфиденциальности - BoltPromo",
    "description": "Политика конфиденциальности BoltPromo. Узнайте, как мы собираем, используем и защищаем ваши персональные данные при использовании нашего сервиса промокодов.",
    "url": "https://boltpromo.ru/privacy",
    "inLanguage": "ru",
    "dateModified": "2025-08-14",
    "datePublished": "2025-08-14",
    "isPartOf": {
      "@type": "WebSite",
      "name": "BoltPromo",
      "url": "https://boltpromo.ru"
    }
  }

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": "Политика конфиденциальности BoltPromo",
    "about": "Документ, описывающий правила обработки персональных данных пользователей платформы промокодов BoltPromo",
    "dateModified": "2025-08-14",
    "datePublished": "2025-08-14",
    "author": {
      "@type": "Organization",
      "name": "BoltPromo",
      "url": "https://boltpromo.ru"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BoltPromo",
      "url": "https://boltpromo.ru"
    },
    "inLanguage": "ru"
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
        "name": "Политика конфиденциальности",
        "item": "https://boltpromo.ru/privacy"
      }
    ]
  }

  return (
    <div className="min-h-screen">
      {/* JSON-LD разметка */}
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={creativeWorkJsonLd} />
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
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Политика конфиденциальности
            </h1>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Мы серьезно относимся к защите ваших персональных данных. 
              В данном документе описано, как мы собираем, используем и защищаем вашу информацию.
            </p>

            {/* Информация об обновлении */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Обновлено: {privacyData.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Действует с: {privacyData.effectiveDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="pb-16">
        <div className="container-main">
          
          {/* Навигация по разделам */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Содержание</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {privacySections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm"
                >
                  <section.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{section.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Разделы политики */}
          <div className="space-y-8">
            {privacySections.map((section, index) => (
              <div
                key={section.id}
                id={section.id}
                className="glass-card p-8 scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Контактная информация (ОБНОВЛЕНО) */}
          <div className="mt-12 glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">
                Контактная информация
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  По вопросам конфиденциальности
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>Email: <a href="mailto:support@boltpromo.ru" className="text-blue-400 hover:text-blue-300">support@boltpromo.ru</a></p>
                  <p>Telegram: <a href="https://t.me/BoltPromoBot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@BoltPromoBot</a></p>
                  <p>Сайт: <a href="https://boltpromo.ru" className="text-blue-400 hover:text-blue-300">boltpromo.ru</a></p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Время ответа
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>Email: в течение 24 часов</p>
                  <p>Telegram: в течение 2-4 часов</p>
                  <p>Рабочие дни: Пн-Пт 09:00-18:00</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-300 text-sm">
                <strong>Важно:</strong> Если у вас есть вопросы о том, как мы обрабатываем ваши персональные данные, 
                или вы хотите воспользоваться своими правами, не стесняйтесь обращаться к нам.
              </p>
            </div>
          </div>

          {/* Дата последнего обновления */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Данная политика конфиденциальности была последний раз обновлена {privacyData.lastUpdated} и 
              действует с {privacyData.effectiveDate}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// SEO метаданные (ОБНОВЛЕНО)
export async function generateMetadata() {
  return {
    title: 'Политика конфиденциальности - BoltPromo',
    description: 'Политика конфиденциальности BoltPromo. Узнайте, как мы собираем, используем и защищаем ваши персональные данные при использовании нашего сервиса промокодов.',
    keywords: [
      'политика конфиденциальности',
      'защита данных',
      'приватность',
      'GDPR',
      'персональные данные',
      'BoltPromo'
    ].join(', '),
    openGraph: {
      title: 'Политика конфиденциальности - BoltPromo',
      description: 'Узнайте, как мы защищаем ваши персональные данные',
      type: 'website',
      url: 'https://boltpromo.ru/privacy',
      siteName: 'BoltPromo',
      images: ['/og-image.jpg']
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Политика конфиденциальности - BoltPromo',
      description: 'Узнайте, как мы защищаем ваши персональные данные',
      images: ['/og-image.jpg']
    },
    alternates: {
      canonical: 'https://boltpromo.ru/privacy'
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

// Viewport конфигурация
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}