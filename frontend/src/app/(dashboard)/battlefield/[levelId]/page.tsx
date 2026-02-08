'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getLevel, type Level, type Phase } from '@/lib/api'
import { useProgress, useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'
import { GemstoneTracker } from '@/components/theme'
import { SkeletonPhaseCard } from '@/components/ui/Skeleton'

export default function LevelPage() {
  const params = useParams()
  const levelId = params.levelId as string

  const [level, setLevel] = useState<Level | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { isPhaseCompleted, isPhaseUnlocked, loading: progressLoading } = useProgress()
  const { mode } = useMode()
  const config = getModeConfig(mode)

  const loadLevel = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      setError(null)

      try {
        const data = await getLevel(levelId, { signal, mode })
        if (signal?.aborted) return
        setLevel(data)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError('Failed to load level. Is the backend running?')
      } finally {
        if (!signal?.aborted) {
          setLoading(false)
        }
      }
    },
    [levelId, mode]
  )

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    loadLevel(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadLevel])

  const handleRetry = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller
    loadLevel(controller.signal)
  }, [loadLevel])

  if (loading || progressLoading) {
    return (
      <div>
        <div className="h-4 w-32 rounded animate-pulse mb-6" style={{ backgroundColor: 'var(--obsidian)' }} />
        <div className="mb-8 space-y-2">
          <div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--obsidian)' }} />
          <div className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: 'var(--obsidian)' }} />
          <div className="h-5 w-96 rounded animate-pulse" style={{ backgroundColor: 'var(--obsidian)' }} />
        </div>
        <div className="space-y-4">
          <SkeletonPhaseCard />
          <SkeletonPhaseCard />
          <SkeletonPhaseCard />
        </div>
      </div>
    )
  }

  if (error || !level) {
    return (
      <div className="scroll-container p-8 text-center">
        <p className="text-mana-red mb-4">{error || 'Level not found'}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={handleRetry} className="btn-arcane">
            Try Again
          </button>
          <Link href="/battlefield" className="btn-arcane">
            Return to {config.nav.battlefield}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back Navigation */}
      <Link
        href="/battlefield"
        className="inline-flex items-center gap-2 mb-6"
        style={{ color: 'var(--silver-faint)' }}
      >
        <ChevronLeftIcon />
        Back to {config.nav.battlefield}
      </Link>

      {/* Level Header */}
      <div className="mb-8">
        <p className="font-medium mb-1" style={{ color: 'var(--arcane-purple)' }}>{level.subtitle}</p>
        <h1 className="text-3xl font-bold mb-2">{level.title}</h1>
        <p style={{ color: 'var(--silver-muted)' }}>{level.description}</p>
      </div>

      {/* Empty State */}
      {level.phases.length === 0 && (
        <div className="scroll-container p-8 text-center">
          <p style={{ color: 'var(--silver-muted)' }}>
            No {config.terms.phase.toLowerCase()}s available for this {config.terms.level.toLowerCase()} yet. Check back soon!
          </p>
        </div>
      )}

      {/* Phases List */}
      <div className="space-y-4">
        {level.phases.map((phase, index) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            levelId={levelId}
            phaseNumber={index + 1}
            isCompleted={isPhaseCompleted(levelId, phase.id)}
            isUnlocked={isPhaseUnlocked(levelId, phase.id, index)}
            config={config}
          />
        ))}
      </div>
    </div>
  )
}

function PhaseCard({
  phase,
  levelId,
  phaseNumber,
  isCompleted,
  isUnlocked,
  config,
}: {
  phase: Phase
  levelId: string
  phaseNumber: number
  isCompleted: boolean
  isUnlocked: boolean
  config: ReturnType<typeof getModeConfig>
}) {
  const phaseTypeLabel = phase.type === 'lesson' ? config.terms.lesson : config.terms.tutorial

  return (
    <div
      className={`
        scroll-container overflow-hidden transition-all
        ${!isUnlocked ? 'opacity-60' : ''}
        ${isCompleted ? 'border-mana-green/30' : ''}
      `}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Phase Number */}
          <GemstoneTracker
            isComplete={isCompleted}
            isCurrent={!isCompleted && isUnlocked}
            size="lg"
            label={phaseNumber}
          />

          {/* Phase Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--silver-faint)' }}>
                {phaseTypeLabel}
              </span>
              {phase.validation_required && (
                <span className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: 'rgba(14,104,171,0.1)', color: 'var(--luminescent)' }}>
                  {config.phaseLabels.validationRequired}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-1">{phase.title}</h3>
            <p className="text-sm sm:text-base" style={{ color: 'var(--silver-muted)' }}>{phase.description}</p>

            {/* Status / Action - inline on mobile */}
            <div className="mt-3 sm:hidden">
              {isCompleted ? (
                <span className="px-3 py-1 bg-mana-green/10 text-mana-green text-sm rounded inline-block">
                  {config.status.completed}
                </span>
              ) : isUnlocked ? (
                <Link
                  href={`/battlefield/${levelId}/${phase.id}`}
                  className="btn-arcane text-sm inline-block min-h-[44px] leading-[44px]"
                >
                  {phaseNumber === 1 ? 'Start' : 'Continue'}
                </Link>
              ) : (
                <span className="px-3 py-1 text-sm rounded inline-block" style={{ backgroundColor: 'var(--obsidian)', color: 'var(--silver-faint)' }}>
                  {config.status.locked}
                </span>
              )}
            </div>
          </div>

          {/* Status / Action - desktop only */}
          <div className="flex-shrink-0 hidden sm:block">
            {isCompleted ? (
              <span className="px-3 py-1 bg-mana-green/10 text-mana-green text-sm rounded">
                {config.status.completed}
              </span>
            ) : isUnlocked ? (
              <Link
                href={`/battlefield/${levelId}/${phase.id}`}
                className="btn-arcane text-sm"
              >
                {phaseNumber === 1 ? 'Start' : 'Continue'}
              </Link>
            ) : (
              <span className="px-3 py-1 text-sm rounded" style={{ backgroundColor: 'var(--obsidian)', color: 'var(--silver-faint)' }}>
                {config.status.locked}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  )
}
