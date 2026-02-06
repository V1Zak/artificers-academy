'use client'

import { cn } from '@/lib/utils'

interface ManaProgressProps {
  current: number
  total: number
  label?: string
  showCount?: boolean
  className?: string
  manaType?: 'blue' | 'green' | 'red' | 'white' | 'black' | 'gold'
}

/**
 * ManaProgress - A magical progress bar styled as a mana pool
 *
 * Visualizes progress as mana filling a pool, complete
 * with a subtle glow effect when full.
 */
export function ManaProgress({
  current,
  total,
  label,
  showCount = true,
  className,
  manaType = 'blue',
}: ManaProgressProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0
  const isFull = percentage >= 100

  const manaColors = {
    blue: {
      gradient: 'from-mana-blue to-arcane-purple',
      glow: 'shadow-[0_0_10px_rgba(14,104,171,0.6)]',
    },
    green: {
      gradient: 'from-mana-green to-emerald-400',
      glow: 'shadow-[0_0_10px_rgba(0,115,62,0.6)]',
    },
    red: {
      gradient: 'from-mana-red to-orange-500',
      glow: 'shadow-[0_0_10px_rgba(211,32,42,0.6)]',
    },
    white: {
      gradient: 'from-mana-white to-amber-200',
      glow: 'shadow-[0_0_10px_rgba(248,231,185,0.6)]',
    },
    black: {
      gradient: 'from-mana-black to-gray-700',
      glow: 'shadow-[0_0_10px_rgba(21,11,0,0.6)]',
    },
    gold: {
      gradient: 'from-arcane-gold to-yellow-400',
      glow: 'shadow-[0_0_10px_rgba(201,162,39,0.6)]',
    },
  }

  const colors = manaColors[manaType]

  return (
    <div className={cn('w-full', className)}>
      {(label || showCount) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-silver">
              {label}
            </span>
          )}
          {showCount && (
            <span className="text-sm text-silver/70">
              {current} / {total}
            </span>
          )}
        </div>
      )}
      <div className="mana-bar">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
            colors.gradient,
            isFull && colors.glow
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isFull && (
        <p className="text-xs text-arcane-gold mt-1 text-center animate-pulse">
          Mana pool full!
        </p>
      )}
    </div>
  )
}

interface ManaOrbProps {
  filled: boolean
  manaType?: 'blue' | 'green' | 'red' | 'white' | 'black'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * ManaOrb - Individual mana symbol orb
 */
export function ManaOrb({ filled, manaType = 'blue', size = 'md' }: ManaOrbProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const colorClasses = {
    blue: filled ? 'bg-mana-blue' : 'bg-mana-blue/20',
    green: filled ? 'bg-mana-green' : 'bg-mana-green/20',
    red: filled ? 'bg-mana-red' : 'bg-mana-red/20',
    white: filled ? 'bg-mana-white border border-white/20' : 'bg-mana-white/20',
    black: filled ? 'bg-mana-black' : 'bg-mana-black/20',
  }

  return (
    <div
      className={cn(
        'rounded-full transition-all duration-300',
        sizeClasses[size],
        colorClasses[manaType],
        filled && 'shadow-glow'
      )}
    />
  )
}
