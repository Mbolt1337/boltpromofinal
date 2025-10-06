'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

/**
 * Компонент для последовательного появления дочерних элементов
 *
 * Используй совместно с FadeIn для эффекта "волны"
 *
 * @example
 * ```tsx
 * <StaggerChildren>
 *   {promos.map((promo, i) => (
 *     <FadeIn key={promo.id} delay={i * 0.1}>
 *       <PromoCard promo={promo} />
 *     </FadeIn>
 *   ))}
 * </StaggerChildren>
 * ```
 */
export default function StaggerChildren({
  children,
  className = '',
  staggerDelay = 0.1
}: StaggerChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
