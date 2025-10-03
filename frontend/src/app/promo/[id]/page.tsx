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

// ===== STRICT GEOMETRY + CALM COLORED STYLES (как в PromoCard) =====

// Бейджи - строгая геометрия
const BADGE_RECOMMENDED = "flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-200 text-xs font-semibold transition-all duration-300 ease-out hover:bg-blue-500/15"
const BADGE_HOT = "flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-200 text-xs font-semibold transition-all duration-300 ease-out hover:bg-orange-500/15"

// Блок скидки - строгая геометрия
const DISCOUNT_BLOCK = "inline-flex items-center px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white font-semibold text-base mb-4 transition-all duration-300 ease-out hover:bg-white/10 w-fit"

// Основная панель контента - строгая геометрия
const MAIN_CARD = "rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-6 md:p-7 lg:p-8 transition-all duration-300 ease-out relative overflow-hidden group"

// Сайдбар панели - строгая геометрия
const SIDEBAR_CARD = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 transition-all duration-300 ease-out group"

// Hover эффект как в карточке
const CARD_HOVER_EFFECT = "absolute inset-0 opacity-0 transition-opacity duration-300 ease-out pointer-events-none bg-gradient-to-br from-blue-500/3 to-purple-500/3 rounded-2xl group-hover:opacity-100"

// Цветные кнопки CTA по типам офферов (как в PromoCard)
const CTA_BUTTON_COUPON = "inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg border border-emerald-500/30 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:outline-none"

const CTA_BUTTON_FINANCIAL = "inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:outline-none"

const CTA_BUTTON_DEAL = "inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg border border-amber-500/30 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-base transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:outline-none"

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

const getCTAButtonClass = (offerType?: string): string => {
  switch (offerType) {
    case 'coupon': return CTA_BUTTON_COUPON
    case 'financial': return CTA_BUTTON_FINANCIAL
    case 'deal':
    case 'cashback':
    default: return CTA_BUTTON_DEAL
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

    const relatedPromos = await getRelatedPromocodes(
      promoId,
      promo.store?.slug,
      primaryCategorySlug,
      6
    )

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
          {/* Хлебные крошки */}
          <div className="container-main py-6">
            <div className="overflow-hidden">
              <Breadcrumbs items={breadcrumbItems} />
            </div>
          </div>

          {/* Кнопка "Назад" */}
          <section className="py-4">
            <div className="container-main">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="text-sm sm:text-base">Вернуться на главную</span>
              </Link>
            </div>
          </section>

          {/* Основной контент */}
          <section className="py-8">
            <div className="container-main">
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">

                {/* Основной контент */}
                <div className="lg:col-span-2 xl:col-span-3 space-y-8">

                  {/* HERO КАРТОЧКА - СТРОГАЯ ГЕОМЕТРИЯ */}
                  <div className={MAIN_CARD}>

                    {/* Hover эффект */}
                    <div className={CARD_HOVER_EFFECT}></div>

                    <div className="relative z-10">
                      {/* Хедер карточки */}
                      <div className="flex items-start justify-between mb-6 min-h-[4rem]">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          {/* Логотип магазина */}
                          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-white/8">
                            {promo.store?.logo ? (
                              <Image
                                src={promo.store.logo}
                                alt={storeName}
                                width={80}
                                height={80}
                                className="rounded-xl object-cover w-full h-full transition-all duration-300 ease-out"
                                sizes="(max-width: 1024px) 64px, 80px"
                                priority
                              />
                            ) : (
                              <Store className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400 transition-all duration-300 ease-out group-hover:scale-110" />
                            )}
                          </div>

                          {/* Информация */}
                          <div className="min-w-0 flex-1">
                            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight transition-colors duration-300 ease-out group-hover:text-gray-100">
                              {promo.title}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-400 text-sm transition-colors duration-300 ease-out group-hover:text-gray-300">
                              <span className="truncate">{storeName}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate">{categoryName}</span>
                            </div>
                          </div>
                        </div>

                        {/* БЕЙДЖ ДАТЫ - ABSOLUTE RIGHT-3 TOP-3 (как в PromoCard) */}
                        {formattedDate && (
                          <div className="absolute right-3 top-3 sm:right-6 sm:top-6 md:right-7 md:top-7 lg:right-8 lg:top-8">
                            <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white/70">
                              <Calendar className="w-3.5 h-3.5 text-white/60" />
                              <span className="font-medium">до {formattedDate}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* БЕЙДЖИ - СТРОГАЯ ГЕОМЕТРИЯ (как в PromoCard) */}
                      {(promo.is_recommended || promo.is_hot) && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                          {promo.is_recommended && (
                            <div className={BADGE_RECOMMENDED}>
                              <Star className="w-3.5 h-3.5 fill-current transition-transform duration-300 ease-out" />
                              <span className="hidden sm:inline">BoltPromo рекомендует</span>
                              <span className="sm:hidden">Рекомендуем</span>
                            </div>
                          )}

                          {promo.is_hot && (
                            <div className={BADGE_HOT}>
                              <Flame className="w-3.5 h-3.5 transition-transform duration-300 ease-out" />
                              <span>Горячий</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* СКИДКА - СТРОГАЯ ГЕОМЕТРИЯ */}
                      {promo.discount_text && (
                        <div className={DISCOUNT_BLOCK}>
                          <span>{promo.discount_text}</span>
                        </div>
                      )}

                      {/* ОПИСАНИЕ */}
                      {promo.description && (
                        <p className="text-gray-300 mb-3 leading-relaxed text-base lg:text-lg transition-colors duration-300 ease-out group-hover:text-gray-200">
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

                      {/* СТАТИСТИКА */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-6 border-t border-white/10">
                        <span className="text-gray-500 text-xs font-medium transition-colors duration-300 ease-out group-hover:text-gray-400">
                          Использовали: {promo.views_count || 0}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-lg transition-all duration-300 ease-out hover:scale-105 text-blue-300 bg-blue-500/15 border border-blue-500/25">
                            {getOfferTypeLabel(promo.offer_type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ПОДРОБНАЯ ИНФОРМАЦИЯ */}
                  {(promo.long_description || promo.steps || promo.fine_print || promo.disclaimer) && (
                    <div className={MAIN_CARD}>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
                        Подробная информация
                      </h2>

                      <div className="space-y-6">
                        {/* Подробное описание */}
                        {promo.long_description && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-white flex items-center gap-3 text-base">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 flex-shrink-0">
                                <Info className="w-5 h-5 text-blue-400" />
                              </div>
                              Подробное описание
                            </h3>
                            <div className="text-gray-300 leading-relaxed pl-13 text-base">
                              {promo.long_description}
                            </div>
                          </div>
                        )}

                        {/* Шаги активации */}
                        {promo.steps && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-white flex items-center gap-3 text-base">
                              <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              </div>
                              Шаги активации
                            </h3>
                            <div className="text-gray-300 leading-relaxed pl-13 text-base whitespace-pre-line">
                              {promo.steps}
                            </div>
                          </div>
                        )}

                        {/* Условия использования */}
                        {promo.fine_print && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-white flex items-center gap-3 text-base">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                              </div>
                              Условия использования
                            </h3>
                            <div className="text-gray-300 leading-relaxed pl-13 text-base">
                              {promo.fine_print}
                            </div>
                          </div>
                        )}

                        {/* Дисклеймер */}
                        {promo.disclaimer && (
                          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 ease-out">
                            <div className="flex items-start gap-4">
                              <AlertCircle className="w-6 h-6 text-white/70 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-white mb-2 text-lg">Важная информация</h4>
                                <p className="text-gray-300 leading-relaxed text-base">
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

                {/* САЙДБАР - СТРОГАЯ ГЕОМЕТРИЯ */}
                <div className="lg:col-span-1 xl:col-span-1 space-y-6">

                  {/* О МАГАЗИНЕ - с цветной CTA по типу оффера */}
                  <div className={SIDEBAR_CARD}>
                    <h3 className="text-lg font-bold text-white mb-6">
                      О магазине
                    </h3>

                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110">
                        {promo.store?.logo ? (
                          <Image
                            src={promo.store.logo}
                            alt={storeName}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-xl transition-all duration-300 ease-out"
                            sizes="80px"
                          />
                        ) : (
                          <Store className="w-10 h-10 text-gray-400" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-white mb-2 transition-colors duration-300 ease-out group-hover:text-blue-300">{storeName}</h4>
                        <p className="text-gray-400 transition-colors duration-300 ease-out group-hover:text-gray-300 text-base">{categoryName}</p>
                      </div>

                      {/* ЦВЕТНАЯ CTA по типу оффера (как в PromoCard) */}
                      <a
                        href={safeExternalUrl(storeUrl)}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className={getCTAButtonClass(promo.offer_type)}
                      >
                        <span>Перейти в магазин</span>
                        <ExternalLink className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>

                  {/* СТАТИСТИКА */}
                  <div className={SIDEBAR_CARD}>
                    <h3 className="text-lg font-bold text-white mb-6">
                      Статистика
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 ease-out">
                        <span className="text-gray-400 text-sm">Использовали</span>
                        <span className="text-white font-bold text-lg">{promo.views_count || 0}</span>
                      </div>

                      <div className="flex justify-between items-center p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 ease-out">
                        <span className="text-gray-400 text-sm">Тип предложения</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-lg text-blue-300 bg-blue-500/15 border border-blue-500/25">
                          {getOfferTypeLabel(promo.offer_type)}
                        </span>
                      </div>

                      {fullFormattedDate && (
                        <div className="flex justify-between items-center p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 ease-out">
                          <span className="text-gray-400 text-sm">Действует до</span>
                          <span className="text-white font-medium text-sm">
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
                <section className="py-16" aria-label="Похожие предложения">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Другие предложения от {storeName}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                      Лучшие предложения от проверенных магазинов
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPromos.map((relatedPromo) => (
                      <div key={relatedPromo.id} className="hover:scale-[1.02] transition-all duration-300 ease-out">
                        <PromoCard promo={relatedPromo} />
                      </div>
                    ))}
                  </div>
                </section>
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
