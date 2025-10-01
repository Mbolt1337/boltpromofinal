'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Copy, ExternalLink, Store, Calendar, Flame, Check, Timer, Clock, AlertTriangle, Star, CreditCard, Gift, Percent, Info } from 'lucide-react'
import { type Promocode, incrementPromoView } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

interface HotPromoCardProps {
  promo: Promocode
  isHot?: boolean
  isExpiring?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalHours: number
}

type UrgencyLevel = 'critical' | 'urgent' | 'soon' | 'normal'

// ===== PRESET-КЛАССЫ ДЛЯ КОНСИСТЕНТНОСТИ =====

// Унифицированные бейджи (как в основных компонентах)
const BADGE_RECOMMENDED = "flex items-center gap-1.5 px-3 py-1.5 glass-card border-blue-500/30 text-blue-300 text-xs font-semibold transition-all duration-300 ease-out hover:scale-105 hover:bg-blue-500/10"
const BADGE_HOT = "flex items-center gap-1.5 px-3 py-1.5 glass-card border-orange-500/30 text-orange-300 text-xs font-semibold transition-all duration-300 ease-out hover:scale-105 hover:bg-orange-500/10"

// Основные кнопки действий (glass-стиль)
const PRIMARY_ACTION_BUTTON = "flex items-center justify-center gap-2.5 px-5 py-3 glass-card border-white/20 text-white font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-white/10 hover:border-white/30 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full min-h-[44px]"

// Кнопка в состоянии "скопировано"
const COPIED_BUTTON = "flex items-center justify-center gap-2.5 px-5 py-3 glass-card border-green-500/30 bg-green-500/10 text-green-300 font-semibold text-sm transition-all duration-300 ease-out hover:bg-green-500/15 hover:border-green-500/40 w-full min-h-[44px]"

// Кнопка "Подробнее"
const SECONDARY_BUTTON = "flex items-center justify-center gap-2 px-4 py-2.5 glass-card border-white/10 text-white font-medium text-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-white/8 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none w-full min-h-[40px]"

// Блок скидки (glass-стиль)
const DISCOUNT_BLOCK = "inline-flex items-center px-3 py-2 glass-card border-white/30 text-white font-bold text-base mb-4 transition-all duration-300 ease-out hover:scale-105 hover:bg-white/10 w-fit"

// Hover эффект карточки
const CARD_HOVER_EFFECT = "absolute inset-0 opacity-0 transition-opacity duration-300 ease-out pointer-events-none bg-gradient-to-br from-blue-500/3 to-purple-500/3 group-hover:opacity-100"

// Стили уровней срочности (БЕЗ ГРАДИЕНТОВ, только glass)
const URGENCY_STYLES = {
  critical: {
    card: 'ring-2 ring-red-500/40 bg-red-500/5',
    timer: 'glass-card border-red-500/40 text-red-300 bg-red-500/10',
    badge: 'glass-card border-red-500/40 text-red-300 bg-red-500/10',
    icon: 'text-red-400',
    animation: 'animate-pulse'
  },
  urgent: {
    card: 'ring-1 ring-orange-500/30 bg-orange-500/3',
    timer: 'glass-card border-orange-500/40 text-orange-300 bg-orange-500/8',
    badge: 'glass-card border-orange-500/40 text-orange-300 bg-orange-500/8',
    icon: 'text-orange-400',
    animation: ''
  },
  soon: {
    card: 'ring-1 ring-yellow-500/25 bg-yellow-500/3',
    timer: 'glass-card border-yellow-500/40 text-yellow-300 bg-yellow-500/8',
    badge: 'glass-card border-yellow-500/40 text-yellow-300 bg-yellow-500/8',
    icon: 'text-yellow-400',
    animation: ''
  },
  normal: {
    card: '',
    timer: 'glass-card border-white/25 text-white',
    badge: 'glass-card border-white/25 text-white',
    icon: 'text-white',
    animation: ''
  }
} as const

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

export default function HotPromoCard({ promo, isHot = false, isExpiring = false }: HotPromoCardProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('normal')

  // Мемоизированные базовые данные
  const promoData = useMemo(() => ({
    storeName: promo.store?.name || 'Неизвестный магазин',
    categoryName: promo.category?.name || 'Общее',
    storeLogo: promo.store?.logo,
    // ✅ ИСПРАВЛЕНО: Убрал promo.external_link, так как он уже нормализован в action_url в API слое
    actionUrl: promo.action_url || promo.store?.url,
    offerType: promo.offer_type || 'coupon',
    viewsCount: promo.views_count || 0,
    hasCode: promo.has_promocode || Boolean(promo.code),
    isRecommended: promo.is_recommended || false
  }), [promo])

  // Мемоизированные стили
  const offerTypeStyles = useMemo(() => 
    OFFER_TYPE_STYLES[promoData.offerType as keyof typeof OFFER_TYPE_STYLES] || OFFER_TYPE_STYLES.coupon
  , [promoData.offerType])

  const urgencyStyles = useMemo(() => 
    URGENCY_STYLES[urgencyLevel]
  , [urgencyLevel])

  // Вычисление времени до истечения
  const calculateTimeLeft = useCallback((validUntil?: string): TimeLeft | null => {
    if (!validUntil) return null

    try {
      const expiryDate = new Date(validUntil)
      const now = new Date()
      const difference = expiryDate.getTime() - now.getTime()

      if (difference <= 0) return null

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)
      const totalHours = Math.floor(difference / (1000 * 60 * 60))

      return { days, hours, minutes, seconds, totalHours }
    } catch {
      return null
    }
  }, [])

  // Определение уровня срочности
  const getUrgencyLevel = useCallback((timeData: TimeLeft | null): UrgencyLevel => {
    if (!timeData) return 'normal'
    
    const { totalHours } = timeData
    
    if (totalHours <= 6) return 'critical'
    if (totalHours <= 24) return 'urgent'
    if (totalHours <= 168) return 'soon'
    return 'normal'
  }, [])

  // Таймер с оптимизацией
  useEffect(() => {
    if (!isExpiring || !promo.expires_at) return

    const updateTimer = () => {
      const timeData = calculateTimeLeft(promo.expires_at)
      const newUrgencyLevel = getUrgencyLevel(timeData)
      
      setTimeLeft(timeData)
      setUrgencyLevel(newUrgencyLevel)
    }

    updateTimer()
    
    // Разная частота обновления в зависимости от срочности
    const getInterval = () => {
      const timeData = calculateTimeLeft(promo.expires_at)
      if (!timeData) return 60000
      
      if (timeData.totalHours <= 1) return 1000 // Каждую секунду только в последний час
      if (timeData.totalHours <= 24) return 60000 // Каждую минуту в последний день
      return 300000 // Каждые 5 минут для остальных
    }

    const timer = setInterval(updateTimer, getInterval())
    return () => clearInterval(timer)
  }, [isExpiring, promo.expires_at, calculateTimeLeft, getUrgencyLevel])

  // Дебаунсированные обработчики
  const handleCopyCode = useCallback(async () => {
    if (!promo.code || copied || isLoading) return
    
    try {
      setIsLoading(true)
      await navigator.clipboard.writeText(promo.code)
      setCopied(true)
      
      // Отложенный счетчик для производительности
      setTimeout(async () => {
        try {
          await incrementPromoView(promo.id)
        } catch (error) {
          console.error('Ошибка счетчика:', error)
        }
      }, 100)
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Ошибка копирования:', error)
    } finally {
      setIsLoading(false)
    }
  }, [promo.code, promo.id, copied, isLoading])

  const handleExternalClick = useCallback(async () => {
    if (!promoData.actionUrl || isLoading) return
    
    try {
      setIsLoading(true)
      
      // Отложенный счетчик для производительности
      setTimeout(async () => {
        try {
          await incrementPromoView(promo.id)
        } catch (error) {
          console.error('Ошибка счетчика:', error)
        }
      }, 100)
      
      window.open(promoData.actionUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Ошибка открытия ссылки:', error)
    } finally {
      setIsLoading(false)
    }
  }, [promoData.actionUrl, promo.id, isLoading])

  // Мемоизированная дата
  const validUntil = useMemo(() => {
    if (!promo.expires_at) return null
    try {
      return new Date(promo.expires_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      })
    } catch {
      return null
    }
  }, [promo.expires_at])

  // Мемоизированная конфигурация кнопки (БЕЗ ГРАДИЕНТОВ)
  const actionButton = useMemo(() => {
    const baseConfig = {
      disabled: isLoading,
      action: promoData.offerType === 'coupon' ? handleCopyCode : handleExternalClick
    }

    switch (promoData.offerType) {
      case 'coupon':
        return {
          ...baseConfig,
          text: promoData.hasCode && promo.code ? promo.code : 'Получить код',
          icon: copied ? Check : Copy,
          disabled: isLoading || (!promoData.hasCode || !promo.code),
          styles: copied ? COPIED_BUTTON : PRIMARY_ACTION_BUTTON
        }
      default:
        return {
          ...baseConfig,
          text: promoData.offerType === 'deal' ? 'Получить скидку' :
                promoData.offerType === 'financial' ? 'Оформить' :
                promoData.offerType === 'cashback' ? 'Получить кэшбэк' : 'Перейти',
          icon: promoData.offerType === 'deal' ? Percent :
                promoData.offerType === 'financial' ? CreditCard :
                promoData.offerType === 'cashback' ? Gift : ExternalLink,
          disabled: isLoading || !promoData.actionUrl,
          styles: PRIMARY_ACTION_BUTTON
        }
    }
  }, [promoData, promo.code, copied, isLoading, handleCopyCode, handleExternalClick])

  // Мемоизированный статус текст
  const statusText = useMemo(() => {
    if (!timeLeft) return null
    
    switch (urgencyLevel) {
      case 'critical':
        return timeLeft.totalHours < 1 ? 'Критично' : 'Последние часы'
      case 'urgent':
        return 'Срочно'
      case 'soon':
        return 'Скоро истекает'
      default:
        return null
    }
  }, [timeLeft, urgencyLevel])

  // Мемоизированный рендер таймера
  const timerComponent = useMemo(() => {
    if (!timeLeft || !isExpiring) return null

    return (
      <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-4 font-mono transition-all duration-300 ease-out hover:scale-105 ${urgencyStyles.timer} ${urgencyStyles.animation}`}>
        <Timer className={`w-4 h-4 ${urgencyStyles.icon} transition-transform duration-300 ease-out`} />
        <div className="text-sm font-bold">
          {timeLeft.days > 0 && `${timeLeft.days}д `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        {statusText && (
          <span className="text-xs ml-2 font-medium">
            {statusText}
          </span>
        )}
      </div>
    )
  }, [timeLeft, isExpiring, urgencyStyles, statusText])

  // Мемоизированные классы карточки
  const cardClasses = useMemo(() => {
    let baseClasses = "glass-card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer relative overflow-hidden flex flex-col h-full focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none group"
    
    if (urgencyStyles.card) {
      baseClasses += ` ${urgencyStyles.card}`
    }
    
    return baseClasses
  }, [urgencyStyles.card])

  const OfferIcon = offerTypeStyles.icon
  const ActionIcon = actionButton.icon

  return (
    <div className={cardClasses} tabIndex={0}>
      <div className="p-5 flex flex-col h-full relative z-10">
        
        {/* ХЕДЕР КАРТОЧКИ */}
        <div className="flex items-start justify-between mb-4 min-h-[3rem]">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-white/8">
              {promoData.storeLogo ? (
                <Image
                  src={promoData.storeLogo}
                  alt={promoData.storeName}
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

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-base leading-tight truncate transition-colors duration-300 ease-out group-hover:text-blue-300">
                {promoData.storeName}
              </h3>
              <p className="text-gray-400 text-sm truncate transition-colors duration-300 ease-out group-hover:text-gray-300">
                {promoData.categoryName}
              </p>
            </div>
          </div>

          {validUntil && !isExpiring && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 glass-card border-white/10 text-gray-400 text-xs ml-3 flex-shrink-0 transition-all duration-300 ease-out hover:scale-105 hover:bg-white/8 hover:border-white/15">
              <Calendar className="w-3.5 h-3.5 transition-transform duration-300 ease-out" />
              <span className="font-medium">до {validUntil}</span>
            </div>
          )}
        </div>

        {/* БЕЙДЖИ СТАТУСА - УНИФИЦИРОВАННЫЕ */}
        {(promoData.isRecommended || isHot || (isExpiring && urgencyLevel !== 'normal')) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {promoData.isRecommended && (
              <div className={BADGE_RECOMMENDED}>
                <Star className="w-3.5 h-3.5 fill-current transition-transform duration-300 ease-out" />
                <span>BoltPromo рекомендует</span>
              </div>
            )}

            {isHot && (
              <div className={BADGE_HOT}>
                <Flame className="w-4 h-4 transition-transform duration-300 ease-out" />
                <span>Горячий</span>
              </div>
            )}

            {isExpiring && urgencyLevel !== 'normal' && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 ease-out hover:scale-105 ${urgencyStyles.badge}`}>
                {urgencyLevel === 'critical' && <AlertTriangle className="w-3.5 h-3.5 transition-transform duration-300 ease-out" />}
                {urgencyLevel !== 'critical' && <Clock className="w-3.5 h-3.5 transition-transform duration-300 ease-out" />}
                <span>{statusText}</span>
              </div>
            )}
          </div>
        )}

        {/* ТАЙМЕР */}
        {timerComponent}

        {/* ЗАГОЛОВОК */}
        <h4 className="text-lg font-bold text-white mb-3 leading-tight line-clamp-2 min-h-[3.5rem] flex items-start transition-colors duration-300 ease-out group-hover:text-gray-100">
          {promo.title}
        </h4>

        {/* ОПИСАНИЕ */}
        {promo.description && (
          <p className="text-gray-300 mb-3 leading-relaxed line-clamp-2 text-sm transition-colors duration-300 ease-out group-hover:text-gray-200">
            {promo.description}
          </p>
        )}

        {/* СКИДКА - GLASS СТИЛЬ */}
        {promo.discount_text && (
          <div className={DISCOUNT_BLOCK}>
            <span>{promo.discount_text}</span>
          </div>
        )}

        <div className="flex-1"></div>

        {/* ДЕЙСТВИЯ - УНИФИЦИРОВАННЫЕ КНОПКИ */}
        <div className="space-y-3">
          <button
            onClick={actionButton.action}
            disabled={actionButton.disabled}
            className={actionButton.styles}
          >
            <ActionIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-300 ease-out" />
            <span className="truncate">
              {copied && promoData.offerType === 'coupon' ? 'Скопирован' : actionButton.text}
            </span>
            {promoData.offerType !== 'coupon' && <ExternalLink className="w-4 h-4 flex-shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1" />}
          </button>

          <Link
            href={`/promo/${promo.id}`}
            className={SECONDARY_BUTTON}
          >
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Подробнее</span>
          </Link>

          {promoData.offerType === 'financial' && promo.disclaimer && (
            <div className="text-xs text-gray-500 leading-relaxed p-2.5 glass-card border-white/10 line-clamp-2">
              {promo.disclaimer}
            </div>
          )}
        </div>

        {/* СТАТИСТИКА */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
          <span className="text-gray-500 text-xs font-medium transition-colors duration-300 ease-out group-hover:text-gray-400">
            Использовали: {promoData.viewsCount}
          </span>

          <div className="flex items-center gap-2">
            {promoData.offerType === 'cashback' && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded transition-all duration-300 ease-out hover:bg-amber-500/15 hover:scale-105">
                Кэшбэк
              </span>
            )}
            
            <span className={`text-xs font-medium px-2 py-0.5 rounded transition-all duration-300 ease-out hover:scale-105 ${offerTypeStyles.color} ${offerTypeStyles.bgColor} border ${offerTypeStyles.borderColor}`}>
              {offerTypeStyles.label}
            </span>
          </div>
        </div>
      </div>

      {/* Hover эффект */}
      <div className={CARD_HOVER_EFFECT}></div>
    </div>
  )
}