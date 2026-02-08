'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useMode } from '@/contexts'
import type { LearningMode } from '@/lib/api'

interface TiltCardProps {
  children: ReactNode
  className?: string
}

function getTiltOptions(mode: LearningMode) {
  if (mode === 'mtg') {
    return {
      max: 8,
      speed: 400,
      scale: 1.02,
      glare: true,
      'max-glare': 0.15,
      perspective: 1000,
    }
  }
  if (mode === 'detailed') {
    return {
      max: 4,
      speed: 300,
      scale: 1.01,
      glare: false,
      perspective: 1200,
    }
  }
  return null
}

export function TiltCard({ children, className }: TiltCardProps) {
  const { mode } = useMode()
  const ref = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<ReturnType<typeof import('vanilla-tilt')['default']['init']> | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const options = getTiltOptions(mode)
    if (!options) return

    let cancelled = false

    import('vanilla-tilt').then(({ default: VanillaTilt }) => {
      if (cancelled || !el) return
      VanillaTilt.init(el, options)
    })

    return () => {
      cancelled = true
      // vanilla-tilt attaches a vanillaTilt property to the element
      const tiltEl = el as HTMLElement & { vanillaTilt?: { destroy: () => void } }
      tiltEl.vanillaTilt?.destroy()
    }
  }, [mode])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
