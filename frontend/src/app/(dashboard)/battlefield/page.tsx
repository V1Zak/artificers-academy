'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { getCurriculum, type Level } from '@/lib/api'
import { useProgress } from '@/contexts'
import { ManaProgress } from '@/components/theme'
import { AnimatedCard, PageTransition } from '@/components/motion'
import { SkeletonCard } from '@/components/ui/Skeleton'

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
  const { getCompletedCount, loading: progressLoading } = useProgress()

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

  if (loading || progressLoading) {
    return (
      <div>
        <div className="h-8 w-40 bg-white/[0.06] rounded animate-pulse mb-2" />
        <div className="h-5 w-80 bg-white/[0.06] rounded animate-pulse mb-8" />
        <div className="grid gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
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
        <p className="text-silver/60 mb-4">
          No levels available yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <PageTransition>
      <h1 className="text-3xl font-bold mb-2">The Battlefield</h1>
      <p className="text-silver/60 mb-8">
        Choose your path and begin your journey to becoming an Artificer
      </p>

      <div className="grid gap-6">
        {levels.map((level, index) => (
          <AnimatedCard key={level.id} index={index}>
            <LevelCard
              level={level}
              levelNumber={index + 1}
              completedPhases={getCompletedCount(level.id)}
            />
          </AnimatedCard>
        ))}
      </div>
    </PageTransition>
  )
}

function LevelCard({
  level,
  levelNumber,
  completedPhases,
}: {
  level: Level
  levelNumber: number
  completedPhases: number
}) {
  // Safely get mana config with fallback
  const manaColor: ManaColor = isValidManaColor(level.mana_color)
    ? level.mana_color
    : DEFAULT_MANA
  const manaConfig = MANA_CONFIG[manaColor]

  const isLocked = level.locked ?? false
  const totalPhases = level.phases.length
  const isComplete = totalPhases > 0 && completedPhases >= totalPhases

  return (
    <div
      className={`scroll-container overflow-hidden ${isLocked ? 'opacity-60' : ''}`}
    >
      <div className={`bg-gradient-to-r ${manaConfig.gradient} p-4 sm:p-6`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-3xl sm:text-4xl" role="img" aria-label={`${manaColor} mana`}>
              {manaConfig.icon}
            </span>
            <div>
              <div className="text-sm text-silver/50 mb-1">
                Level {levelNumber}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{level.title}</h2>
              <p className="text-arcane-purple font-medium text-sm sm:text-base">{level.subtitle}</p>
            </div>
          </div>
          {isLocked && (
            <span className="px-2 sm:px-3 py-1 bg-white/5 rounded text-xs sm:text-sm flex-shrink-0">
              🔒 Locked
            </span>
          )}
          {isComplete && !isLocked && (
            <span className="px-2 sm:px-3 py-1 bg-mana-green/20 text-mana-green rounded text-xs sm:text-sm font-medium flex-shrink-0">
              ✓ Complete
            </span>
          )}
        </div>

        <p className="mt-4 text-silver/70">{level.description}</p>

        {!isLocked && totalPhases > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-silver/60">Progress</span>
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
              {isComplete
                ? 'Review Level'
                : completedPhases > 0
                  ? 'Continue Journey'
                  : 'Begin Journey'}
            </Link>
          </div>
        )}

        {isLocked && (
          <p className="mt-4 text-sm text-silver/50 italic">
            Complete previous levels to unlock this path
          </p>
        )}
      </div>

      {/* Phase Preview */}
      {!isLocked && level.phases.length > 0 && (
        <div className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
          <p className="text-sm font-medium mb-2 text-silver/60">Phases:</p>
          <div className="flex flex-wrap gap-2">
            {level.phases.map((phase, index) => (
              <span
                key={phase.id}
                className="px-2 py-1 text-xs bg-white/[0.03] rounded border border-white/[0.06]"
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
