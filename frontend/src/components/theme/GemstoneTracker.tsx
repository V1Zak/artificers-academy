'use client'

import { useMode } from '@/contexts'

interface GemstoneTrackerProps {
  isComplete: boolean
  isCurrent: boolean
  size?: 'sm' | 'lg'
  label?: string | number
}

export function GemstoneTracker({ isComplete, isCurrent, size = 'sm', label }: GemstoneTrackerProps) {
  const { mode } = useMode()

  if (mode === 'mtg') {
    return (
      <MtgGemstone
        isComplete={isComplete}
        isCurrent={isCurrent}
        size={size}
        label={label}
      />
    )
  }

  if (mode === 'detailed') {
    return (
      <DetailedGemstone
        isComplete={isComplete}
        isCurrent={isCurrent}
        size={size}
        label={label}
      />
    )
  }

  // Simple mode: minimal circles
  return (
    <SimpleTracker
      isComplete={isComplete}
      isCurrent={isCurrent}
      size={size}
      label={label}
    />
  )
}

function MtgGemstone({ isComplete, isCurrent, size, label }: GemstoneTrackerProps) {
  const isLarge = size === 'lg'
  const dim = isLarge ? 'w-10 h-10' : 'w-4 h-4'

  if (isComplete) {
    return (
      <div
        className={`${dim} relative flex items-center justify-center flex-shrink-0`}
        style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' }}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <polygon
            points="12,2 22,9 18,22 6,22 2,9"
            fill="rgba(34,197,94,0.25)"
            stroke="rgb(34,197,94)"
            strokeWidth="1.5"
          />
        </svg>
        {isLarge && (
          <span className="absolute text-xs font-bold text-mana-green">
            ✓
          </span>
        )}
      </div>
    )
  }

  if (isCurrent) {
    return (
      <div
        className={`${dim} relative flex items-center justify-center flex-shrink-0 animate-pulse`}
        style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.4))' }}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <polygon
            points="12,2 22,9 18,22 6,22 2,9"
            fill="rgba(139,92,246,0.2)"
            stroke="rgb(139,92,246)"
            strokeWidth="1.5"
          />
        </svg>
        {isLarge && label !== undefined && (
          <span className="absolute text-xs font-bold" style={{ color: 'var(--arcane-purple)' }}>
            {label}
          </span>
        )}
      </div>
    )
  }

  // Inactive
  return (
    <div className={`${dim} relative flex items-center justify-center flex-shrink-0`}>
      <svg viewBox="0 0 24 24" className="w-full h-full opacity-40">
        <polygon
          points="12,2 22,9 18,22 6,22 2,9"
          fill="none"
          stroke="var(--obsidian-border)"
          strokeWidth="1.5"
        />
      </svg>
      {isLarge && label !== undefined && (
        <span className="absolute text-xs font-bold" style={{ color: 'var(--silver-faint)' }}>
          {label}
        </span>
      )}
    </div>
  )
}

function DetailedGemstone({ isComplete, isCurrent, size, label }: GemstoneTrackerProps) {
  const isLarge = size === 'lg'
  const dim = isLarge ? 'w-10 h-10' : 'w-3.5 h-3.5'

  if (isComplete) {
    return (
      <div
        className={`${dim} flex items-center justify-center flex-shrink-0 rounded`}
        style={{
          backgroundColor: 'rgba(34,197,94,0.15)',
          border: '1.5px solid rgb(34,197,94)',
        }}
      >
        {isLarge && (
          <span className="text-xs font-bold text-green-500">✓</span>
        )}
      </div>
    )
  }

  if (isCurrent) {
    return (
      <div
        className={`${dim} flex items-center justify-center flex-shrink-0 rounded`}
        style={{
          backgroundColor: 'rgba(59,130,246,0.15)',
          border: '1.5px solid rgb(59,130,246)',
        }}
      >
        {isLarge && label !== undefined && (
          <span className="text-xs font-bold text-blue-400">{label}</span>
        )}
      </div>
    )
  }

  // Inactive
  return (
    <div
      className={`${dim} flex items-center justify-center flex-shrink-0 rounded`}
      style={{
        backgroundColor: 'var(--obsidian)',
        border: '1.5px solid var(--obsidian-border)',
      }}
    >
      {isLarge && label !== undefined && (
        <span className="text-xs font-bold" style={{ color: 'var(--silver-faint)' }}>{label}</span>
      )}
    </div>
  )
}

function SimpleTracker({ isComplete, isCurrent, size, label }: GemstoneTrackerProps) {
  const isLarge = size === 'lg'
  const dim = isLarge ? 'w-10 h-10' : 'w-3 h-3'

  if (isComplete) {
    return (
      <div
        className={`${dim} rounded-full flex items-center justify-center flex-shrink-0 bg-green-500`}
      >
        {isLarge && (
          <span className="text-xs font-bold text-white">✓</span>
        )}
      </div>
    )
  }

  if (isCurrent) {
    return (
      <div
        className={`${dim} rounded-full flex items-center justify-center flex-shrink-0`}
        style={{ backgroundColor: 'var(--arcane-purple)' }}
      >
        {isLarge && label !== undefined && (
          <span className="text-xs font-bold text-white">{label}</span>
        )}
      </div>
    )
  }

  // Inactive
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: 'var(--obsidian-border)' }}
    >
      {isLarge && label !== undefined && (
        <span className="text-xs font-bold" style={{ color: 'var(--silver-faint)' }}>{label}</span>
      )}
    </div>
  )
}
