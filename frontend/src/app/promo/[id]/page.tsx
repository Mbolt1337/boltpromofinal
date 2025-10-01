import { notFound } from 'next/navigation'
import { getPromocodeById, getRelatedPromocodes } from '@/lib/api'
import PromoCard from '@/components/PromoCard'
import Link from 'next/link'
import { ArrowLeft, Info, CheckCircle, AlertCircle, Star, Store, Clock, Flame, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import PromoActions from '@/components/PromoActions'
import { safeExternalUrl } from '@/lib/utils'

interface PromoPageProps {
  params: Promise<{
    id: string
  }>
}

// ===== PRESET-КЛАССЫ ДЛЯ КОНСИСТЕНТНОСТИ =====

// Preset для заголовков секций
const SECTION_HEADING = "text-xl sm:text-2xl font-bold text-white mb-6"

// Preset для основных glass-панелей
const GLASS_PANEL = "glass-card p-6 hover:scale-[1.01] transition-all duration-300 ease-out group"

// Preset для сайдбар панелей
const SIDEBAR_PANEL = "glass-card p-6 hover:scale-[1.01] lg:hover:scale-[1.02] transition-all duration-300 ease-out group"

// Preset для hover-эффекта карточек
const CARD_HOVER_EFFECT = "absolute inset-0 opacity-0 transition-opacity duration-300 ease-out pointer-events-none bg-gradient-to-br from-blue-500/3 to-purple-500/3 group-hover:opacity-100"

// Preset для информационных блоков с иконками
const INFO_BLOCK_WRAPPER = "space-y-4"
const INFO_BLOCK_ITEM = "space-y-3"
const INFO_BLOCK_HEADER = "font-semibold text-white flex items-center gap-3 text-base group"
const INFO_BLOCK_ICON_WRAPPER = "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 flex-shrink-0"
const INFO_BLOCK_CONTENT = "text-gray-300 leading-relaxed pl-13 text-base"

// Preset для унифицированных бейджей
const BADGE_BASE = "flex items-center gap-1.5 px-3 py-1.5 glass-card border-white/20 text-white/90 text-xs font-semibold transition-all duration-300 ease-out hover:scale-105 hover:bg-white/10"
const BADGE_RECOMMENDED = "flex items-center gap-1.5 px-3 py-1.5 glass-card border-blue-500/30 text-blue-300 text-xs font-semibold transition-all duration-300 ease-out hover:scale-105 hover:bg-blue-500/10"
const BADGE_HOT = "flex items-center gap-1.5 px-3 py-1.5 glass-card border-orange-500/30 text-orange-300 text-xs font-semibold transition-all duration-300 ease-out hover:scale-105 hover:bg-orange-500/10"

// Preset для статистических элементов
const STATS_ITEM = "flex justify-between items-center p-4 glass-card border-white/10 hover:bg-white/10 transition-all duration-300 ease-out"

// Preset для единого спейсинга
const SECTION_SPACING = "space-y-6"
const CONTENT_SPACING = "space-y-8"

// Нормализатор партнерских ссылок
const normalizeUrl = (url?: string): string => {
  if (!url) return '#'
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  return `https://${url}`
}

// Функция для получения партнерской ссылки промокода
const getPromoAffiliateUrl = (promo: any): string => {
  return normalizeUrl(
    promo.action_url || // ИСПРАВЛЕНО: используем action_url как в PromoCard
    promo.store?.url  // Fallback на обычный сайт магазина
  )
}

// Функция для получения ссылки магазина (правильное поле из Django)
const getStoreUrl = (store: any): string => {
  return normalizeUrl(store?.url)
}

// Функция для правильного отображения типов предложений
const getOfferTypeLabel = (offerType?: string): string => {
  switch (offerType) {
    case 'coupon':
      return 'Промокод'
    case 'deal':
      return 'Скидка'
    case 'financial':
      return 'Финансы' // ИСПРАВЛЕНО: короткое название вместо "Финансовая услуга"
    case 'cashback':
      return 'Кэшбэк'
    default:
      return 'Общее'
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

    const primaryCategoryId = promo.category?.id ?? promo.categories?.[0]?.id

    const relatedPromos = await getRelatedPromocodes(
      promoId,
      promo.store?.id,
      primaryCategoryId,
      6
    )

    const storeName = promo.store?.name || 'Неизвестный магазин'
    const categoryName = promo.category?.name || 'Общее'

    // Определяем ссылки согласно Django моделям
    const promoAffiliateUrl = getPromoAffiliateUrl(promo)
    const storeUrl = getStoreUrl(promo.store)

    // Адаптивные хлебные крошки
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

    return (
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
                
                {/* HERO КАРТОЧКА */}
                <div className={`${GLASS_PANEL} relative overflow-hidden`}>
                  
                  {/* Фоновый эффект */}
                  <div className={CARD_HOVER_EFFECT}></div>
                  
                  <div className="relative z-10">
                    {/* Хедер */}
                    <div className="flex flex-col gap-6 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 ease-out">
                            {promo.store?.logo ? (
                              <Image
                                src={promo.store.logo}
                                alt={storeName}
                                width={80}
                                height={80}
                                className="rounded-xl object-cover w-full h-full transition-all duration-300 ease-out"
                                sizes="(max-width: 1024px) 64px, 80px"
                              />
                            ) : (
                              <Store className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-blue-300 transition-colors duration-300 ease-out">
                              {promo.title}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300 ease-out">
                              <span className="truncate">{storeName}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate">{categoryName}</span>
                            </div>
                          </div>
                        </div>

                        {/* ✅ ИСПРАВЛЕНО: Дата окончания - expires_at вместо valid_until */}
                        {promo.expires_at && (
                          <div className="flex items-center gap-1.5 px-3 py-2 glass-card border-white/20 text-white/90 text-xs font-medium flex-shrink-0 transition-all duration-300 ease-out hover:bg-white/10">
                            <Clock className="w-4 h-4" />
                            <span>до {new Date(promo.expires_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* БЕЙДЖИ - унифицированные */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      {promo.is_recommended && (
                        <div className={BADGE_RECOMMENDED}>
                          <Star className="w-4 h-4 fill-current" />
                          <span className="hidden sm:inline">BoltPromo рекомендует</span>
                          <span className="sm:hidden">Рекомендуем</span>
                        </div>
                      )}
                      
                      {promo.is_hot && (
                        <div className={BADGE_HOT}>
                          <Flame className="w-4 h-4" />
                          <span>Горячий</span>
                        </div>
                      )}
                    </div>

                    {/* СКИДКА */}
                    {promo.discount_text && (
                      <div className="inline-block px-4 py-3 glass-card border-white/30 text-white font-bold text-xl mb-6 transition-all duration-300 ease-out hover:scale-105 hover:bg-white/10">
                        <span>{promo.discount_text}</span>
                      </div>
                    )}

                    {/* ОПИСАНИЕ */}
                    {promo.description && (
                      <p className="text-gray-300 text-base lg:text-lg leading-relaxed mb-8 group-hover:text-gray-200 transition-colors duration-300 ease-out">
                        {promo.description}
                      </p>
                    )}

                    {/* ДЕЙСТВИЯ */}
                    <PromoActions
                      promoId={promo.id}
                      storeId={promo.store?.id}
                      offerType={promo.offer_type || 'coupon'}
                      code={promo.code}
                      promoAffiliateUrl={promoAffiliateUrl}
                      storeUrl={storeUrl}
                      title={promo.title}
                    />

                    {/* СТАТИСТИКА */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-6 border-t border-white/10">
                      <span className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors duration-300 ease-out">
                        Использовали: {promo.views_count || 0}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className={BADGE_BASE}>
                          {getOfferTypeLabel(promo.offer_type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ПОДРОБНАЯ ИНФОРМАЦИЯ */}
                {(promo.long_description || promo.steps || promo.fine_print || promo.disclaimer) && (
                  <div className={GLASS_PANEL}>
                    <h2 className={SECTION_HEADING}>
                      Подробная информация
                    </h2>

                    <div className={CONTENT_SPACING}>
                      {/* Подробное описание */}
                      {promo.long_description && (
                        <div className={INFO_BLOCK_ITEM}>
                          <h3 className={INFO_BLOCK_HEADER}>
                            <div className={`${INFO_BLOCK_ICON_WRAPPER} bg-blue-500/20 border border-blue-500/30`}>
                              <Info className="w-5 h-5 text-blue-400" />
                            </div>
                            Подробное описание
                          </h3>
                          <div className={INFO_BLOCK_CONTENT}>
                            {promo.long_description}
                          </div>
                        </div>
                      )}

                      {/* Шаги активации */}
                      {promo.steps && (
                        <div className={INFO_BLOCK_ITEM}>
                          <h3 className={INFO_BLOCK_HEADER}>
                            <div className={`${INFO_BLOCK_ICON_WRAPPER} bg-green-500/20 border border-green-500/30`}>
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            Шаги активации
                          </h3>
                          <div className={`${INFO_BLOCK_CONTENT} whitespace-pre-line`}>
                            {promo.steps}
                          </div>
                        </div>
                      )}

                      {/* Условия использования */}
                      {promo.fine_print && (
                        <div className={INFO_BLOCK_ITEM}>
                          <h3 className={INFO_BLOCK_HEADER}>
                            <div className={`${INFO_BLOCK_ICON_WRAPPER} bg-amber-500/20 border border-amber-500/30`}>
                              <AlertCircle className="w-5 h-5 text-amber-400" />
                            </div>
                            Условия использования
                          </h3>
                          <div className={INFO_BLOCK_CONTENT}>
                            {promo.fine_print}
                          </div>
                        </div>
                      )}

                      {/* Дисклеймер */}
                      {promo.disclaimer && (
                        <div className="p-6 glass-card border-white/20 hover:bg-white/10 transition-all duration-300 ease-out">
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

              {/* САЙДБАР */}
              <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                
                {/* О МАГАЗИНЕ */}
                <div className={SIDEBAR_PANEL}>
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
                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300 ease-out">{storeName}</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 ease-out text-base">{categoryName}</p>
                    </div>

                    <a
                      href={safeExternalUrl(storeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 hover:text-blue-200 font-medium text-base transition-all duration-300 hover:scale-105 group"
                    >
                      <span>Перейти в магазин</span>
                      <ExternalLink className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>

                {/* СТАТИСТИКА */}
                <div className={SIDEBAR_PANEL}>
                  <h3 className="text-lg font-bold text-white mb-6">
                    Статистика
                  </h3>
                  
                  <div className={SECTION_SPACING}>
                    <div className={STATS_ITEM}>
                      <span className="text-gray-400 text-sm">Использовали</span>
                      <span className="text-white font-bold text-lg">{promo.views_count || 0}</span>
                    </div>
                    
                    <div className={STATS_ITEM}>
                      <span className="text-gray-400 text-sm">Тип предложения</span>
                      <span className={BADGE_BASE}>
                        {getOfferTypeLabel(promo.offer_type)}
                      </span>
                    </div>

                    {/* ✅ ИСПРАВЛЕНО: expires_at вместо valid_until в статистике */}
                    {promo.expires_at && (
                      <div className={STATS_ITEM}>
                        <span className="text-gray-400 text-sm">Действует до</span>
                        <span className="text-white font-medium text-sm">
                          {new Date(promo.expires_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
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
    )
  } catch (error) {
    console.error('Ошибка загрузки промокода:', error)
    notFound()
  }
}
