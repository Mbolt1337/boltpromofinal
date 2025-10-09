'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { safeExternalUrl } from '@/lib/utils'
import { trackPromoCopy, trackPromoOpen, trackFinanceOpen, trackDealOpen } from '@/lib/analytics'
import { showToast } from '@/lib/toast'

interface PromoActionsProps {
  promoId: number
  storeId?: number
  offerType: string
  code?: string
  promoAffiliateUrl: string
  storeUrl: string
  title: string
  storeName?: string
}

// ===== PRESET-КЛАССЫ ДЛЯ КОНСИСТЕНТНОСТИ =====

// Все основные кнопки используют унифицированный emerald-600 (как в PromoCard)
const BUTTON_PROMOCODE = "group flex items-center justify-center gap-3 w-full px-8 py-4 rounded-lg border border-emerald-500/30 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"

// Кнопка в состоянии "скопировано/открываем"
const BUTTON_LOADING = "group flex items-center justify-center gap-3 w-full px-8 py-4 rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-200 font-semibold text-lg transition-all duration-300 ease-out"

// Основная кнопка действия для других типов (deal, financial, cashback) - унифицированная emerald-600
const PRIMARY_ACTION_BUTTON = "group flex items-center justify-center gap-3 w-full px-8 py-4 rounded-lg border border-emerald-500/30 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-all duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"

// Вторичная кнопка (переход в магазин)
const SECONDARY_ACTION_BUTTON = "group flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg border border-white/15 bg-transparent hover:bg-white/10 text-white/90 font-medium text-base transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none"

export default function PromoActions({
  promoId,
  storeId,
  offerType,
  code,
  promoAffiliateUrl,
  storeUrl,
  title,
  storeName
}: PromoActionsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle')

  // Функция копирования кода в буфер обмена
  const copyToClipboard = async (codeText: string) => {
    try {
      setCopyStatus('copying')
      await navigator.clipboard.writeText(codeText)
      setCopyStatus('copied')

      // Показываем унифицированный toast
      showToast.promoCopied(codeText, storeName || 'магазин')

      // Трекаем копирование промокода
      trackPromoCopy(promoId)

      // Открываем партнёрскую ссылку через 1.5 сек
      setTimeout(() => {
        if (promoAffiliateUrl) {
          const link = document.createElement('a')
          link.href = promoAffiliateUrl
          link.target = '_blank'
          link.rel = 'nofollow sponsored noopener noreferrer'
          link.click()
        }
      }, 1500)

      // Возвращаем в исходное состояние через 2 секунды
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      console.error('Ошибка копирования:', error)

      // Fallback для старых браузеров
      try {
        const textArea = document.createElement('textarea')
        textArea.value = codeText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)

        setCopyStatus('copied')

        // Показываем унифицированный toast
        showToast.promoCopied(codeText, storeName || 'магазин')

        trackPromoCopy(promoId)

        // Открываем партнёрскую ссылку через 1.5 сек (fallback)
        setTimeout(() => {
          if (promoAffiliateUrl) {
            const link = document.createElement('a')
            link.href = promoAffiliateUrl
            link.target = '_blank'
            link.rel = 'nofollow sponsored noopener noreferrer'
            link.click()
          }
        }, 1500)

        setTimeout(() => setCopyStatus('idle'), 2000)
      } catch (fallbackError) {
        console.error('Ошибка fallback копирования:', fallbackError)
        showToast.error('Не удалось скопировать промокод')
        setCopyStatus('idle')
      }
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
      {/* ДЕЙСТВИЯ */}
      <div className="space-y-3">
        {/* Основная кнопка - копирование или ссылка */}
        {actions.primaryAction === 'copy' ? (
          <button
            onClick={() => copyToClipboard(code!)}
            disabled={copyStatus === 'copying'}
            className={copyStatus === 'copied' || copyStatus === 'copying' ? BUTTON_LOADING : BUTTON_PROMOCODE}
          >
            <span className="truncate">
              {copyStatus === 'copied' ? 'Открываем...' : actions.primaryText}
            </span>
            {actions.primaryIcon}
          </button>
        ) : (
          <Link
            href={actions.primaryUrl!}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
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
          rel="nofollow sponsored noopener noreferrer"
          className={SECONDARY_ACTION_BUTTON}
        >
          <span className="truncate">{actions.secondaryText}</span>
          <ExternalLink className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </a>
      </div>
    </>
  )
}