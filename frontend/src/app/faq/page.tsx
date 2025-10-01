import { HelpCircle, Search, MessageCircle, Mail, Phone } from 'lucide-react'
import { Suspense } from 'react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import FAQSection from '@/components/FAQSection'
import JsonLd from '@/components/seo/JsonLd'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

interface FAQPageProps {
  searchParams?: Promise<{
    search?: string
    category?: string
  }>
}

// Данные FAQ
const faqData = [
  {
    id: 1,
    category: 'Общие вопросы',
    question: 'Что такое BoltPromo?',
    answer: 'BoltPromo — это платформа для поиска и использования промокодов и скидок от лучших интернет-магазинов. Мы собираем актуальные предложения, чтобы вы могли экономить на покупках.'
  },
  {
    id: 2,
    category: 'Общие вопросы',
    question: 'Бесплатно ли пользоваться сервисом?',
    answer: 'Да, BoltPromo полностью бесплатен для пользователей. Мы зарабатываем на партнерских программах с магазинами, поэтому вам не нужно ничего платить.'
  },
  {
    id: 3,
    category: 'Промокоды',
    question: 'Как использовать промокод?',
    answer: 'Скопируйте промокод на нашем сайте, перейдите в интернет-магазин по нашей ссылке, добавьте товары в корзину и введите промокод в специальное поле при оформлении заказа.'
  },
  {
    id: 4,
    category: 'Промокоды',
    question: 'Что делать, если промокод не работает?',
    answer: 'Проверьте срок действия промокода, условия использования и минимальную сумму заказа. Если промокод все еще не работает, напишите нам через форму обратной связи.'
  },
  {
    id: 5,
    category: 'Промокоды',
    question: 'Можно ли использовать несколько промокодов одновременно?',
    answer: 'Обычно в одном заказе можно использовать только один промокод. Некоторые магазины разрешают комбинировать промокоды с распродажами, но это зависит от условий конкретного магазина.'
  },
  {
    id: 6,
    category: 'Магазины',
    question: 'Как добавить свой магазин на платформу?',
    answer: 'Если вы представитель интернет-магазина и хотите разместить свои промокоды на BoltPromo, свяжитесь с нами через раздел "Контакты" или напишите на почту support@boltpromo.ru.'
  },
  {
    id: 7,
    category: 'Магазины',
    question: 'Проверяете ли вы магазины-партнеры?',
    answer: 'Да, мы тщательно проверяем все магазины перед добавлением на платформу. Мы сотрудничаем только с надежными интернет-магазинами с хорошей репутацией.'
  },
  {
    id: 8,
    category: 'Технические вопросы',
    question: 'Почему промокод не копируется?',
    answer: 'Убедитесь, что в вашем браузере включены разрешения для доступа к буферу обмена. Также попробуйте обновить страницу или воспользоваться другим браузером.'
  },
  {
    id: 9,
    category: 'Технические вопросы',
    question: 'Сайт работает медленно, что делать?',
    answer: 'Проверьте скорость интернет-соединения, очистите кеш браузера или попробуйте зайти с другого устройства. Если проблема сохраняется, сообщите нам об этом.'
  },
  {
    id: 10,
    category: 'Уведомления',
    question: 'Как подписаться на уведомления о новых промокодах?',
    answer: 'Вы можете подписаться на наш Telegram-бот для получения уведомлений о горячих промокодах и эксклюзивных предложениях. Ссылка на бота находится в шапке сайта.'
  },
  {
    id: 11,
    category: 'Уведомления',
    question: 'Можно ли отписаться от уведомлений?',
    answer: 'Да, вы можете в любой момент отписаться от уведомлений в Telegram-боте, написав команду /stop или заблокировав бота.'
  },
  {
    id: 12,
    category: 'Безопасность',
    question: 'Безопасно ли переходить по вашим ссылкам?',
    answer: 'Да, все ссылки ведут на официальные сайты проверенных интернет-магазинов. Мы не собираем персональные данные при переходах и не сохраняем информацию о ваших покупках.'
  }
]

// Получаем уникальные категории
const categories = Array.from(new Set(faqData.map(item => item.category)))

// Skeleton для загрузки
function FAQPageSkeleton() {
  return (
    <>
      {/* Поиск skeleton */}
      <div className="glass-card p-6 mb-8 animate-shimmer">
        <div className="h-12 bg-white/10 rounded-xl w-full max-w-md mx-auto"></div>
      </div>

      {/* FAQ skeleton */}
      <div className="space-y-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="glass-card p-6 animate-shimmer">
            <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    </>
  )
}

// Главный компонент страницы
export default async function FAQPage({ searchParams }: FAQPageProps) {
  const resolvedSearchParams = await searchParams

  // Хлебные крошки для FAQ
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'FAQ', icon: <HelpCircle className="w-4 h-4 text-white" /> }
  ]

  // JSON-LD данные для FAQPage
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Часто задаваемые вопросы о промокодах - BoltPromo",
    "description": "Ответы на популярные вопросы о работе с промокодами, использовании платформы BoltPromo и сотрудничестве с интернет-магазинами.",
    "url": "https://boltpromo.ru/faq",
    "inLanguage": "ru",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    })),
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
        "name": "FAQ",
        "item": "https://boltpromo.ru/faq"
      }
    ]
  }

  return (
    <div className="min-h-screen">
      {/* JSON-LD разметка */}
      <JsonLd data={faqJsonLd} />
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
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Часто задаваемые вопросы
            </h1>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Ответы на популярные вопросы о работе с промокодами, 
              использовании платформы и сотрудничестве с магазинами.
            </p>

            {/* Быстрая статистика */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>{faqData.length} вопросов</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{categories.length} категорий</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="pb-16">
        <div className="container-main">
          <Suspense fallback={<FAQPageSkeleton />}>
            <FAQSection 
              faqData={faqData}
              categories={categories}
              searchParams={resolvedSearchParams}
            />
          </Suspense>

          {/* Блок "Не нашли ответ?" */}
          <div className="mt-16">
            <div className="glass-card p-8 text-center">
              <MessageCircle className="w-16 h-16 text-white mx-auto mb-6" />
              
              <h3 className="text-2xl font-bold text-white mb-4">
                Не нашли ответ на свой вопрос?
              </h3>
              
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Свяжитесь с нами любым удобным способом, и мы обязательно поможем
              </p>

              {/* Контактные опции */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Telegram */}
                <a 
                  href="https://t.me/BoltPromoBot" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                  <div className="text-left">
                    <div className="font-medium">Telegram-бот</div>
                    <div className="text-sm text-gray-400">Быстрый ответ</div>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:support@boltpromo.ru"
                  className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white transition-all duration-300 hover:scale-105"
                >
                  <Mail className="w-6 h-6 text-green-400" />
                  <div className="text-left">
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-gray-400">support@boltpromo.ru</div>
                  </div>
                </a>

                {/* Контакты */}
                <a 
                  href="/contacts"
                  className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white transition-all duration-300 hover:scale-105"
                >
                  <Phone className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <div className="font-medium">Контакты</div>
                    <div className="text-sm text-gray-400">Все способы связи</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// SEO метаданные
export async function generateMetadata() {
  return {
    title: 'FAQ - часто задаваемые вопросы о промокодах | BoltPromo',
    description: `Ответы на ${faqData.length} популярных вопросов о работе с промокодами, использовании платформы BoltPromo и сотрудничестве с интернет-магазинами.`,
    keywords: [
      'FAQ промокоды',
      'вопросы и ответы',
      'как использовать промокоды',
      'помощь BoltPromo',
      'поддержка пользователей'
    ].join(', '),
    openGraph: {
      title: 'FAQ - часто задаваемые вопросы - BoltPromo',
      description: `Ответы на ${faqData.length} популярных вопросов о промокодах и скидках`,
      type: 'website',
      url: 'https://boltpromo.ru/faq',
      siteName: 'BoltPromo',
      images: ['/og-image.jpg']
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FAQ - часто задаваемые вопросы - BoltPromo',
      description: 'Все ответы о работе с промокодами и платформой',
      images: ['/og-image.jpg']
    },
    alternates: {
      canonical: 'https://boltpromo.ru/faq'
    }
  }
}

// Viewport конфигурация
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark'
}