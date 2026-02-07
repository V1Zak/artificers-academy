'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { getCurriculum, type Level } from '@/lib/api'
import { useProgress, useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'
import { ManaProgress } from '@/components/theme'
import { AnimatedCard, PageTransition } from '@/components/motion'
import { SkeletonCard, SkeletonProgress } from '@/components/ui/Skeleton'

export default function DashboardPage() {
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

    if (totalPhases > 0 && completedPhases >= totalPhases) {
      return 'completed'
    }

    if (index === 0) {
      return 'available'
    }

    const prevLevel = levels[index - 1]
    if (prevLevel) {
      const prevTotalPhases = prevLevel.phases.length
      const prevCompletedPhases = getCompletedCount(prevLevel.id)
      if (prevTotalPhases > 0 && prevCompletedPhases >= prevTotalPhases) {
        return 'available'
      }
    }

    if (completedPhases > 0) {
      return 'available'
    }

    return 'locked'
  }

  if (loading || progressLoading) {
    return (
      <div>
        <div className="h-8 w-48 rounded animate-pulse mb-2" style={{ backgroundColor: 'var(--obsidian)' }} />
        <div className="h-5 w-72 rounded animate-pulse mb-8" style={{ backgroundColor: 'var(--obsidian)' }} />
        <SkeletonProgress className="mb-8" />
        <div className="grid md:grid-cols-2 gap-6">
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
      <div>
        <h1 className="text-3xl font-bold mb-2">{config.headings.dashboardTitle}</h1>
        <p className="mb-8" style={{ color: 'var(--silver-muted)' }}>
          {config.headings.dashboardSubtitle}
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
    <PageTransition>
      <h1 className="text-3xl font-bold mb-2">{config.headings.dashboardTitle}</h1>
      <p className="mb-8" style={{ color: 'var(--silver-muted)' }}>
        {config.headings.dashboardSubtitle}
      </p>

      {/* Progress Overview */}
      <AnimatedCard>
        <div className="scroll-container p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{config.dashboardProgressHeading}</h2>
          <ManaProgress
            current={completedLevelsCount}
            total={levels.length}
            label={`${config.terms.level}s Completed`}
            manaType="gold"
          />
        </div>
      </AnimatedCard>

      {/* Level Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {levels.map((level, index) => (
          <AnimatedCard key={level.id} index={index + 1}>
            <LevelCard
              level={index + 1}
              title={level.title}
              subtitle={level.subtitle}
              description={level.description}
              status={getLevelStatus(level, index)}
              href={`/battlefield/${level.id}`}
              completedPhases={getCompletedCount(level.id)}
              totalPhases={level.phases.length}
              levelLabel={config.terms.level}
              phaseLabel={config.terms.phase}
              statusLabels={config.status}
            />
          </AnimatedCard>
        ))}
      </div>
    </PageTransition>
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
  levelLabel: string
  phaseLabel: string
  statusLabels: { completed: string; available: string; locked: string }
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
  levelLabel,
  phaseLabel,
  statusLabels,
}: LevelCardProps) {
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'

  return (
    <div className="scroll-container p-6 relative overflow-hidden">
      {/* Fog overlay for locked levels */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--void), 0.6)', backdropFilter: 'blur(1px)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--silver-faint)' }}>
            Complete previous {levelLabel.toLowerCase()}s to unlock
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm font-semibold" style={{ color: 'var(--arcane-purple)' }}>
            {levelLabel} {level}
          </span>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm" style={{ color: 'var(--silver-faint)' }}>{subtitle}</p>
        </div>
        <StatusBadge status={status} labels={statusLabels} />
      </div>
      <p className="mb-4" style={{ color: 'var(--silver-muted)' }}>{description}</p>

      {/* Progress indicator */}
      {totalPhases > 0 && !isLocked && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--silver-faint)' }}>
            <span>Progress</span>
            <span>{completedPhases} / {totalPhases} {phaseLabel.toLowerCase()}s</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--obsidian)' }}>
            <div
              className={`h-full transition-all duration-500 ${isCompleted ? 'bg-mana-green' : ''}`}
              style={{
                width: `${totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0}%`,
                ...(!isCompleted ? { backgroundColor: 'var(--arcane-purple)' } : {}),
              }}
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
    </div>
  )
}

function StatusBadge({ status, labels }: { status: 'completed' | 'available' | 'locked'; labels: { completed: string; available: string; locked: string } }) {
  if (status === 'completed') {
    return (
      <span className="px-2 py-1 bg-mana-green/20 text-mana-green text-xs rounded-full">
        {labels.completed}
      </span>
    )
  }
  if (status === 'available') {
    return (
      <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'rgba(var(--arcane-gold), 0.2)', color: 'var(--arcane-gold)' }}>
        {labels.available}
      </span>
    )
  }
  return (
    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--obsidian)', color: 'var(--silver-faint)' }}>
      {labels.locked}
    </span>
  )
}
