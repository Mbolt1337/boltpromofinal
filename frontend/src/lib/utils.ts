import { type ClassValue, clsx } from 'clsx'
import {
  // Покупки и торговля
  ShoppingBag, 
  ShoppingCart,
  Store,
  CreditCard,
  Banknote,
  DollarSign,
  Wallet,
  PiggyBank,
  Landmark,
  Receipt,
  
  // Технологии
  Smartphone, 
  Laptop,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Headphones,
  Camera,
  
  // Дом и быт
  Home, 
  Sofa,
  Bed,
  Lightbulb,
  Wrench,
  Hammer,
  PaintBucket,
  
  // Транспорт
  Car, 
  Truck,
  Fuel,
  Bike,
  Bus,
  
  // Здоровье и красота
  Heart, 
  Pill,
  Stethoscope,
  Eye,
  Sparkles,
  
  // Развлечения
  Gamepad2, 
  Music,
  Tv,
  Film,
  Headset,
  
  // Образование
  BookOpen, 
  GraduationCap,
  PenTool,
  Calculator,
  
  // Одежда и мода
  Shirt, 
  Crown,
  Watch,
  Gem,
  
  // Еда и напитки
  Utensils, 
  Coffee,
  Pizza,
  Apple,
  Wine,
  ChefHat,
  
  // Путешествия
  Plane,
  MapPin,
  Luggage,
  Compass,
  
  // Подарки и праздники
  Gift,
  PartyPopper,
  Cake,
  
  // Спорт и активность
  Star,
  Trophy,
  Dumbbell,
  
  // Услуги
  Zap,
  Shield,
  Users,
  Building,
  Briefcase,
  
  // Животные и природа
  TreePine,
  Flower,
  Cat,
  Dog,
  
  // Детские товары
  Baby,
  
  // Финансы дополнительно
  TrendingUp,
  BarChart3,
  LineChart,
  
  // Коммуникации
  Phone,
  Mail,
  MessageCircle,
  
  // Безопасность
  Lock,
  Key,
  ShieldCheck,
  
  // Универсальные
  Tag,
  Grid3X3,
  Plus,
  Minus,
  Check,
  X,
  Search,
  Filter
} from 'lucide-react'

// Централизованный словарь безопасных иконок
export const ICONS: Record<string, React.ComponentType<any>> = {
  // Покупки и торговля
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  'store': Store,
  'credit-card': CreditCard,
  'banknote': Banknote,
  'dollar-sign': DollarSign,
  'wallet': Wallet,
  'piggy-bank': PiggyBank,
  'landmark': Landmark,
  'receipt': Receipt,
  
  // Технологии
  'smartphone': Smartphone,
  'laptop': Laptop,
  'monitor': Monitor,
  'cpu': Cpu,
  'hard-drive': HardDrive,
  'wifi': Wifi,
  'battery': Battery,
  'headphones': Headphones,
  'camera': Camera,
  
  // Дом и быт
  'home': Home,
  'sofa': Sofa,
  'bed': Bed,
  'lightbulb': Lightbulb,
  'wrench': Wrench,
  'hammer': Hammer,
  'paint-bucket': PaintBucket,
  
  // Транспорт
  'car': Car,
  'truck': Truck,
  'fuel': Fuel,
  'bike': Bike,
  'bus': Bus,
  
  // Здоровье и красота
  'heart': Heart,
  'pill': Pill,
  'stethoscope': Stethoscope,
  'eye': Eye,
  'sparkles': Sparkles,
  
  // Развлечения
  'gamepad-2': Gamepad2,
  'music': Music,
  'tv': Tv,
  'film': Film,
  'headset': Headset,
  
  // Образование
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'pen-tool': PenTool,
  'calculator': Calculator,
  
  // Одежда и мода
  'shirt': Shirt,
  'crown': Crown,
  'watch': Watch,
  'gem': Gem,
  
  // Еда и напитки
  'utensils': Utensils,
  'coffee': Coffee,
  'pizza': Pizza,
  'apple': Apple,
  'wine': Wine,
  'chef-hat': ChefHat,
  
  // Путешествия
  'plane': Plane,
  'map-pin': MapPin,
  'luggage': Luggage,
  'compass': Compass,
  
  // Подарки и праздники
  'gift': Gift,
  'party-popper': PartyPopper,
  'cake': Cake,
  
  // Спорт и активность
  'star': Star,
  'trophy': Trophy,
  'dumbbell': Dumbbell,
  'ball': Star, // fallback для football
  'sport': Trophy,
  
  // Услуги
  'zap': Zap,
  'shield': Shield,
  'users': Users,
  'building': Building,
  'briefcase': Briefcase,
  
  // Животные и природа
  'tree-pine': TreePine,
  'flower': Flower,
  'cat': Cat,
  'dog': Dog,
  
  // Детские товары
  'baby': Baby,
  'toy': Baby, // fallback для Toy
  
  // Финансы дополнительно
  'trending-up': TrendingUp,
  'bar-chart-3': BarChart3,
  'line-chart': LineChart,
  
  // Коммуникации
  'phone': Phone,
  'mail': Mail,
  'message-circle': MessageCircle,
  
  // Безопасность
  'lock': Lock,
  'key': Key,
  'shield-check': ShieldCheck,
  
  // Универсальные
  'tag': Tag,
  'grid-3x3': Grid3X3,
  'plus': Plus,
  'minus': Minus,
  'check': Check,
  'x': X,
  'search': Search,
  'filter': Filter,
  
  // Дополнительные fallback для часто используемых
  'mirror': Eye, // fallback для Mirror
  'football': Trophy, // fallback для Football
  'default': Tag
}

// Функция для безопасного получения иконки
export function getCategoryIcon(iconName: string): React.ComponentType<any> {
  if (!iconName) return ICONS.default
  
  // Сначала пробуем точное совпадение
  const exactMatch = ICONS[iconName.toLowerCase()]
  if (exactMatch) return exactMatch
  
  // Потом ищем по категориям (старая логика)
  const slug = iconName.toLowerCase()
  const categoryMap: Record<string, keyof typeof ICONS> = {
    'electronics': 'smartphone',
    'fashion': 'shirt',
    'home': 'home',
    'auto': 'car',
    'health': 'heart',
    'beauty': 'sparkles',
    'games': 'gamepad-2',
    'books': 'book-open',
    'food': 'utensils',
    'travel': 'plane',
    'gifts': 'gift',
    'sports': 'star',
    'shopping': 'shopping-bag',
    'services': 'zap',
    'bank': 'banknote',
    'finance': 'dollar-sign',
    'money': 'wallet',
    'credit': 'credit-card',
    'tech': 'smartphone',
    'computer': 'laptop',
    'phone': 'phone',
    'music': 'music',
    'movie': 'film',
    'education': 'book-open',
    'learn': 'graduation-cap',
    'toy': 'baby',
    'baby': 'baby',
    'pet': 'cat',
    'animal': 'dog',
    'nature': 'tree-pine',
    'security': 'shield',
    'business': 'briefcase'
  }
  
  // Ищем подходящую иконку по ключевым словам
  for (const [key, iconKey] of Object.entries(categoryMap)) {
    if (slug.includes(key) || key.includes(slug)) {
      return ICONS[iconKey]
    }
  }
  
  // По умолчанию возвращаем Tag
  return ICONS.default
}

// Утилита для объединения классов Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Утилиты для работы с датами
export function formatDate(dateString?: string, locale: string = 'ru-RU'): string | null {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return null
  }
}

export function formatRelativeTime(dateString?: string): string | null {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'только что'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} дн. назад`
    
    return formatDate(dateString)
  } catch {
    return null
  }
}

export function getTimeUntilExpiry(validUntil?: string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalHours: number
  expired: boolean
} | null {
  if (!validUntil) return null
  
  try {
    const expiryDate = new Date(validUntil)
    const now = new Date()
    const difference = expiryDate.getTime() - now.getTime()
    
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalHours: 0,
        expired: true
      }
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((difference / 1000 / 60) % 60)
    const seconds = Math.floor((difference / 1000) % 60)
    const totalHours = Math.floor(difference / (1000 * 60 * 60))
    
    return { days, hours, minutes, seconds, totalHours, expired: false }
  } catch {
    return null
  }
}

// Утилиты для работы с числами
export function formatNumber(num: number, locale: string = 'ru-RU'): string {
  return num.toLocaleString(locale)
}

// Другие утилиты...
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// НОВОЕ: Безопасная обработка внешних URL для кнопки "Перейти в магазин"
export function safeExternalUrl(url?: string): string {
  if (!url) return '#'
  
  // Обрезаем пробелы
  const trimmedUrl = url.trim()
  
  if (!trimmedUrl) return '#'
  
  // Блокируем небезопасные схемы
  if (trimmedUrl.toLowerCase().startsWith('javascript:') || 
      trimmedUrl.toLowerCase().startsWith('data:') ||
      trimmedUrl.toLowerCase().startsWith('vbscript:')) {
    return '#'
  }
  
  // Если URL уже содержит протокол, возвращаем как есть
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl
  }
  
  // Добавляем https:// если протокола нет
  return `https://${trimmedUrl}`
}