'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { getCurriculum, type Level } from '@/lib/api'
import { ManaProgress } from '@/components/theme'

// Unified mana configuration
type ManaColor = 'blue' | 'black' | 'green' | 'gold' | 'red' | 'white'

const MANA_CONFIG: Record<ManaColor, { gradient: string; icon: string }> = {
  blue: {
    gradient: 'from-mana-blue/20 to-mana-blue/5 border-mana-blue/30',
    icon: '💧',
  },
  black: {
    gradient: 'from-mana-black/20 to-mana-black/5 border-mana-black/30',
    icon: '💀',
  },
  green: {
    gradient: 'from-mana-green/20 to-mana-green/5 border-mana-green/30',
    icon: '🌿',
  },
  gold: {
    gradient: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    icon: '✨',
  },
  red: {
    gradient: 'from-mana-red/20 to-mana-red/5 border-mana-red/30',
    icon: '🔥',
  },
  white: {
    gradient: 'from-mana-white/20 to-mana-white/5 border-mana-white/30',
    icon: '☀️',
  },
}

const DEFAULT_MANA: ManaColor = 'blue'

// Type guard for valid mana colors
function isValidManaColor(color: string): color is ManaColor {
  return color in MANA_CONFIG
}

export default function BattlefieldPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadCurriculum = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)

    try {
      const data = await getCurriculum({ signal })
      if (signal?.aborted) return
      setLevels(data.levels)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to load curriculum. Is the backend running?')
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    loadCurriculum(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadCurriculum])

  const handleRetry = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller
    loadCurriculum(controller.signal)
  }, [loadCurriculum])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🔮</div>
          <p className="text-scroll-text/70">Consulting the Oracle...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="scroll-container p-8 text-center">
        <p className="text-mana-red mb-4">{error}</p>
        <button onClick={handleRetry} className="btn-arcane">
          Try Again
        </button>
      </div>
    )
  }

  if (levels.length === 0) {
    return (
      <div className="scroll-container p-8 text-center">
        <p className="text-scroll-text/70 mb-4">
          No levels available yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">The Battlefield</h1>
      <p className="text-scroll-text/70 mb-8">
        Choose your path and begin your journey to becoming an Artificer
      </p>

      <div className="grid gap-6">
        {levels.map((level, index) => (
          <LevelCard key={level.id} level={level} levelNumber={index + 1} />
        ))}
      </div>
    </div>
  )
}

function LevelCard({
  level,
  levelNumber,
}: {
  level: Level
  levelNumber: number
}) {
  // Safely get mana config with fallback
  const manaColor: ManaColor = isValidManaColor(level.mana_color)
    ? level.mana_color
    : DEFAULT_MANA
  const manaConfig = MANA_CONFIG[manaColor]

  const isLocked = level.locked ?? false
  const completedPhases = 0 // TODO: Get from user progress
  const totalPhases = level.phases.length

  return (
    <div
      className={`scroll-container overflow-hidden ${isLocked ? 'opacity-60' : ''}`}
    >
      <div className={`bg-gradient-to-r ${manaConfig.gradient} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl" role="img" aria-label={`${manaColor} mana`}>
              {manaConfig.icon}
            </span>
            <div>
              <div className="text-sm text-scroll-text/60 mb-1">
                Level {levelNumber}
              </div>
              <h2 className="text-2xl font-bold">{level.title}</h2>
              <p className="text-arcane-purple font-medium">{level.subtitle}</p>
            </div>
          </div>
          {isLocked && (
            <span className="px-3 py-1 bg-scroll-text/10 rounded text-sm">
              🔒 Locked
            </span>
          )}
        </div>

        <p className="mt-4 text-scroll-text/80">{level.description}</p>

        {!isLocked && totalPhases > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-scroll-text/70">Progress</span>
              <span className="font-medium">
                {completedPhases} / {totalPhases} phases
              </span>
            </div>
            <ManaProgress
              current={completedPhases}
              total={totalPhases}
              manaType={manaColor}
              showCount={false}
            />
          </div>
        )}

        {!isLocked && totalPhases > 0 && (
          <div className="mt-6">
            <Link
              href={`/battlefield/${level.id}`}
              className="btn-arcane inline-block"
            >
              {completedPhases > 0 ? 'Continue Journey' : 'Begin Journey'}
            </Link>
          </div>
        )}

        {isLocked && (
          <p className="mt-4 text-sm text-scroll-text/60 italic">
            Complete previous levels to unlock this path
          </p>
        )}
      </div>

      {/* Phase Preview */}
      {!isLocked && level.phases.length > 0 && (
        <div className="p-4 border-t border-scroll-border bg-scroll-bg/30">
          <p className="text-sm font-medium mb-2 text-scroll-text/70">Phases:</p>
          <div className="flex flex-wrap gap-2">
            {level.phases.map((phase, index) => (
              <span
                key={phase.id}
                className="px-2 py-1 text-xs bg-scroll-bg rounded border border-scroll-border/50"
              >
                {index + 1}. {phase.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
