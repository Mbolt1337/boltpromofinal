import { notFound } from 'next/navigation'
import { getPromocodeById, getRelatedPromocodes } from '@/lib/api'
import PromoCard from '@/components/PromoCard'
import Link from 'next/link'
import { ArrowLeft, Info, CheckCircle, AlertCircle, Star, Store, Calendar, Flame, ExternalLink, Copy, CreditCard, Gift, Percent } from 'lucide-react'
import Image from 'next/image'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import PromoActions from '@/components/PromoActions'
import { safeExternalUrl } from '@/lib/utils'
import { SITE_CONFIG } from '@/lib/seo'
import type { Metadata } from 'next'

interface PromoPageProps {
  params: Promise<{
    id: string
  }>
}

// ===== ADAPTIVE DESIGN WITH GRID SYSTEM =====

// Бейджи - адаптивные
const BADGE_RECOMMENDED = "flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-200 text-xs font-semibold transition-all duration-300 ease-out hover:bg-blue-500/15"
const BADGE_HOT = "flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-200 text-xs font-semibold transition-all duration-300 ease-out hover:bg-orange-500/15"

// Блок скидки - адаптивный
const DISCOUNT_BLOCK = "inline-flex items-center px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border border-white/20 bg-white/5 text-white font-semibold text-sm lg:text-base mb-3 lg:mb-4 transition-all duration-300 ease-out hover:bg-white/10 w-fit"

// Основная панель контента - адаптивный padding
const MAIN_CARD = "rounded-xl lg:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-4 sm:p-5 lg:p-6 transition-all duration-300 ease-out relative overflow-hidden group"

// Сайдбар панели - адаптивный padding
const SIDEBAR_CARD = "rounded-xl lg:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 lg:p-6 transition-all duration-300 ease-out group"

// Hover эффект
const CARD_HOVER_EFFECT = "absolute inset-0 opacity-0 transition-opacity duration-300 ease-out pointer-events-none bg-gradient-to-br from-blue-500/3 to-purple-500/3 rounded-xl lg:rounded-2xl group-hover:opacity-100"

// Унифицированная кнопка CTA - адаптивная
const CTA_BUTTON_UNIFIED = "inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 lg:px-6 lg:py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm hover:bg-emerald-500/20 text-emerald-200 hover:text-emerald-100 font-semibold text-sm lg:text-base transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:outline-none"

// Вспомогательные функции
const normalizeUrl = (url?: string): string => {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

const getPromoAffiliateUrl = (promo: any): string => {
  return normalizeUrl(promo.action_url || promo.store?.url)
}

const getStoreUrl = (store: any): string => {
  return normalizeUrl(store?.url)
}

const getOfferTypeLabel = (offerType?: string): string => {
  switch (offerType) {
    case 'coupon': return 'Промокод'
    case 'deal': return 'Скидка'
    case 'financial': return 'Финансы'
    case 'cashback': return 'Кэшбэк'
    default: return 'Общее'
  }
}

const getOfferTypeIcon = (offerType?: string) => {
  switch (offerType) {
    case 'coupon': return Copy
    case 'deal': return Percent
    case 'financial': return CreditCard
    case 'cashback': return Gift
    default: return Copy
  }
}


// SEO Metadata
export async function generateMetadata({ params }: PromoPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const promo = await getPromocodeById(id)

    if (!promo) {
      return {
        title: 'Промокод не найден - BoltPromo'
      }
    }

    const storeName = promo.store?.name || 'Магазин'
    const title = `${promo.title} — ${storeName} | BoltPromo`
    const description = promo.description || `Эксклюзивный промокод ${storeName}. Экономьте с BoltPromo!`

    return {
      title,
      description,
      alternates: {
        canonical: `${SITE_CONFIG.url}/promo/${promo.id}`
      },
      openGraph: {
        title: `${promo.title} — ${storeName}`,
        description,
        url: `${SITE_CONFIG.url}/promo/${promo.id}`,
        siteName: SITE_CONFIG.name,
        locale: 'ru_RU',
        type: 'website',
        images: promo.store?.logo ? [
          {
            url: promo.store.logo,
            width: 1200,
            height: 630,
            alt: storeName
          }
        ] : []
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      }
    }
  } catch {
    return {
      title: 'Промокод - BoltPromo'
    }
  }
}

export default async function PromoPage({ params }: PromoPageProps) {
  const { id } = await params

  try {
    const promoId = Number(id)
    if (Number.isNaN(promoId)) {
      notFound()
    }

    const promo = await getPromocodeById(id)

    if (!promo) {
      notFound()
    }

    const primaryCategorySlug = promo.category?.slug ?? promo.categories?.[0]?.slug

    // Debug: проверяем что передаётся в функцию
    console.log('Getting related promos for:', {
      promoId,
      storeSlug: promo.store?.slug,
      storeName: promo.store?.name,
      categorySlug: primaryCategorySlug
    })

    const relatedPromos = await getRelatedPromocodes(
      promoId,
      promo.store?.slug,
      primaryCategorySlug,
      6
    )

    console.log(`Found ${relatedPromos.length} related promos`)
    if (relatedPromos.length > 0) {
      console.log('Related promos stores:', relatedPromos.map(p => p.store?.name))
    }

    const storeName = promo.store?.name || 'Неизвестный магазин'
    const categoryName = promo.category?.name || 'Общее'
    const promoAffiliateUrl = getPromoAffiliateUrl(promo)
    const storeUrl = getStoreUrl(promo.store)

    // Хлебные крошки
    const breadcrumbItems = [
      { label: 'Главная', href: '/' },
      { label: 'Магазины', href: '/stores' },
      {
        label: storeName.length > 20 ? `${storeName.slice(0, 20)}...` : storeName,
        href: `/stores/${promo.store?.slug}`
      },
      {
        label: promo.title.length > 30 ? `${promo.title.slice(0, 30)}...` : promo.title
      }
    ]

    // Форматирование даты
    const formattedDate = promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    }) : null

    const fullFormattedDate = promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : null

    // JSON-LD для SEO
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: promo.title,
      description: promo.description || '',
      brand: {
        '@type': 'Brand',
        name: storeName
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceValidUntil: promo.expires_at || undefined,
        url: `${SITE_CONFIG.url}/promo/${promo.id}`
      }
    }

    return (
      <>
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="min-h-screen">
          {/* Хлебные крошки + Назад */}
          <div className="container-main pt-4 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 hover:scale-105 group text-sm"
              >
                <ArrowLeft className="w-4 h-4 group-hover:scale-110 group-hover:-translate-x-0.5 transition-all duration-300" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-300">Назад</span>
              </Link>
            </div>
            <div className="overflow-hidden">
              <Breadcrumbs items={breadcrumbItems} />
            </div>
          </div>

          {/* Основной контент */}
          <section className="py-4 lg:py-6">
            <div className="container-main">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

                  {/* Основной контент - 2 из 3 колонок */}
                  <div className="lg:col-span-2 space-y-4 lg:space-y-5">

                  {/* HERO КАРТОЧКА - СТРОГАЯ ГЕОМЕТРИЯ */}
                  <div className={MAIN_CARD}>

                    {/* Hover эффект */}
                    <div className={CARD_HOVER_EFFECT}></div>

                    <div className="relative z-10">
                      {/* Хедер карточки - компактный и адаптивный */}
                      <div className="flex items-start gap-3 sm:gap-4 mb-4">
                        {/* Логотип магазина - адаптивный размер */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl lg:rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 transition-all duration-300 ease-out group-hover:scale-105 group-hover:bg-white/8">
                          {promo.store?.logo ? (
                            <Image
                              src={promo.store.logo}
                              alt={storeName}
                              width={96}
                              height={96}
                              className="rounded-xl lg:rounded-2xl object-cover w-full h-full transition-all duration-300 ease-out"
                              sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
                              priority
                            />
                          ) : (
                            <Store className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 transition-all duration-300 ease-out group-hover:scale-110" />
                          )}
                        </div>

                        {/* Информация - адаптивные размеры */}
                        <div className="min-w-0 flex-1">
                          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight line-clamp-2 transition-colors duration-300 ease-out group-hover:text-gray-100">
                            {promo.title}
                          </h1>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs sm:text-sm transition-colors duration-300 ease-out group-hover:text-gray-300 mb-2">
                            <span className="truncate">{storeName}</span>
                            <span>•</span>
                            <span className="truncate">{categoryName}</span>
                          </div>

                          {/* БЕЙДЖИ под названием */}
                          <div className="flex flex-wrap items-center gap-2">
                            {promo.is_recommended && (
                              <div className={BADGE_RECOMMENDED}>
                                <Star className="w-3 h-3 fill-current" />
                                <span>Рекомендуем</span>
                              </div>
                            )}
                            {promo.is_hot && (
                              <div className={BADGE_HOT}>
                                <Flame className="w-3 h-3" />
                                <span>Горячий</span>
                              </div>
                            )}
                            {formattedDate && (
                              <div className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70">
                                <Calendar className="w-3 h-3 text-white/60" />
                                <span className="font-medium whitespace-nowrap">до {formattedDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* СКИДКА */}
                      {promo.discount_text && (
                        <div className={DISCOUNT_BLOCK}>
                          <span>{promo.discount_text}</span>
                        </div>
                      )}

                      {/* ОПИСАНИЕ - адаптивный */}
                      {promo.description && (
                        <p className="text-gray-400 text-sm lg:text-base leading-relaxed mb-4 transition-colors duration-300 ease-out group-hover:text-gray-300">
                          {promo.description}
                        </p>
                      )}

                      {/* ДЕЙСТВИЯ - PromoActions (уже используется правильно) */}
                      <PromoActions
                        promoId={promo.id}
                        storeId={promo.store?.id}
                        offerType={promo.offer_type || 'coupon'}
                        code={promo.code}
                        promoAffiliateUrl={promoAffiliateUrl}
                        storeUrl={storeUrl}
                        title={promo.title}
                        storeName={storeName}
                      />

                    </div>
                  </div>

                  {/* ПОДРОБНАЯ ИНФОРМАЦИЯ */}
                  {(promo.long_description || promo.steps || promo.fine_print || promo.disclaimer) && (
                    <div className={MAIN_CARD}>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-5">
                        Подробная информация
                      </h2>

                      <div className="space-y-4 lg:space-y-5">
                        {/* Подробное описание */}
                        {promo.long_description && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-white flex items-center gap-2.5 text-sm sm:text-base">
                              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-blue-400" />
                              </div>
                              Подробное описание
                            </h3>
                            <div className="text-gray-400 leading-relaxed text-sm lg:text-base">
                              {promo.long_description}
                            </div>
                          </div>
                        )}

                        {/* Шаги активации */}
                        {promo.steps && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-white flex items-center gap-2.5 text-sm sm:text-base">
                              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-green-400" />
                              </div>
                              Шаги активации
                            </h3>
                            <div className="text-gray-400 leading-relaxed text-sm lg:text-base whitespace-pre-line">
                              {promo.steps}
                            </div>
                          </div>
                        )}

                        {/* Условия использования */}
                        {promo.fine_print && (
                          <div className="space-y-2">
                            <h3 className="font-semibold text-white flex items-center gap-2.5 text-sm sm:text-base">
                              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-amber-400" />
                              </div>
                              Условия использования
                            </h3>
                            <div className="text-gray-400 leading-relaxed text-sm lg:text-base">
                              {promo.fine_print}
                            </div>
                          </div>
                        )}

                        {/* Дисклеймер */}
                        {promo.disclaimer && (
                          <div className="p-3 sm:p-4 lg:p-5 rounded-lg border border-white/10 bg-white/5">
                            <div className="flex items-start gap-3 sm:gap-3.5 lg:gap-4">
                              <AlertCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-white/70 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-white mb-1.5 lg:mb-2 text-sm sm:text-base">Важная информация</h4>
                                <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                                  {promo.disclaimer}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* САЙДБАР - 1 из 3 колонок */}
                <div className="lg:col-span-1 space-y-4 lg:space-y-5">

                  {/* О МАГАЗИНЕ */}
                  <div className={SIDEBAR_CARD}>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4">
                      О магазине
                    </h3>

                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mx-auto bg-white/5 border border-white/10 flex items-center justify-center">
                        {promo.store?.logo ? (
                          <Image
                            src={promo.store.logo}
                            alt={storeName}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-lg"
                            sizes="(max-width: 640px) 64px, 80px"
                          />
                        ) : (
                          <Store className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white mb-1">{storeName}</h4>
                        <p className="text-gray-400 text-xs sm:text-sm">{categoryName}</p>
                      </div>

                      <a
                        href={safeExternalUrl(storeUrl)}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className={CTA_BUTTON_UNIFIED}
                      >
                        <span>Перейти в магазин</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* СТАТИСТИКА */}
                  <div className={SIDEBAR_CARD}>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-4">
                      Статистика
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 sm:p-3.5 lg:p-4 rounded-lg border border-white/10 bg-white/5">
                        <span className="text-gray-400 text-xs sm:text-sm">Использовали</span>
                        <span className="text-white font-bold text-base sm:text-lg">{promo.views_count || 0}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 sm:p-3.5 lg:p-4 rounded-lg border border-white/10 bg-white/5">
                        <span className="text-gray-400 text-xs sm:text-sm">Тип</span>
                        <span className="text-xs sm:text-sm font-medium px-2 py-0.5 rounded-md text-blue-300 bg-blue-500/15 border border-blue-500/25">
                          {getOfferTypeLabel(promo.offer_type)}
                        </span>
                      </div>

                      {fullFormattedDate && (
                        <div className="flex justify-between items-center p-3 sm:p-3.5 lg:p-4 rounded-lg border border-white/10 bg-white/5">
                          <span className="text-gray-400 text-xs sm:text-sm">Действует до</span>
                          <span className="text-white font-medium text-xs sm:text-sm">
                            {fullFormattedDate}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ПОХОЖИЕ ПРЕДЛОЖЕНИЯ */}
              {relatedPromos.length > 0 && (
                <div className="col-span-full mt-8 lg:mt-12">
                  <div className="mb-6 lg:mb-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-3">
                      Другие предложения от {storeName}
                    </h2>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Лучшие предложения от проверенных магазинов
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    {relatedPromos.map((relatedPromo) => (
                      <PromoCard key={relatedPromo.id} promo={relatedPromo} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </>
    )
  } catch (error) {
    console.error('Ошибка загрузки промокода:', error)
    notFound()
  }
}
