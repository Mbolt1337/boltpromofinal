// Базовые типы для фильтров
export interface BaseFilters {
  search?: string
  page?: number
  limit?: number
  sortBy?: string
}

// Фильтры для категорий
export interface CategoryFilters extends BaseFilters {
  sortBy?: 'popular' | 'name-asc' | 'name-desc' | 'promo-count-desc' | 'promo-count-asc' | 'newest' | 'oldest'
  isActive?: boolean
}

// Фильтры для магазинов
export interface StoreFilters extends BaseFilters {
  category?: string
  rating?: number
  hasPromocodes?: boolean
  sortBy?: 'name-asc' | 'name-desc' | 'rating-desc' | 'rating-asc' | 'newest'
}

// Фильтры для промокодов
export interface PromoFilters extends BaseFilters {
  category?: string
  store?: string
  isHot?: boolean
  hasCode?: boolean
  expiringIn?: number // дней
  sortBy?: 'newest' | 'popular' | 'expiring' | 'hot' | 'title-asc' | 'title-desc'
}

// ✅ ИСПРАВЛЕНО: Информация о пагинации
export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNext: boolean
  hasPrevious: boolean
}

// ✅ НОВОЕ: Параметры для промокодов с расширенной поддержкой
export interface PromocodesParams {
  search?: string
  category?: string
  store?: string
  is_hot?: boolean
  has_promocode?: boolean
  is_recommended?: boolean
  offer_type?: 'coupon' | 'deal' | 'financial' | 'cashback'
  ordering?: string
  page?: number
  limit?: number
  page_size?: number
}

// ✅ НОВОЕ: Параметры для категорий с пагинацией
export interface CategoryPromocodesParams {
  search?: string
  ordering?: string
  page?: number
  limit?: number
  is_hot?: boolean
  is_recommended?: boolean
  store?: string
}

// ✅ НОВОЕ: Ответ API для промокодов категории
export interface CategoryPromocodesResponse {
  count: number
  next?: string
  previous?: string
  results: any[] // будет нормализовано в Promocode[]
  category?: {
    id: number
    name: string
    slug: string
    description?: string
    promocodes_count?: number
  }
}

// ✅ ДОБАВЛЕНО: PagedResult интерфейс для пагинированных результатов
export interface PagedResult<T> {
  items: T[]
  pagination: PaginationInfo
  filters: BaseFilters
}

// ИСПРАВЛЕНО: Переименовано SearchResult → FilteredResult чтобы избежать конфликта с SearchResults
export interface FilteredResult<T> {
  items: T[]
  pagination: PaginationInfo
  filters: BaseFilters
}

// Статистика для категорий
export interface CategoryStats {
  totalCategories: number
  totalPromocodes: number
  activeCategories: number
  averagePromocodesPerCategory: number
}

// Статистика для магазинов
export interface StoreStats {
  totalStores: number
  totalPromocodes: number
  averageRating: number
  activeStores: number
  topCategories?: string[]
}

// Статистика для промокодов
export interface PromoStats {
  totalPromocodes: number
  hotPromocodes: number
  expiringPromocodes: number
  topStores: string[]
  topCategories: string[]
}

// Общая статистика сайта
export interface SiteStats {
  categories: CategoryStats
  stores: StoreStats
  promocodes: PromoStats
}

// Опции сортировки
export interface SortOption {
  value: string
  label: string
  description?: string
}

// Стандартные опции сортировки для разных сущностей
export const CATEGORY_SORT_OPTIONS: SortOption[] = [
  { value: 'popular', label: 'По популярности', description: 'Сначала самые популярные' },
  { value: 'name-asc', label: 'По алфавиту А-Я', description: 'Сортировка по названию' },
  { value: 'name-desc', label: 'По алфавиту Я-А', description: 'Обратная сортировка по названию' },
  { value: 'promo-count-desc', label: 'Больше промокодов', description: 'Сначала категории с большим количеством промокодов' },
  { value: 'promo-count-asc', label: 'Меньше промокодов', description: 'Сначала категории с меньшим количеством промокодов' },
  { value: 'newest', label: 'Сначала новые', description: 'Недавно добавленные категории' },
  { value: 'oldest', label: 'Сначала старые', description: 'Давно добавленные категории' }
]

// ✅ ОБНОВЛЕНО: Убрана сортировка "По популярности" из STORE_SORT_OPTIONS
export const STORE_SORT_OPTIONS: SortOption[] = [
  { value: 'name-asc', label: 'По алфавиту А-Я', description: 'Сортировка по названию' },
  { value: 'name-desc', label: 'По алфавиту Я-А', description: 'Обратная сортировка по названию' },
  { value: 'rating-desc', label: 'Высокий рейтинг', description: 'Сначала магазины с высоким рейтингом' },
  { value: 'rating-asc', label: 'Низкий рейтинг', description: 'Сначала магазины с низким рейтингом' },
  { value: 'newest', label: 'Сначала новые', description: 'Недавно добавленные магазины' }
]

export const PROMO_SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Сначала новые', description: 'Недавно добавленные промокоды' },
  { value: 'popular', label: 'По популярности', description: 'Часто используемые промокоды' },
  { value: 'expiring', label: 'Скоро истекают', description: 'Сначала промокоды с истекающим сроком' },
  { value: 'hot', label: 'Горячие предложения', description: 'Специальные и выгодные предложения' },
  { value: 'title-asc', label: 'По алфавиту А-Я' },
  { value: 'title-desc', label: 'По алфавиту Я-А' }
]

// Типы для breadcrumbs
export interface BreadcrumbItem {
  label: string
  href: string
  isActive?: boolean
}

// Типы для фильтров по времени
export interface TimeFilter {
  value: string
  label: string
  days?: number
}

export const TIME_FILTERS: TimeFilter[] = [
  { value: 'all', label: 'Все время' },
  { value: 'today', label: 'Сегодня', days: 1 },
  { value: 'week', label: 'Неделя', days: 7 },
  { value: 'month', label: 'Месяц', days: 30 },
  { value: 'expiring', label: 'Скоро истекают', days: 7 }
]

// Типы для поиска (отдельно от фильтрации)
export interface SearchSuggestion {
  type: 'category' | 'store' | 'promo' | 'query'
  value: string
  label: string
  count?: number
}

export interface SearchHistory {
  query: string
  timestamp: number
  results: number
}

// ИСПРАВЛЕНО: Оставляем SearchResults для поиска (не путать с FilteredResult)
export interface SearchResults {
  promocodes: SearchSuggestion[]
  stores: SearchSuggestion[]
  categories: SearchSuggestion[]
  total: number
}

// Типы для API ответов
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface ApiError {
  status: number
  message: string
  details?: any
}

// Утилитарные типы
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// ✅ ИСПРАВЛЕНО: Переименовано Required → WithRequired чтобы избежать циклической ссылки
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>