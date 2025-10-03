/**
 * Analytics tracking для BoltPromo
 * Батч-отправка событий на /api/v1/track/
 */

interface TrackEvent {
  event_type: 'promo_view' | 'promo_copy' | 'promo_open' | 'finance_open' | 'deal_open' | 'showcase_view' | 'showcase_open';
  promo_id?: number;
  store_id?: number;
  showcase_id?: number;
  session_id?: string;
  ref?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

class Analytics {
  private queue: TrackEvent[] = [];
  private sessionId: string;
  private apiUrl = '/api/v1/track/';
  private batchSize = 10;
  private flushInterval = 5000; // 5 секунд

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startAutoFlush();
  }

  /**
   * Получить или создать session_id из localStorage
   */
  private getOrCreateSessionId(): string {
    // Проверка для SSR - localStorage доступен только в браузере
    if (typeof window === 'undefined') {
      return `ssr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    const key = 'boltpromo_session_id';
    let sessionId = localStorage.getItem(key);

    if (!sessionId) {
      sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  /**
   * Получить UTM параметры из URL
   */
  private getUTMParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    };
  }

  /**
   * Добавить событие в очередь
   */
  track(event: Omit<TrackEvent, 'session_id'>) {
    const utm = this.getUTMParams();
    const ref = typeof window !== 'undefined' ? document.referrer : '';

    this.queue.push({
      ...event,
      session_id: this.sessionId,
      ref: ref || undefined,
      ...utm,
    });

    // Если накопилось достаточно событий — отправляем сразу
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Отправить накопленные события на сервер
   */
  async flush() {
    if (this.queue.length === 0) return;
    if (typeof window === 'undefined') return; // SSR guard

    const events = [...this.queue];
    this.queue = [];

    try {
      // Используем sendBeacon если доступен (не блокирует UX)
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ events })], {
          type: 'application/json',
        });
        navigator.sendBeacon(this.apiUrl, blob);
      } else {
        // Fallback на fetch
        await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events }),
          // Не ждём ответа (fire-and-forget)
          keepalive: true,
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // В случае ошибки можем вернуть события обратно в очередь
      // this.queue.unshift(...events);
    }
  }

  /**
   * Автоматическая отправка событий каждые N секунд
   */
  private startAutoFlush() {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Отправляем события при выходе со страницы
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // И при скрытии вкладки
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });
  }
}

// Singleton
const analytics = new Analytics();

export default analytics;

/**
 * Утилиты для быстрого трекинга
 */
export const trackPromoView = (promo_id: number) => {
  analytics.track({ event_type: 'promo_view', promo_id });
};

export const trackPromoCopy = (promo_id: number) => {
  analytics.track({ event_type: 'promo_copy', promo_id });
};

export const trackPromoOpen = (promo_id: number, store_id?: number) => {
  analytics.track({ event_type: 'promo_open', promo_id, store_id });
};

export const trackFinanceOpen = (promo_id: number, store_id?: number) => {
  analytics.track({ event_type: 'finance_open', promo_id, store_id });
};

export const trackDealOpen = (promo_id: number, store_id?: number) => {
  analytics.track({ event_type: 'deal_open', promo_id, store_id });
};

export const trackShowcaseView = (showcase_id: number) => {
  analytics.track({ event_type: 'showcase_view', showcase_id });
};

export const trackShowcaseOpen = (showcase_id: number) => {
  analytics.track({ event_type: 'showcase_open', showcase_id });
};
