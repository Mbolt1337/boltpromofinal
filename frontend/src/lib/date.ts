import { formatDistanceToNow, format, isValid, parseISO, differenceInDays, differenceInHours } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Форматирует дату в относительное время ("2 дня назад")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''

    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: ru
    })
  } catch {
    return ''
  }
}

/**
 * Форматирует дату в читаемый формат ("15 января 2025")
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''

    return format(dateObj, 'd MMMM yyyy', { locale: ru })
  } catch {
    return ''
  }
}

/**
 * Форматирует дату с временем ("15 января 2025, 14:30")
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''

    return format(dateObj, 'd MMMM yyyy, HH:mm', { locale: ru })
  } catch {
    return ''
  }
}

/**
 * Проверяет, истекает ли промокод скоро (в течение 7 дней)
 */
export function isExpiringSoon(expiresAt: string | Date | null | undefined): boolean {
  if (!expiresAt) return false

  try {
    const dateObj = typeof expiresAt === 'string' ? parseISO(expiresAt) : expiresAt
    if (!isValid(dateObj)) return false

    const days = differenceInDays(dateObj, new Date())
    return days >= 0 && days <= 7
  } catch {
    return false
  }
}

/**
 * Проверяет, истек ли промокод
 */
export function isExpired(expiresAt: string | Date | null | undefined): boolean {
  if (!expiresAt) return false

  try {
    const dateObj = typeof expiresAt === 'string' ? parseISO(expiresAt) : expiresAt
    if (!isValid(dateObj)) return false

    return dateObj < new Date()
  } catch {
    return false
  }
}

/**
 * Возвращает уровень срочности промокода
 */
export function getUrgencyLevel(expiresAt: string | Date | null | undefined): 'critical' | 'urgent' | 'soon' | 'normal' {
  if (!expiresAt) return 'normal'

  try {
    const dateObj = typeof expiresAt === 'string' ? parseISO(expiresAt) : expiresAt
    if (!isValid(dateObj)) return 'normal'

    const hours = differenceInHours(dateObj, new Date())

    if (hours < 0) return 'normal' // Истек
    if (hours <= 6) return 'critical'
    if (hours <= 24) return 'urgent'
    if (hours <= 168) return 'soon' // 7 дней
    return 'normal'
  } catch {
    return 'normal'
  }
}

/**
 * Форматирует оставшееся время до истечения
 */
export function formatTimeUntilExpiry(expiresAt: string | Date | null | undefined): string {
  if (!expiresAt) return ''

  try {
    const dateObj = typeof expiresAt === 'string' ? parseISO(expiresAt) : expiresAt
    if (!isValid(dateObj)) return ''

    const now = new Date()
    if (dateObj < now) return 'Истек'

    const hours = differenceInHours(dateObj, now)
    const days = differenceInDays(dateObj, now)

    if (hours < 1) return 'Менее часа'
    if (hours < 24) return `${hours} ч`
    if (days < 7) return `${days} д`

    return formatDistanceToNow(dateObj, { locale: ru })
  } catch {
    return ''
  }
}

/**
 * Возвращает цвет для бейджа в зависимости от срочности
 */
export function getUrgencyColor(urgency: 'critical' | 'urgent' | 'soon' | 'normal'): string {
  switch (urgency) {
    case 'critical':
      return 'bg-red-500/20 text-red-300 border-red-500/30'
    case 'urgent':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    case 'soon':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    default:
      return 'bg-white/10 text-white/70 border-white/20'
  }
}
