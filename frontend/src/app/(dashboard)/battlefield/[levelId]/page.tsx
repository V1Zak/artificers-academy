'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getLevel, type Level, type Phase } from '@/lib/api'
import { useProgress } from '@/contexts'

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">📜</div>
          <p className="text-scroll-text/70">Loading level...</p>
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
        className="inline-flex items-center gap-2 text-scroll-text/70 hover:text-scroll-text mb-6"
      >
        <ChevronLeftIcon />
        Back to Battlefield
      </Link>

      {/* Level Header */}
      <div className="mb-8">
        <p className="text-arcane-purple font-medium mb-1">{level.subtitle}</p>
        <h1 className="text-3xl font-bold mb-2">{level.title}</h1>
        <p className="text-scroll-text/70">{level.description}</p>
      </div>

      {/* Empty State */}
      {level.phases.length === 0 && (
        <div className="scroll-container p-8 text-center">
          <p className="text-scroll-text/70">
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
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Phase Number */}
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
              ${
                isCompleted
                  ? 'bg-mana-green/20 text-mana-green'
                  : isUnlocked
                    ? 'bg-arcane-purple/20 text-arcane-purple'
                    : 'bg-scroll-text/10 text-scroll-text/40'
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
              <span className="text-xs text-scroll-text/60 uppercase tracking-wide">
                {phaseTypeLabel}
              </span>
              {phase.validation_required && (
                <span className="px-2 py-0.5 text-xs bg-mana-blue/10 text-mana-blue rounded">
                  Validation Required
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-1">{phase.title}</h3>
            <p className="text-scroll-text/70">{phase.description}</p>
          </div>

          {/* Status / Action */}
          <div className="flex-shrink-0">
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
              <span className="px-3 py-1 bg-scroll-text/10 text-scroll-text/50 text-sm rounded">
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
