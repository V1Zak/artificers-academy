'use client'

import { useState, useEffect } from 'react'
import { useMode } from '@/contexts'
import type { LearningMode } from '@/lib/api'

interface TypewriterTextProps {
  text: string
  className?: string
  onComplete?: () => void
}

function getTypewriterConfig(mode: LearningMode) {
  if (mode === 'mtg') {
    return { charDelay: 30, enabled: true }
  }
  if (mode === 'detailed') {
    return { charDelay: 18, enabled: true }
  }
  return { charDelay: 0, enabled: false }
}

export function TypewriterText({ text, className, onComplete }: TypewriterTextProps) {
  const { mode } = useMode()
  const config = getTypewriterConfig(mode)
  const [displayedText, setDisplayedText] = useState(config.enabled ? '' : text)
  const [isComplete, setIsComplete] = useState(!config.enabled)

  useEffect(() => {
    if (!config.enabled) {
      setDisplayedText(text)
      setIsComplete(true)
      onComplete?.()
      return
    }

    setDisplayedText('')
    setIsComplete(false)
    let index = 0

    const interval = setInterval(() => {
      index++
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index))
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, config.charDelay)

    return () => clearInterval(interval)
  }, [text, config.enabled, config.charDelay, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom animate-pulse" style={{ backgroundColor: 'currentColor' }} />
      )}
    </span>
  )
}
