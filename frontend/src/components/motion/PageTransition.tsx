'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMode } from '@/contexts'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const modeTransitions = {
  mtg: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  detailed: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
  simple: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const { mode } = useMode()
  const t = modeTransitions[mode]

  return (
    <motion.div
      initial={t.initial}
      animate={t.animate}
      transition={t.transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}
