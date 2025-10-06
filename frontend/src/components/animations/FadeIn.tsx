'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

/**
 * Компонент для плавного появления элементов
 *
 * @example
 * ```tsx
 * <FadeIn direction="up" delay={0.1}>
 *   <PromoCard promo={promo} />
 * </FadeIn>
 * ```
 */
export default function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  className = '',
  direction = 'up'
}: FadeInProps) {
  const directionOffset = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
    none: {}
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0] // easeInOut
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
