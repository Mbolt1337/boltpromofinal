import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // КРИТИЧНО: Агрессивная очистка неиспользуемых стилей
  safelist: [
    'animate-shimmer',
    'animate-spin',
    'glass-card',
    // Геометрия - строгая
    'rounded-lg',
    'rounded-md',
    'rounded-2xl',
    // Стеклянные и бордеры
    'bg-white/3',
    'bg-white/5',
    'bg-white/8',
    'bg-white/10',
    'hover:bg-white/10',
    'hover:bg-white/15',
    'border-white/10',
    'border-white/15',
    'border-white/20',
    'border-white/30',
    'hover:border-white/15',
    'hover:border-white/20',
    'backdrop-blur-sm',
    // Акценты и ринги
    'ring-1',
    'hover:ring-1',
    'ring-2',
    'ring-orange-500/20',
    'hover:ring-orange-500/20',
    'ring-white/20',
    'ring-emerald-500/20',
    'ring-indigo-500/20',
    'ring-amber-500/20',
    'shadow-orange-500/5',
    'hover:shadow-2xl',
    'shadow-2xl',
    // Кнопки по типам - emerald (промокод)
    'bg-emerald-600',
    'hover:bg-emerald-500',
    'bg-emerald-500/20',
    'border-emerald-500/30',
    'text-emerald-200',
    // Кнопки - indigo (финансы)
    'bg-indigo-600',
    'hover:bg-indigo-500',
    'border-indigo-500/30',
    // Кнопки - amber (скидка/кэшбэк)
    'bg-amber-600',
    'hover:bg-amber-500',
    'border-amber-500/30',
    // Бейджи - синие
    'bg-blue-500/10',
    'bg-blue-500/15',
    'border-blue-500/25',
    'border-blue-500/30',
    'text-blue-200',
    'text-blue-300',
    'hover:bg-blue-500/15',
    // Бейджи - оранжевые
    'bg-orange-500/10',
    'bg-orange-500/15',
    'border-orange-500/30',
    'text-orange-200',
    'text-orange-300',
    'hover:bg-orange-500/15',
    // Бейджи - зелёные
    'bg-green-500/10',
    'bg-green-500/15',
    'border-green-500/25',
    'border-green-500/30',
    'text-green-200',
    'text-green-300',
    // Бейджи - фиолетовые
    'bg-purple-500/15',
    'border-purple-500/25',
    'text-purple-300',
    // Тексты и размеры
    'text-white/60',
    'text-white/70',
    'text-white/80',
    'text-white/90',
    'text-gray-200',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    // Размеры
    'h-11',
    'min-h-[40px]',
    'min-h-[44px]',
    'px-2.5',
    'py-1',
    'px-3',
    'py-2',
    'px-4',
    'px-5',
    'font-semibold',
    // Hover/transitions
    'hover:scale-105',
    'hover:scale-[1.02]',
    'transition-all',
    'transition-colors',
    'transition-shadow',
    'transition-transform',
    'duration-200',
    'duration-300',
    'ease-out',
  ],
  
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#0B0A0E',
        foreground: '#F8FAFC',
        primary: {
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.08)',
          active: 'rgba(255, 255, 255, 0.12)',
        },
        success: {
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
        'hot-orange': {
          400: '#f59e0b',
          500: '#d97706',
        },
        'success-green': {
          400: '#34d399',
          500: '#10b981',
        },
        'info-blue': {
          400: '#60a5fa',
          500: '#3b82f6',
        },
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.1)',
        'store-card': '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 25px rgba(255, 255, 255, 0.08)',
        'inner-glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3), 0 0 20px rgba(245, 158, 11, 0.2)',
          },
          '50%': {
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.5), 0 0 30px rgba(245, 158, 11, 0.4)',
          },
        },
      },
      scale: {
        '102': '1.02',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
    },
  },
  plugins: [
    // ✅ ИСПРАВЛЕНО: Добавлена типизация для Tailwind плагина
    function({ addUtilities }: { addUtilities: (utilities: Record<string, any>) => void }) {
      const newUtilities = {
        '.line-clamp-1': {
          display: '-webkit-box',
          '-webkit-line-clamp': '1',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-3': {
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config