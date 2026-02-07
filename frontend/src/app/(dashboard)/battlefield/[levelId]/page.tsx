'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getLevel, type Level, type Phase } from '@/lib/api'
import { useProgress } from '@/contexts'
import { SkeletonPhaseCard } from '@/components/ui/Skeleton'

export default function LevelPage() {
  const params = useParams()
  const levelId = params.levelId as string

  const [level, setLevel] = useState<Level | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { isPhaseCompleted, isPhaseUnlocked, loading: progressLoading } = useProgress()

  const loadLevel = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      setError(null)

      try {
        const data = await getLevel(levelId, { signal })
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
    [levelId]
  )

  useEffect(() => {
    // Abort previous request
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
        <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse mb-6" />
        <div className="mb-8 space-y-2">
          <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-8 w-64 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-5 w-96 bg-white/[0.06] rounded animate-pulse" />
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
            Return to Battlefield
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
        className="inline-flex items-center gap-2 text-silver/60 hover:text-silver mb-6"
      >
        <ChevronLeftIcon />
        Back to Battlefield
      </Link>

      {/* Level Header */}
      <div className="mb-8">
        <p className="text-arcane-purple font-medium mb-1">{level.subtitle}</p>
        <h1 className="text-3xl font-bold mb-2">{level.title}</h1>
        <p className="text-silver/60">{level.description}</p>
      </div>

      {/* Empty State */}
      {level.phases.length === 0 && (
        <div className="scroll-container p-8 text-center">
          <p className="text-silver/60">
            No phases available for this level yet. Check back soon!
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
}: {
  phase: Phase
  levelId: string
  phaseNumber: number
  isCompleted: boolean
  isUnlocked: boolean
}) {
  const phaseTypeIcon = phase.type === 'lesson' ? '📖' : '⚗️'
  const phaseTypeLabel = phase.type === 'lesson' ? 'Lesson' : 'Tutorial'

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
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
              ${
                isCompleted
                  ? 'bg-mana-green/20 text-mana-green'
                  : isUnlocked
                    ? 'bg-arcane-purple/20 text-arcane-purple'
                    : 'bg-white/5 text-silver/30'
              }
            `}
            aria-label={isCompleted ? 'Completed' : `Phase ${phaseNumber}`}
          >
            {isCompleted ? '✓' : phaseNumber}
          </div>

          {/* Phase Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-lg" role="img" aria-label={phaseTypeLabel}>
                {phaseTypeIcon}
              </span>
              <span className="text-xs text-silver/50 uppercase tracking-wide">
                {phaseTypeLabel}
              </span>
              {phase.validation_required && (
                <span className="px-2 py-0.5 text-xs bg-mana-blue/10 text-mana-blue rounded">
                  Validation Required
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-1">{phase.title}</h3>
            <p className="text-silver/60 text-sm sm:text-base">{phase.description}</p>

            {/* Status / Action - inline on desktop, below on mobile */}
            <div className="mt-3 sm:hidden">
              {isCompleted ? (
                <span className="px-3 py-1 bg-mana-green/10 text-mana-green text-sm rounded inline-block">
                  Completed
                </span>
              ) : isUnlocked ? (
                <Link
                  href={`/battlefield/${levelId}/${phase.id}`}
                  className="btn-arcane text-sm inline-block min-h-[44px] leading-[44px]"
                >
                  {phaseNumber === 1 ? 'Start' : 'Continue'}
                </Link>
              ) : (
                <span className="px-3 py-1 bg-white/5 text-silver/40 text-sm rounded inline-block">
                  🔒 Locked
                </span>
              )}
            </div>
          </div>

          {/* Status / Action - desktop only */}
          <div className="flex-shrink-0 hidden sm:block">
            {isCompleted ? (
              <span className="px-3 py-1 bg-mana-green/10 text-mana-green text-sm rounded">
                Completed
              </span>
            ) : isUnlocked ? (
              <Link
                href={`/battlefield/${levelId}/${phase.id}`}
                className="btn-arcane text-sm"
              >
                {phaseNumber === 1 ? 'Start' : 'Continue'}
              </Link>
            ) : (
              <span className="px-3 py-1 bg-white/5 text-silver/40 text-sm rounded">
                🔒 Locked
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
