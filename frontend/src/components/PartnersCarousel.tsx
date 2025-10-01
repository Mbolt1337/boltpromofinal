// frontend/src/components/PartnersCarousel.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Store, Users, TrendingUp } from 'lucide-react'
import { getPartners, type Partner } from '@/lib/api'

interface PartnersCarouselProps {
  className?: string
}

export default function PartnersCarousel({ className = "" }: PartnersCarouselProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка партнеров
  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true)
        const data = await getPartners()
        setPartners(data)
      } catch (error) {
        console.error('Ошибка загрузки партнеров:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPartners()
  }, [])

  // Состояние загрузки
  if (loading) {
    return (
      <section className={`py-16 ${className}`}>
        <div className="container-main">
          {/* Заголовок skeleton */}
          <div className="glass-card p-8 mb-12 animate-shimmer">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl mx-auto mb-4"></div>
              <div className="h-8 bg-white/10 rounded-xl w-64 mx-auto mb-3"></div>
              <div className="h-5 bg-white/10 rounded-lg w-96 mx-auto"></div>
            </div>
          </div>
          
          {/* Carousel skeleton */}
          <div className="relative overflow-hidden">
            <div className="flex gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div 
                  key={index} 
                  className="glass-card p-8 h-32 w-48 flex-shrink-0 animate-shimmer"
                >
                  <div className="w-full h-full bg-white/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Если партнеров нет, не показываем секцию
  if (partners.length === 0) {
    return null
  }

  // Дублируем партнеров для бесконечного скролла
  const duplicatedPartners = [...partners, ...partners, ...partners]

  return (
    <section className={`py-16 ${className}`}>
      <div className="container-main">
        {/* Стеклянная шапка */}
        <div className="glass-card p-8 mb-12 text-center shadow-glass">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6 transition-all duration-300 ease-out hover:scale-110 hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-500/40">
            <Users className="w-8 h-8 text-blue-400 transition-all duration-300 ease-out" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Надежные партнеры
          </h2>
          
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            Мы работаем с ведущими магазинами и CPA-платформами, чтобы предоставить вам лучшие предложения
          </p>

          {/* Статистика */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400 transition-all duration-300 ease-out hover:text-gray-300 hover:scale-105">
              <Store className="w-4 h-4 transition-all duration-300 ease-out hover:scale-110" />
              <span>{partners.length}+ партнеров</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 transition-all duration-300 ease-out hover:text-gray-300 hover:scale-105">
              <TrendingUp className="w-4 h-4 transition-all duration-300 ease-out hover:scale-110" />
              <span>Проверенные предложения</span>
            </div>
          </div>
        </div>

        {/* Автоскролл карусель */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Градиентные маски по краям */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>
          
          {/* Скроллящийся контент */}
          <div className="partner-scroll-container group">
            <div className="partner-scroll-track">
              {duplicatedPartners.map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="glass-card p-8 h-32 w-48 flex-shrink-0 flex items-center justify-center transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer shadow-glass hover:shadow-2xl hover:bg-white/8 group"
                >
                  {/* B2: Оптимизированный логотип */}
                  <div className="w-full h-full flex items-center justify-center">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={140}
                        height={90}
                        className="object-contain max-w-full max-h-full transition-all duration-300 ease-out group-hover:scale-105"
                        // B2: Responsive sizes для партнеров
                        sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 140px"
                        // B2: Ленивая загрузка для всех партнеров (не критично для LCP)
                        loading="lazy"
                        priority={false}
                        // B2: Сниженное качество для логотипов партнеров
                        quality={70}
                        // B2: Placeholder для smoother loading
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLk4PvXFwjNvhIG"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 transition-all duration-300 ease-out group-hover:bg-white/15 group-hover:border-white/20 group-hover:scale-105">
                        <span className="text-white font-bold text-lg transition-colors duration-300 ease-out group-hover:text-blue-300">
                          {partner.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm transition-colors duration-300 ease-out hover:text-gray-300">
            Все партнеры проходят тщательную проверку качества и надежности
          </p>
        </div>
      </div>
    </section>
  )
}