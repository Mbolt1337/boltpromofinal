'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface AnalyticsProps {
  yandexMetrikaId?: string | null
  gaMeasurementId?: string | null
}

/**
 * Компонент аналитики для Яндекс.Метрики и Google Analytics 4
 * Загружается только после согласия пользователя с Cookie Consent
 */
export default function Analytics({ yandexMetrikaId, gaMeasurementId }: AnalyticsProps) {
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    // Проверяем согласие пользователя из localStorage
    const cookieConsent = localStorage.getItem('cookie-consent')
    if (cookieConsent === 'accepted') {
      setConsentGiven(true)
    }

    // Слушаем событие изменения согласия
    const handleConsentChange = (e: CustomEvent) => {
      if (e.detail === 'accepted') {
        setConsentGiven(true)
      }
    }

    window.addEventListener('cookie-consent-change', handleConsentChange as EventListener)

    return () => {
      window.removeEventListener('cookie-consent-change', handleConsentChange as EventListener)
    }
  }, [])

  // Не загружаем скрипты пока нет согласия
  if (!consentGiven) {
    return null
  }

  return (
    <>
      {/* Яндекс.Метрика */}
      {yandexMetrikaId && (
        <>
          <Script
            id="yandex-metrika"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                ym(${yandexMetrikaId}, "init", {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true,
                  webvisor:${process.env.NODE_ENV === 'production' ? 'true' : 'false'},
                  ecommerce:"dataLayer"
                });
              `
            }}
          />
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${yandexMetrikaId}`}
                style={{ position: 'absolute', left: '-9999px' }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {/* Google Analytics 4 */}
      {gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `
            }}
          />
        </>
      )}
    </>
  )
}

/**
 * Хелпер для отправки событий в аналитику
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  // Проверяем согласие
  const cookieConsent = localStorage.getItem('cookie-consent')
  if (cookieConsent !== 'accepted') {
    return
  }

  // Яндекс.Метрика
  if (typeof window !== 'undefined' && (window as any).ym) {
    const metrikaId = document.querySelector('[id^="yandex-metrika"]')?.textContent?.match(/ym\((\d+)/)?.[1]
    if (metrikaId) {
      (window as any).ym(metrikaId, 'reachGoal', eventName, eventParams)
    }
  }

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams)
  }

  // Также отправляем в backend /track
  if (typeof window !== 'undefined') {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/track/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventName,
        ...eventParams
      })
    }).catch(console.error)
  }
}
