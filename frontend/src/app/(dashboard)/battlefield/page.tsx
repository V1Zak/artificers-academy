'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { getCurriculum, type Level } from '@/lib/api'
import { useProgress, useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'
import { ManaProgress, GemstoneTracker } from '@/components/theme'
import { AnimatedCard, PageTransition, TiltCard } from '@/components/motion'
import { SkeletonCard } from '@/components/ui/Skeleton'

type ManaColor = 'blue' | 'black' | 'green' | 'gold' | 'red' | 'white'

const DEFAULT_MANA: ManaColor = 'blue'

function isValidManaColor(color: string, config: ReturnType<typeof getModeConfig>): color is ManaColor {
  return color in config.levelColors
}

export default function BattlefieldPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { getCompletedCount, loading: progressLoading } = useProgress()
  const { mode } = useMode()
  const config = getModeConfig(mode)

  const loadCurriculum = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)

    try {
      const data = await getCurriculum({ signal, mode })
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
  }, [mode])

  useEffect(() => {
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
        <div className="h-8 w-40 rounded animate-pulse mb-2" style={{ backgroundColor: 'var(--obsidian)' }} />
        <div className="h-5 w-80 rounded animate-pulse mb-8" style={{ backgroundColor: 'var(--obsidian)' }} />
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
        <p style={{ color: 'var(--silver-muted)' }}>
          No {config.terms.level.toLowerCase()}s available yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <PageTransition>
      <h1 className="text-3xl font-bold mb-2">{config.headings.battlefieldTitle}</h1>
      <p className="mb-8" style={{ color: 'var(--silver-muted)' }}>
        {config.headings.battlefieldSubtitle}
      </p>

      <div className="grid gap-6">
        {levels.map((level, index) => (
          <AnimatedCard key={level.id} index={index}>
            <TiltCard>
              <LevelCard
                level={level}
                levelNumber={index + 1}
                completedPhases={getCompletedCount(level.id)}
                config={config}
                mode={mode}
              />
            </TiltCard>
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
  config,
  mode,
}: {
  level: Level
  levelNumber: number
  completedPhases: number
  config: ReturnType<typeof getModeConfig>
  mode: string
}) {
  const manaColor: ManaColor = isValidManaColor(level.mana_color, config)
    ? level.mana_color
    : DEFAULT_MANA
  const manaConfig = config.levelColors[manaColor] || config.levelColors.blue
  const levelIcon = config.levelIcons[manaColor] || config.levelIcons.blue

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
            <span className="text-3xl sm:text-4xl" role="img" aria-label={`${manaColor} icon`}>
              {levelIcon}
            </span>
            <div>
              <div className="text-sm mb-1" style={{ color: 'var(--silver-faint)' }}>
                {config.terms.level} {levelNumber}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{level.title}</h2>
              <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--arcane-purple)' }}>{level.subtitle}</p>
            </div>
          </div>
          {isLocked && (
            <span className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex-shrink-0" style={{ backgroundColor: 'var(--obsidian)' }}>
              {config.status.locked}
            </span>
          )}
          {isComplete && !isLocked && (
            <span className="px-2 sm:px-3 py-1 bg-mana-green/20 text-mana-green rounded text-xs sm:text-sm font-medium flex-shrink-0">
              {config.status.completed}
            </span>
          )}
        </div>

        <p className="mt-4" style={{ color: 'var(--silver-muted)' }}>{level.description}</p>

        {!isLocked && totalPhases > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span style={{ color: 'var(--silver-muted)' }}>Progress</span>
              <span className="font-medium">
                {completedPhases} / {totalPhases} {config.terms.phase.toLowerCase()}s
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
                ? 'Review'
                : completedPhases > 0
                  ? 'Continue'
                  : 'Begin'}
            </Link>
          </div>
        )}

        {isLocked && (
          <p className="mt-4 text-sm italic" style={{ color: 'var(--silver-faint)' }}>
            Complete previous {config.terms.level.toLowerCase()}s to unlock
          </p>
        )}
      </div>

      {/* Phase Preview */}
      {!isLocked && level.phases.length > 0 && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--obsidian-border)', backgroundColor: 'var(--obsidian)' }}>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--silver-muted)' }}>{config.terms.phase}s:</p>
          <div className="flex flex-wrap gap-3">
            {level.phases.map((phase, index) => {
              const isPhaseComplete = index < completedPhases
              return (
                <div key={phase.id} className="flex items-center gap-2 group">
                  <GemstoneTracker
                    isComplete={isPhaseComplete}
                    isCurrent={!isPhaseComplete && index === completedPhases}
                  />
                  <span className="text-xs" style={{
                    color: isPhaseComplete
                      ? 'var(--silver-muted)'
                      : index === completedPhases
                        ? 'var(--silver)'
                        : 'var(--silver-faint)',
                  }}>
                    {phase.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
