'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { getCurriculum, type Level } from '@/lib/api'
import { useProgress } from '@/contexts'
import { ManaProgress } from '@/components/theme'

export default function DashboardPage() {
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

  // Calculate total completed levels
  const completedLevelsCount = levels.filter((level) => {
    const totalPhases = level.phases.length
    const completedPhases = getCompletedCount(level.id)
    return totalPhases > 0 && completedPhases >= totalPhases
  }).length

  // Determine level status based on progress
  const getLevelStatus = (level: Level, index: number): 'completed' | 'available' | 'locked' => {
    const totalPhases = level.phases.length
    const completedPhases = getCompletedCount(level.id)

    // Level is complete if all phases are done
    if (totalPhases > 0 && completedPhases >= totalPhases) {
      return 'completed'
    }

    // First level is always available
    if (index === 0) {
      return 'available'
    }

    // Level is available if previous level is complete
    const prevLevel = levels[index - 1]
    if (prevLevel) {
      const prevTotalPhases = prevLevel.phases.length
      const prevCompletedPhases = getCompletedCount(prevLevel.id)
      if (prevTotalPhases > 0 && prevCompletedPhases >= prevTotalPhases) {
        return 'available'
      }
    }

    // Check if user has started this level (any progress = available)
    if (completedPhases > 0) {
      return 'available'
    }

    return 'locked'
  }

  if (loading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🔮</div>
          <p className="text-silver/60">Consulting the Oracle...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, Artificer</h1>
        <p className="text-silver/60 mb-8">
          Continue your journey through the Academy
        </p>
        <div className="scroll-container p-8 text-center">
          <p className="text-mana-red mb-4">{error}</p>
          <button onClick={() => loadCurriculum()} className="btn-arcane">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome, Artificer</h1>
      <p className="text-silver/60 mb-8">
        Continue your journey through the Academy
      </p>

      {/* Progress Overview */}
      <div className="scroll-container p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Journey</h2>
        <ManaProgress
          current={completedLevelsCount}
          total={levels.length}
          label="Levels Completed"
          manaType="gold"
        />
      </div>

      {/* Level Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {levels.map((level, index) => (
          <LevelCard
            key={level.id}
            level={index + 1}
            title={level.title}
            subtitle={level.subtitle}
            description={level.description}
            status={getLevelStatus(level, index)}
            href={`/battlefield/${level.id}`}
            completedPhases={getCompletedCount(level.id)}
            totalPhases={level.phases.length}
          />
        ))}
      </div>
    </div>
  )
}

interface LevelCardProps {
  level: number
  title: string
  subtitle: string
  description: string
  status: 'completed' | 'available' | 'locked'
  href: string
  completedPhases: number
  totalPhases: number
}

function LevelCard({
  level,
  title,
  subtitle,
  description,
  status,
  href,
  completedPhases,
  totalPhases,
}: LevelCardProps) {
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'

  return (
    <div
      className={`scroll-container p-6 ${isLocked ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm text-arcane-purple font-semibold">
            Level {level}
          </span>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-silver/50">{subtitle}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-silver/60 mb-4">{description}</p>

      {/* Progress indicator */}
      {totalPhases > 0 && !isLocked && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-silver/50 mb-1">
            <span>Progress</span>
            <span>{completedPhases} / {totalPhases} phases</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isCompleted ? 'bg-mana-green' : 'bg-arcane-purple'}`}
              style={{ width: `${totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {!isLocked && (
        <Link
          href={href}
          className={isCompleted ? 'btn-mana inline-block' : 'btn-arcane inline-block'}
        >
          {isCompleted ? 'Review' : completedPhases > 0 ? 'Continue' : 'Begin'}
        </Link>
      )}
      {isLocked && (
        <span className="text-sm text-silver/40">
          Complete previous levels to unlock
        </span>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: 'completed' | 'available' | 'locked' }) {
  if (status === 'completed') {
    return (
      <span className="px-2 py-1 bg-mana-green/20 text-mana-green text-xs rounded-full">
        Completed
      </span>
    )
  }
  if (status === 'available') {
    return (
      <span className="px-2 py-1 bg-arcane-gold/20 text-arcane-gold text-xs rounded-full">
        Available
      </span>
    )
  }
  return (
    <span className="px-2 py-1 bg-white/5 text-silver/40 text-xs rounded-full">
      Locked
    </span>
  )
}
