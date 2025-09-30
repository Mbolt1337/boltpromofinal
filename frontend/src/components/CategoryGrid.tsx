'use client'

import { useMemo } from 'react'
import { Category } from '@/lib/api'
import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import { getCategoryIcon } from '@/lib/utils'
import SectionContainer from '@/components/ui/SectionContainer'
import SectionHeader from '@/components/ui/SectionHeader'

interface CategoryGridProps {
  categories: Category[]
  showHeader?: boolean
  limit?: number
}

// 🚀 ОПТИМИЗАЦИЯ: Константы классов вынесены наружу
const GRID_CLASSES = "category-grid"
const CARD_CLASSES = "category-card group focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
const CONTENT_CLASSES = "category-card-content"
const ICON_WRAPPER_CLASSES = "category-icon-wrapper"
const ICON_CLASSES = "category-icon"
const INFO_CLASSES = "category-info"
const TITLE_CLASSES = "category-title"
const COUNT_CLASSES = "category-count"
const DESCRIPTION_CLASSES = "category-description"
const HOVER_EFFECT_CLASSES = "category-hover-effect"
const VIEW_ALL_CLASSES = "view-all-btn group"

// 🚀 ОПТИМИЗАЦИЯ: Интерфейс для обработанной категории
interface ProcessedCategory extends Category {
  IconComponent: React.ComponentType<{ className?: string }>
  countText: string
}

// Skeleton для загрузки категорий
function CategoryGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass-card p-6 animate-shimmer">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl mb-4"></div>
            <div className="h-6 bg-white/10 rounded w-24 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 🚀 ОПТИМИЗАЦИЯ: Компонент пустого состояния
function EmptyState({ showHeader }: { showHeader: boolean }) {
  const content = (
    <>
      {showHeader && (
        <SectionHeader
          title="Популярные категории"
          subtitle="Изучайте предложения по интересам"
          align="center"
        />
      )}

      <div className="glass-card p-12 text-center">
        <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-4">
          Категории загружаются
        </h3>
        <p className="text-gray-400">
          Скоро здесь появятся категории товаров
        </p>
      </div>
    </>
  )

  return showHeader ? <SectionContainer>{content}</SectionContainer> : content
}

// 🚀 ОПТИМИЗАЦИЯ: Мемоизированный компонент карточки категории
function CategoryCard({ category }: { category: ProcessedCategory }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={CARD_CLASSES}
    >
      <div className={CONTENT_CLASSES}>
        {/* Иконка */}
        <div className={ICON_WRAPPER_CLASSES}>
          <category.IconComponent className={ICON_CLASSES} />
        </div>
        
        {/* Информация */}
        <div className={INFO_CLASSES}>
          <h3 className={TITLE_CLASSES}>
            {category.name}
          </h3>
          
          {/* Количество промокодов */}
          {category.promocodes_count !== undefined && (
            <p className={COUNT_CLASSES}>
              {category.countText}
            </p>
          )}
          
          {/* Описание */}
          {category.description && (
            <p className={DESCRIPTION_CLASSES}>
              {category.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Hover эффект */}
      <div className={HOVER_EFFECT_CLASSES}></div>
    </Link>
  )
}

export { CategoryGridSkeleton }

export default function CategoryGrid({ 
  categories, 
  showHeader = true,
  limit 
}: CategoryGridProps) {
  // 🚀 ОПТИМИЗАЦИЯ: Мемоизированная обработка категорий
  const processedCategories = useMemo(() => {
    // Ограничиваем количество категорий, если указан лимит
    const limitedCategories = limit ? categories.slice(0, limit) : categories
    
    // Обрабатываем каждую категорию один раз
    return limitedCategories.map((category): ProcessedCategory => {
      // Получаем иконку один раз для каждой категории
      const iconName = category.icon || category.slug
      const IconComponent = getCategoryIcon(iconName)
      
      // Формируем текст счетчика один раз
      const count = category.promocodes_count || 0
      const countText = count === 1 ? '1 промокод' : `${count} промокодов`
      
      return {
        ...category,
        IconComponent,
        countText
      }
    })
  }, [categories, limit])

  // Пустое состояние
  if (categories.length === 0) {
    return <EmptyState showHeader={showHeader} />
  }

  const content = (
    <>
      {/* Заголовок секции */}
      {showHeader && (
        <SectionHeader
          title="Популярные категории"
          subtitle="Найдите скидки в интересующих вас категориях"
          align="center"
        />
      )}

      {/* 🚀 ОПТИМИЗАЦИЯ: Сетка категорий с обработанными данными */}
      <div className={GRID_CLASSES}>
        {processedCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
          />
        ))}
      </div>

      {/* Кнопка "Смотреть все" */}
      {limit && showHeader && categories.length > limit && (
        <div className="section-footer-gap flex justify-center">
          <Link href="/categories" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
            <span>Все категории</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </>
  )

  return showHeader ? <SectionContainer>{content}</SectionContainer> : content
}