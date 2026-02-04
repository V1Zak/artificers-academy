'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurriculum, type Level } from '@/lib/api'
import { ManaProgress } from '@/components/theme'

const MANA_COLORS: Record<string, string> = {
  blue: 'from-mana-blue/20 to-mana-blue/5 border-mana-blue/30',
  black: 'from-mana-black/20 to-mana-black/5 border-mana-black/30',
  green: 'from-mana-green/20 to-mana-green/5 border-mana-green/30',
  gold: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
  red: 'from-mana-red/20 to-mana-red/5 border-mana-red/30',
  white: 'from-mana-white/20 to-mana-white/5 border-mana-white/30',
}

const MANA_ICONS: Record<string, string> = {
  blue: '💧',
  black: '💀',
  green: '🌿',
  gold: '✨',
  red: '🔥',
  white: '☀️',
}

export default function BattlefieldPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCurriculum() {
      try {
        const data = await getCurriculum()
        setLevels(data.levels)
      } catch (err) {
        setError('Failed to load curriculum. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    loadCurriculum()
  }, [])

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
        <button
          onClick={() => window.location.reload()}
          className="btn-arcane"
        >
          Try Again
        </button>
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
          <LevelCard
            key={level.id}
            level={level}
            levelNumber={index + 1}
          />
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
  const colorClass = MANA_COLORS[level.mana_color] || MANA_COLORS.blue
  const icon = MANA_ICONS[level.mana_color] || '🔮'
  const isLocked = level.locked
  const completedPhases = 0 // TODO: Get from user progress
  const totalPhases = level.phases.length

  return (
    <div
      className={`
        scroll-container overflow-hidden
        ${isLocked ? 'opacity-60' : ''}
      `}
    >
      <div className={`bg-gradient-to-r ${colorClass} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{icon}</span>
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
              manaType={level.mana_color as 'blue' | 'green' | 'red' | 'white' | 'black' | 'gold'}
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
          <p className="text-sm font-medium mb-2 text-scroll-text/70">
            Phases:
          </p>
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
