import { FileText, Users, AlertTriangle, Scale, Shield, Calendar } from 'lucide-react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

// ✅ ИСПРАВЛЕНО: Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic'

// Данные пользовательского соглашения
const termsData = {
  lastUpdated: '14 августа 2025',
  effectiveDate: '14 августа 2025',
  companyName: 'BoltPromo',
  websiteUrl: 'boltpromo.com',
  contactEmail: 'support@boltpromo.ru'
}

// Разделы соглашения
const termsSections = [
  {
    id: 'acceptance',
    title: 'Принятие условий',
    icon: FileText,
    content: [
      'Используя веб-сайт BoltPromo, вы соглашаетесь соблюдать условия данного Пользовательского соглашения.',
      'Если вы не согласны с какими-либо условиями, пожалуйста, не используйте наш сайт.',
      'Мы можем изменять данное соглашение время от времени, уведомляя вас об изменениях на этой странице.',
      'Продолжение использования сайта после внесения изменений означает ваше согласие с новыми условиями.'
    ]
  },
  {
    id: 'services',
    title: 'Описание услуг',
    icon: Users,
    content: [
      'BoltPromo предоставляет платформу для поиска и использования промокодов и скидок от интернет-магазинов.',
      'Мы собираем информацию о доступных промокодах и предоставляем ее пользователям бесплатно.',
      'Наш сервис не является интернет-магазином и не продает товары напрямую.',
      'Мы выступаем посредником между пользователями и партнерскими магазинами.'
    ]
  },
  {
    id: 'user-obligations',
    title: 'Обязанности пользователя',
    icon: Shield,
    content: [
      'Вы обязуетесь использовать сайт только в законных целях.',
      'Запрещается попытки взлома, нарушения работы сайта или несанкционированного доступа к данным.',
      'Не допускается размещение вредоносного контента, спама или нарушающей закон информации.',
      'Вы несете ответственность за сохранность своих учетных данных, если таковые имеются.',
      'При использовании формы обратной связи необходимо предоставлять достоверную информацию.'
    ]
  },
  {
    id: 'limitations',
    title: 'Ограничения ответственности',
    icon: AlertTriangle,
    content: [
      'BoltPromo не несет ответственности за качество товаров или услуг партнерских магазинов.',
      'Мы не гарантируем постоянную доступность или бесперебойную работу сайта.',
      'Все промокоды предоставляются "как есть", без гарантий их действительности.',
      'Мы не несем ответственности за убытки, возникшие в результате использования промокодов.',
      'Наша ответственность ограничена максимально допустимыми законом пределами.'
    ]
  },
  {
    id: 'promocodes',
    title: 'Условия использования промокодов',
    icon: FileText,
    content: [
      'Промокоды предоставляются интернет-магазинами и могут иметь ограничения по времени или условиям использования.',
      'BoltPromo не создает и не контролирует промокоды, мы только предоставляем информацию о них.',
      'Действительность промокода определяется правилами конкретного интернет-магазина.',
      'Мы стараемся поддерживать актуальность информации, но не можем гарантировать, что все промокоды действительны.',
      'При возникновении проблем с промокодом обращайтесь напрямую в интернет-магазин.'
    ]
  },
  {
    id: 'intellectual-property',
    title: 'Интеллектуальная собственность',
    icon: Scale,
    content: [
      'Все материалы сайта BoltPromo (дизайн, тексты, логотипы) защищены авторским правом.',
      'Логотипы и торговые марки партнерских магазинов принадлежат их владельцам.',
      'Запрещается копирование, распространение или использование материалов сайта без письменного разрешения.',
      'Пользователи могут использовать информацию о промокодах только в личных некоммерческих целях.',
      'При обнаружении нарушений авторских прав обращайтесь по адресу: support@boltpromo.ru'
    ]
  },
  {
    id: 'privacy',
    title: 'Конфиденциальность',
    icon: Shield,
    content: [
      'Обработка персональных данных осуществляется в соответствии с нашей Политикой конфиденциальности.',
      'Мы собираем только необходимую информацию для предоставления услуг.',
      'Ваши данные не передаются третьим лицам без вашего согласия, кроме случаев, предусмотренных законом.',
      'При переходе в партнерские магазины действуют их политики конфиденциальности.'
    ]
  },
  {
    id: 'partnerships',
    title: 'Партнерские отношения',
    icon: Users,
    content: [
      'BoltPromo сотрудничает с интернет-магазинами на основе партнерских программ.',
      'Мы можем получать комиссию за переходы пользователей в партнерские магазины.',
      'Это не влияет на стоимость товаров для пользователей и не изменяет условия промокодов.',
      'Партнерские отношения не влияют на объективность предоставляемой информации.',
      'Список основных партнеров доступен по запросу.'
    ]
  },
  {
    id: 'termination',
    title: 'Прекращение действия',
    icon: AlertTriangle,
    content: [
      'Мы оставляем за собой право ограничить или прекратить доступ к сайту для пользователей, нарушающих данное соглашение.',
      'Вы можете прекратить использование сайта в любое время.',
      'При прекращении действия соглашения сохраняются разделы, касающиеся ответственности и интеллектуальной собственности.',
      'Накопленные данные об использовании сайта могут сохраняться в соответствии с Политикой конфиденциальности.'
    ]
  },
  {
    id: 'law',
    title: 'Применимое право',
    icon: Scale,
    content: [
      'Данное соглашение регулируется законодательством Российской Федерации.',
      'Все споры подлежат рассмотрению в судах Российской Федерации.',
      'В случае признания какого-либо условия недействительным, остальные условия сохраняют силу.',
      'Настоящее соглашение представляет полное соглашение между сторонами по вопросам использования сайта.'
    ]
  }
]

export default function TermsPage() {
  // Хлебные крошки
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Пользовательское соглашение', icon: <FileText className="w-4 h-4 text-white" /> }
  ]

  return (
    <div className="min-h-screen">
      {/* Хлебные крошки */}
      <div className="container-main py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Заголовок страницы */}
      <section className="py-8">
        <div className="container-main">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Пользовательское соглашение
            </h1>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Условия использования сайта BoltPromo, права и обязанности сторон, 
              ограничения ответственности и другие важные аспекты сотрудничества.
            </p>

            {/* Информация об обновлении */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Обновлено: {termsData.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Действует с: {termsData.effectiveDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="pb-16">
        <div className="container-main">
          
          {/* Важное уведомление */}
          <div className="glass-card p-6 mb-8 border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-yellow-300 font-semibold mb-2">Важно прочитать перед использованием</h3>
                <p className="text-yellow-200 text-sm leading-relaxed">
                  Данное соглашение определяет условия использования сайта BoltPromo. 
                  Продолжая пользоваться нашим сервисом, вы автоматически соглашаетесь с этими условиями. 
                  Пожалуйста, внимательно ознакомьтесь с документом.
                </p>
              </div>
            </div>
          </div>

          {/* Навигация по разделам */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Содержание</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {termsSections.map((section) => (
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

          {/* Разделы соглашения */}
          <div className="space-y-8">
            {termsSections.map((section, index) => (
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

          {/* Дополнительная информация */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Контактная информация */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">
                  Связь с нами
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    По вопросам соглашения
                  </h3>
                  <div className="space-y-1 text-gray-300">
                    <p>Email: <a href="mailto:support@boltpromo.ru" className="text-blue-400 hover:text-blue-300">support@boltpromo.ru</a></p>
                    <p>Telegram: <a href="https://t.me/BoltPromoBot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@BoltPromoBot</a></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Реквизиты
                  </h3>
                  <div className="space-y-1 text-gray-300 text-sm">
                    <p>Наименование: BoltPromo</p>
                    <p>Сайт: boltpromo.com</p>
                    <p>Email: support@boltpromo.ru</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Полезные ссылки */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold text-white">
                  Связанные документы
                </h2>
              </div>

              <div className="space-y-4">
                <a 
                  href="/privacy"
                  className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-white">Политика конфиденциальности</h3>
                      <p className="text-gray-400 text-sm">Как мы защищаем ваши данные</p>
                    </div>
                  </div>
                </a>

                <a 
                  href="/faq"
                  className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-white">Часто задаваемые вопросы</h3>
                      <p className="text-gray-400 text-sm">Ответы на популярные вопросы</p>
                    </div>
                  </div>
                </a>

                <a 
                  href="/contacts"
                  className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">Контакты</h3>
                      <p className="text-gray-400 text-sm">Связаться с поддержкой</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Дата последнего обновления */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Данное пользовательское соглашение было последний раз обновлено {termsData.lastUpdated} и 
              действует с {termsData.effectiveDate}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// SEO метаданные
export async function generateMetadata() {
  return {
    title: 'Пользовательское соглашение - условия использования BoltPromo',
    description: 'Пользовательское соглашение BoltPromo. Условия использования сайта, права и обязанности сторон, ограничения ответственности и правовые аспекты.',
    keywords: [
      'пользовательское соглашение',
      'условия использования',
      'правила сайта',
      'ограничения ответственности',
      'BoltPromo'
    ].join(', '),
    openGraph: {
      title: 'Пользовательское соглашение - BoltPromo',
      description: 'Условия использования сайта BoltPromo и правовые аспекты',
      type: 'website',
      url: 'https://boltpromo.com/terms'
    },
    alternates: {
      canonical: 'https://boltpromo.com/terms'
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