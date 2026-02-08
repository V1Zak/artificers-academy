'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useMode } from '@/contexts'
import type { LearningMode } from '@/lib/api'

interface AnimatedCardProps {
  children: ReactNode
  index?: number
  className?: string
}

function getVariants(mode: LearningMode, index: number) {
  if (mode === 'mtg') {
    return {
      initial: { opacity: 0, y: 30, scale: 0.96 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.5, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    }
  }
  if (mode === 'detailed') {
    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
      whileHover: { scale: 1.01, transition: { duration: 0.15 } },
    }
  }
  // simple
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.25, delay: index * 0.06, ease: 'easeOut' as const },
    whileHover: undefined,
  }
}

export function AnimatedCard({ children, index = 0, className }: AnimatedCardProps) {
  const { mode } = useMode()
  const v = useMemo(() => getVariants(mode, index), [mode, index])

  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      transition={v.transition}
      whileHover={v.whileHover}
      className={className}
    >
      {children}
    </motion.div>
  )
}
