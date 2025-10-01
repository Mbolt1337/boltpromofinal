'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { safeExternalUrl } from '@/lib/utils'
import { trackPromoCopy, trackPromoOpen, trackFinanceOpen, trackDealOpen } from '@/lib/analytics'

interface PromoActionsProps {
  promoId: number
  storeId?: number
  offerType: string
  code?: string
  promoAffiliateUrl: string
  storeUrl: string
  title: string
}

// ===== PRESET-КЛАССЫ ДЛЯ КОНСИСТЕНТНОСТИ =====

// Основная кнопка действия (код/активация)
const PRIMARY_ACTION_BUTTON = "group flex items-center justify-center gap-3 w-full px-8 py-4 glass-card border-white/20 text-white font-semibold text-lg transition-all duration-300 ease-out hover:scale-105 hover:bg-white/10 hover:border-white/30 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none disabled:opacity-70 disabled:cursor-not-allowed"

// Вторичная кнопка (переход в магазин)
const SECONDARY_ACTION_BUTTON = "group flex items-center justify-center gap-2 w-full px-6 py-3 glass-card border-white/15 text-white/80 font-medium text-base transition-all duration-300 ease-out hover:scale-105 hover:bg-white/8 hover:border-white/25 hover:text-white focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none"

// Кнопка в состоянии "скопировано"
const COPIED_BUTTON = "group flex items-center justify-center gap-3 w-full px-8 py-4 glass-card border-green-500/30 bg-green-500/10 text-green-300 font-semibold text-lg transition-all duration-300 ease-out hover:bg-green-500/15 hover:border-green-500/40"

// Toast уведомление
const TOAST_NOTIFICATION = "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300"
const TOAST_CONTENT = "glass-card border-green-500/30 bg-green-500/10 px-6 py-4 flex items-center gap-3 shadow-2xl min-w-[280px]"

export default function PromoActions({
  promoId,
  storeId,
  offerType,
  code,
  promoAffiliateUrl,
  storeUrl,
  title
}: PromoActionsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle')

  // Функция копирования кода в буфер обмена
  const copyToClipboard = async (codeText: string) => {
    try {
      setCopyStatus('copying')
      await navigator.clipboard.writeText(codeText)
      setCopyStatus('copied')

      // Трекаем копирование промокода
      trackPromoCopy(promoId)

      // Возвращаем в исходное состояние через 2 секунды
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      console.error('Ошибка копирования:', error)
      setCopyStatus('idle')

      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = codeText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      setCopyStatus('copied')
      trackPromoCopy(promoId)
      setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }

  // Функция трекинга клика по ссылке
  const handleLinkClick = (linkType: 'promo' | 'finance' | 'deal') => {
    switch (linkType) {
      case 'promo':
        trackPromoOpen(promoId, storeId)
        break
      case 'finance':
        trackFinanceOpen(promoId, storeId)
        break
      case 'deal':
        trackDealOpen(promoId, storeId)
        break
    }
  }

  // ЛОГИКА КНОПОК
  const getOfferActions = (offerType: string, code?: string) => {
    switch (offerType) {
      case 'coupon':
        if (code) {
          return {
            primaryAction: 'copy',
            primaryText: `Код: ${code}`,
            primaryIcon: copyStatus === 'copied' ? 
              <Check className="w-5 h-5 text-green-400 transition-transform duration-300 ease-out" /> :
              <Copy className="w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-110" />,
            secondaryText: 'Перейти в магазин',
            secondaryUrl: storeUrl
          }
        } else {
          return {
            primaryAction: 'link',
            primaryText: 'Получить код',
            primaryIcon: <ExternalLink className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />,
            primaryUrl: promoAffiliateUrl,
            secondaryText: 'Перейти в магазин',
            secondaryUrl: storeUrl
          }
        }
      
      case 'deal':
        return {
          primaryAction: 'link',
          primaryText: 'Перейти к предложению',
          primaryIcon: <ExternalLink className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />,
          primaryUrl: promoAffiliateUrl,
          secondaryText: 'Перейти в магазин',
          secondaryUrl: storeUrl
        }
      
      case 'financial':
        return {
          primaryAction: 'link',
          primaryText: title.includes('Карта') ? 'Оформить карту' : 'Подробнее',
          primaryIcon: <ExternalLink className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />,
          primaryUrl: promoAffiliateUrl,
          secondaryText: 'Перейти в магазин',
          secondaryUrl: storeUrl
        }
      
      case 'cashback':
        return {
          primaryAction: 'link',
          primaryText: 'Активировать кэшбэк',
          primaryIcon: <ExternalLink className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />,
          primaryUrl: promoAffiliateUrl,
          secondaryText: 'Перейти в магазин',
          secondaryUrl: storeUrl
        }
      
      default:
        return {
          primaryAction: 'link',
          primaryText: 'Перейти к предложению',
          primaryIcon: <ExternalLink className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />,
          primaryUrl: promoAffiliateUrl,
          secondaryText: 'Перейти в магазин',
          secondaryUrl: storeUrl
        }
    }
  }

  const actions = getOfferActions(offerType, code)

  return (
    <>
      {/* Toast уведомление о копировании */}
      {copyStatus === 'copied' && (
        <div className={TOAST_NOTIFICATION}>
          <div className={TOAST_CONTENT}>
            <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-300" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-base">Промокод скопирован!</p>
              <p className="text-green-100 text-sm opacity-90">Вставьте его при оформлении заказа</p>
            </div>
          </div>
        </div>
      )}

      {/* ДЕЙСТВИЯ */}
      <div className="space-y-3">
        {/* Основная кнопка - копирование или ссылка */}
        {actions.primaryAction === 'copy' ? (
          <button
            onClick={() => copyToClipboard(code!)}
            disabled={copyStatus === 'copying'}
            className={copyStatus === 'copied' ? COPIED_BUTTON : PRIMARY_ACTION_BUTTON}
          >
            <span className="truncate">
              {copyStatus === 'copied' ? 'Скопировано!' : actions.primaryText}
            </span>
            {actions.primaryIcon}
          </button>
        ) : (
          <Link
            href={actions.primaryUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className={PRIMARY_ACTION_BUTTON}
            onClick={() => {
              if (offerType === 'financial') {
                handleLinkClick('finance')
              } else if (offerType === 'deal') {
                handleLinkClick('deal')
              } else {
                handleLinkClick('promo')
              }
            }}
          >
            <span className="truncate">{actions.primaryText}</span>
            {actions.primaryIcon}
          </Link>
        )}

        {/* Дополнительная кнопка "Перейти в магазин" */}
        <a
          href={safeExternalUrl(actions.secondaryUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className={SECONDARY_ACTION_BUTTON}
        >
          <span className="truncate">{actions.secondaryText}</span>
          <ExternalLink className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </a>
      </div>
    </>
  )
}