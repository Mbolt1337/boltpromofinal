'use client'

import { useState, useMemo, useCallback } from 'react'
import { Copy, ExternalLink, Store, Calendar, Flame, Check, Star, CreditCard, Gift, Percent, Info } from 'lucide-react'
import { type Promocode, incrementPromoView } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import Toast from './Toast'
import CountdownTimer from './CountdownTimer'

interface PromoCardProps {
  promo: Promocode
}

// ===== STRICT GEOMETRY + CALM COLORED STYLES =====

// Унифицированные бейджи - строгая геометрия
const BADGE_RECOMMENDED = "flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-200 text-xs font-semibold transition-all duration-300 ease-out hover:bg-blue-500/15"

// Горячий бейдж - строгая геометрия
const BADGE_HOT = "flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-200 text-xs font-semibold transition-all duration-300 ease-out hover:bg-orange-500/15"

// Основные кнопки по типам офферов - спокойные цвета
const BUTTON_PROMOCODE = "flex items-center justify-center gap-2.5 px-5 rounded-lg border border-emerald-500/30 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed w-full h-11"

const BUTTON_FINANCIAL = "flex items-center justify-center gap-2.5 px-5 rounded-lg border border-indigo-500/30 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed w-full h-11"

const BUTTON_DEAL = "flex items-center justify-center gap-2.5 px-5 rounded-lg border border-amber-500/30 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed w-full h-11"

// Кнопка в состоянии "скопировано/открываем"
const BUTTON_LOADING = "flex items-center justify-center gap-2.5 px-5 rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-200 font-semibold text-sm transition-all duration-300 ease-out w-full h-11"

// Вторичная кнопка "Подробнее"
const SECONDARY_BUTTON = "flex items-center justify-center gap-2 px-4 rounded-lg border border-white/15 bg-transparent hover:bg-white/10 text-white/90 font-medium text-sm transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none w-full h-11"

// Блок скидки - строгая геометрия
const DISCOUNT_BLOCK = "inline-flex items-center px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white font-semibold text-base mb-4 transition-all duration-300 ease-out hover:bg-white/10 w-fit"

// Hover эффект карточки - тонкий градиент
const CARD_HOVER_EFFECT = "absolute inset-0 opacity-0 transition-opacity duration-300 ease-out pointer-events-none bg-gradient-to-br from-blue-500/3 to-purple-500/3 rounded-2xl group-hover:opacity-100"

// Константы стилей для типов офферов
const OFFER_TYPE_STYLES = {
  coupon: {
    icon: Copy,
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/25',
    label: 'Промокод'
  },
  deal: {
    icon: Percent,
    color: 'text-green-300',
    bgColor: 'bg-green-500/15',
    borderColor: 'border-green-500/25',
    label: 'Скидка'
  },
  financial: {
    icon: CreditCard,
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/25',
    label: 'Финансы'
  },
  cashback: {
    icon: Gift,
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/25',
    label: 'Кэшбэк'
  }
} as const

export default function PromoCard({ promo }: PromoCardProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [localViewsCount, setLocalViewsCount] = useState(promo.views_count || 0)

  // Мемоизированная модель карточки - ВСЕ деривативные данные в одном useMemo
  const cardModel = useMemo(() => {
    // Базовые данные
    const storeName = promo.store?.name || 'Неизвестный магазин'
    const categoryName = promo.category?.name || 'Общее'
    const storeLogo = promo.store?.logo
    
    // URL логика
    const actionUrl = promo.action_url || promo.store?.url
    
    // Определение типа оффера
    const offerType = promo.offer_type || 'coupon'
    const isCoupon = offerType === 'coupon'
    const isFinancial = offerType === 'financial'
    const isCashback = offerType === 'cashback'
    
    // Флаги
    const viewsCount = promo.views_count || 0
    const isHot = promo.is_hot || false
    const hasCode = promo.has_promocode || Boolean(promo.code)
    const isRecommended = promo.is_recommended || false

    // Форматирование даты
    const validUntil = promo.expires_at ? (() => {
      try {
        return new Date(promo.expires_at).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short'
        })
      } catch {
        return null
      }
    })() : null

    // Стили типа оффера
    const offerTypeStyles = OFFER_TYPE_STYLES[offerType as keyof typeof OFFER_TYPE_STYLES] || OFFER_TYPE_STYLES.coupon

    return {
      storeName,
      categoryName,
      storeLogo,
      actionUrl,
      offerType,
      isCoupon,
      isFinancial,
      isCashback,
      viewsCount,
      isHot,
      hasCode,
      isRecommended,
      validUntil,
      offerTypeStyles
    }
  }, [
    promo.store?.name,
    promo.store?.logo, 
    promo.store?.url,
    promo.category?.name,
    promo.action_url,
    promo.offer_type,
    promo.views_count,
    promo.is_hot,
    promo.has_promocode,
    promo.code,
    promo.is_recommended,
    promo.expires_at
  ])

  // Мемоизированная конфигурация кнопки действия
  const actionButtonConfig = useMemo(() => {
    switch (cardModel.offerType) {
      case 'coupon':
        return {
          text: cardModel.hasCode && promo.code ? promo.code : 'Получить код',
          icon: copied ? Check : Copy,
          disabled: isLoading || (!cardModel.hasCode || !promo.code),
          className: copied || isLoading ? BUTTON_LOADING : BUTTON_PROMOCODE
        }
      case 'deal':
        return {
          text: 'Получить скидку',
          icon: Percent,
          disabled: isLoading || !cardModel.actionUrl,
          className: isLoading ? BUTTON_LOADING : BUTTON_DEAL
        }
      case 'financial':
        return {
          text: 'Оформить',
          icon: CreditCard,
          disabled: isLoading || !cardModel.actionUrl,
          className: isLoading ? BUTTON_LOADING : BUTTON_FINANCIAL
        }
      case 'cashback':
        return {
          text: 'Получить кэшбэк',
          icon: Gift,
          disabled: isLoading || !cardModel.actionUrl,
          className: isLoading ? BUTTON_LOADING : BUTTON_DEAL
        }
      default:
        return {
          text: 'Перейти',
          icon: ExternalLink,
          disabled: isLoading || !cardModel.actionUrl,
          className: isLoading ? BUTTON_LOADING : BUTTON_DEAL
        }
    }
  }, [cardModel.offerType, cardModel.hasCode, cardModel.actionUrl, promo.code, copied, isLoading])

  // Улучшенный обработчик для промокодов: copy → toast → open → increment
  const handleCopyCode = useCallback(async () => {
    if (!promo.code || copied || isLoading) return

    try {
      setIsLoading(true)

      // 1. Копируем промокод
      await navigator.clipboard.writeText(promo.code)
      setCopied(true)

      // 2. Показываем toast
      setToastMessage(`Промокод скопирован! Открываем ${cardModel.storeName}...`)
      setShowToast(true)

      // 3. Увеличиваем счётчик локально для мгновенного UI-фидбэка
      setLocalViewsCount(prev => prev + 1)

      // 4. Инкрементируем счётчик на сервере
      incrementPromoView(promo.id).catch(err =>
        console.error('Ошибка инкремента счётчика:', err)
      )

      // 5. Открываем партнёрскую ссылку через 1.5 сек
      setTimeout(() => {
        if (cardModel.actionUrl) {
          const link = document.createElement('a')
          link.href = cardModel.actionUrl
          link.target = '_blank'
          link.rel = 'nofollow sponsored noopener noreferrer'
          link.click()
        }
      }, 1500)

      // 6. Сбрасываем состояние кнопки
      setTimeout(() => {
        setCopied(false)
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Ошибка копирования:', error)
      setToastMessage('Не удалось скопировать промокод')
      setShowToast(true)
      setCopied(false)
      setIsLoading(false)
    }
  }, [promo.code, promo.id, copied, isLoading, cardModel.storeName, cardModel.actionUrl])

  // Обработчик для других типов офферов (deal, financial, cashback)
  const handleExternalClick = useCallback(async () => {
    if (!cardModel.actionUrl || isLoading) return

    try {
      setIsLoading(true)

      // Увеличиваем счётчик локально
      setLocalViewsCount(prev => prev + 1)

      // Инкрементируем счётчик на сервере
      incrementPromoView(promo.id).catch(err =>
        console.error('Ошибка инкремента счётчика:', err)
      )

      // Открываем ссылку с правильными rel атрибутами
      const link = document.createElement('a')
      link.href = cardModel.actionUrl
      link.target = '_blank'
      link.rel = 'nofollow sponsored noopener noreferrer'
      link.click()

      // Показываем состояние "Открываем..."
      setTimeout(() => {
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Ошибка открытия ссылки:', error)
      setIsLoading(false)
    }
  }, [cardModel.actionUrl, promo.id, isLoading])

  // Мемоизированные классы карточки - премиальный dark glassmorphism
  const cardClasses = useMemo(() => {
    const baseClasses = "rounded-2xl border bg-white/5 hover:bg-white/10 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden flex flex-col h-full focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none group backdrop-blur-sm"

    // Для "горячих" офферов - оранжево-красное свечение при hover
    if (cardModel.isHot) {
      return `${baseClasses} border-white/10 hover:border-white/15 hover:ring-1 hover:ring-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/5`
    }

    return `${baseClasses} border-white/10 hover:border-white/15 hover:shadow-2xl`
  }, [cardModel.isHot])

  // Извлекаем иконки из мемоизированных объектов
  const OfferIcon = cardModel.offerTypeStyles.icon
  const ActionIcon = actionButtonConfig.icon

  // Определяем обработчик для кнопки
  const buttonHandler = cardModel.isCoupon ? handleCopyCode : handleExternalClick

  // Определяем aria-label для основной кнопки
  const buttonAriaLabel = useMemo(() => {
    if (cardModel.isCoupon) {
      return `Скопировать промокод и открыть магазин ${cardModel.storeName}`
    }
    if (cardModel.isFinancial) {
      return `Оформить финансовую услугу в ${cardModel.storeName}`
    }
    return `Получить ${cardModel.offerTypeStyles.label.toLowerCase()} в ${cardModel.storeName}`
  }, [cardModel.isCoupon, cardModel.isFinancial, cardModel.storeName, cardModel.offerTypeStyles.label])

  // Определяем текст кнопки с учётом состояния
  const getButtonText = useMemo(() => {
    if (cardModel.isCoupon) {
      if (copied) {
        return 'Скопировано, открываем...'
      }
      if (isLoading) {
        return promo.code || 'Получить код'
      }
      // Для финансов и скидок не показываем код на кнопке
      return promo.code || 'Получить код'
    }

    if (isLoading) {
      return 'Открываем...'
    }

    return actionButtonConfig.text
  }, [cardModel.isCoupon, copied, isLoading, promo.code, actionButtonConfig.text])

  return (
    <>
      <div className={cardClasses} tabIndex={0}>

        {/* КОНТЕЙНЕР С ЕДИНЫМ PADDING (минимум p-5) */}
        <div className="p-5 flex flex-col h-full">
        
        {/* ХЕДЕР КАРТОЧКИ - ФИКСИРОВАННАЯ ВЫСОТА */}
        <div className="flex items-start justify-between mb-4 min-h-[3rem]">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* Логотип магазина */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-white/8">
              {cardModel.storeLogo ? (
                <Image
                  src={cardModel.storeLogo}
                  alt={cardModel.storeName}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover w-full h-full transition-all duration-300 ease-out"
                  sizes="48px"
                  loading="lazy"
                  priority={false}
                />
              ) : (
                <Store className="w-6 h-6 text-gray-400 transition-all duration-300 ease-out group-hover:scale-110" />
              )}
            </div>

            {/* Информация о магазине */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-base leading-tight truncate transition-colors duration-300 ease-out group-hover:text-blue-300">
                {cardModel.storeName}
              </h3>
              <p className="text-gray-400 text-sm truncate transition-colors duration-300 ease-out group-hover:text-gray-300">
                {cardModel.categoryName}
              </p>
            </div>
          </div>

          {/* Дата окончания - УСЛОВНЫЙ РЕНДЕРИНГ */}
          {cardModel.validUntil && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 glass-card border-white/10 text-gray-400 text-xs ml-3 flex-shrink-0 transition-all duration-300 ease-out hover:scale-105 hover:bg-white/8 hover:border-white/15">
              <Calendar className="w-3.5 h-3.5 transition-transform duration-300 ease-out" />
              <span className="font-medium">до {cardModel.validUntil}</span>
            </div>
          )}
        </div>

        {/* БЕЙДЖИ + ТАЙМЕР ДЛЯ "ГОРЯЧИХ" */}
        {(cardModel.isRecommended || cardModel.isHot) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Бейдж "BoltPromo рекомендует" - спокойный синий */}
            {cardModel.isRecommended && (
              <div className={BADGE_RECOMMENDED}>
                <Star className="w-3.5 h-3.5 fill-current transition-transform duration-300 ease-out" />
                <span>BoltPromo рекомендует</span>
              </div>
            )}

            {/* Бейдж "Горячий" - оранжево-красный, чуть заметнее */}
            {cardModel.isHot && (
              <div className={BADGE_HOT}>
                <Flame className="w-3.5 h-3.5 transition-transform duration-300 ease-out" />
                <span>Горячий</span>
              </div>
            )}

            {/* Таймер обратного отсчёта для "горячих" офферов */}
            {cardModel.isHot && promo.expires_at && (
              <CountdownTimer expiresAt={promo.expires_at} className="hidden sm:inline-flex" />
            )}
          </div>
        )}

        {/* ЗАГОЛОВОК - жирный, line-clamp-1 */}
        <h4 className="text-lg font-bold text-white mb-3 leading-tight line-clamp-1 transition-colors duration-300 ease-out group-hover:text-gray-100">
          {promo.title}
        </h4>

        {/* КРАТКОЕ ОПИСАНИЕ - line-clamp-2 */}
        {promo.description && (
          <p className="text-gray-300 mb-3 leading-relaxed line-clamp-2 text-sm transition-colors duration-300 ease-out group-hover:text-gray-200">
            {promo.description}
          </p>
        )}

        {/* АКЦЕНТ СКИДКИ - стеклянная плашка с тонкой обводкой */}
        {promo.discount_text && (
          <div className={DISCOUNT_BLOCK}>
            <span>{promo.discount_text}</span>
          </div>
        )}

        {/* SPACER - АВТОМАТИЧЕСКИЙ */}
        <div className="flex-1"></div>

        {/* ДЕЙСТВИЯ - В НИЗУ КАРТОЧКИ */}
        <div className="space-y-3">
          {/* Основная кнопка действия - цвет зависит от типа оффера */}
          <button
            onClick={buttonHandler}
            disabled={actionButtonConfig.disabled || isLoading}
            className={actionButtonConfig.className}
            aria-label={buttonAriaLabel}
          >
            <ActionIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-300 ease-out" />
            <span className="truncate">
              {getButtonText}
            </span>
            {!cardModel.isCoupon && !isLoading && (
              <ExternalLink className="w-4 h-4 flex-shrink-0 transition-transform duration-300 ease-out" />
            )}
          </button>

          {/* Вторичная кнопка "Подробнее" */}
          <Link
            href={`/promo/${promo.id}`}
            className={SECONDARY_BUTTON}
            aria-label={`Подробнее о предложении ${promo.title}`}
          >
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Подробнее</span>
          </Link>

          {/* Дисклеймер для финансовых услуг */}
          {cardModel.isFinancial && promo.disclaimer && (
            <div className="text-xs text-gray-500 leading-relaxed p-2.5 rounded-lg border border-white/10 bg-white/5 line-clamp-2">
              {promo.disclaimer}
            </div>
          )}
        </div>

        {/* ПОДВАЛ: "Использовали: N" + бейдж типа */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
          {/* Счетчик просмотров - локальный для мгновенного UI-фидбэка */}
          <span className="text-gray-500 text-xs font-medium transition-colors duration-300 ease-out group-hover:text-gray-400">
            Использовали: {localViewsCount}
          </span>

          {/* Информация о типе оффера */}
          <div className="flex items-center gap-2">
            {/* Индикатор кэшбэка */}
            {cardModel.isCashback && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg transition-all duration-300 ease-out hover:bg-amber-500/15 hover:scale-105">
                Кэшбэк
              </span>
            )}

            {/* Тип оффера */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg transition-all duration-300 ease-out hover:scale-105 ${cardModel.offerTypeStyles.color} ${cardModel.offerTypeStyles.bgColor} border ${cardModel.offerTypeStyles.borderColor}`}>
              {cardModel.offerTypeStyles.label}
            </span>
          </div>
        </div>
      </div>

      {/* Hover эффект */}
      <div className={CARD_HOVER_EFFECT}></div>
    </div>

      {/* Toast уведомление */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </>
  )
}