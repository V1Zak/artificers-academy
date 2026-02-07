'use client'

import { cn } from '@/lib/utils'
import { useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'

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
  const { mode } = useMode()
  const config = getModeConfig(mode)

  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0
  const isFull = percentage >= 100

  const barStyle = config.progressBar.style

  // MTG mode: fantasy gradients + glow
  const mtgColors = {
    blue: { gradient: 'from-mana-blue to-arcane-purple', glow: 'shadow-[0_0_10px_rgba(14,104,171,0.6)]' },
    green: { gradient: 'from-mana-green to-emerald-400', glow: 'shadow-[0_0_10px_rgba(0,115,62,0.6)]' },
    red: { gradient: 'from-mana-red to-orange-500', glow: 'shadow-[0_0_10px_rgba(211,32,42,0.6)]' },
    white: { gradient: 'from-mana-white to-amber-200', glow: 'shadow-[0_0_10px_rgba(248,231,185,0.6)]' },
    black: { gradient: 'from-mana-black to-gray-700', glow: 'shadow-[0_0_10px_rgba(21,11,0,0.6)]' },
    gold: { gradient: 'from-arcane-gold to-yellow-400', glow: 'shadow-[0_0_10px_rgba(201,162,39,0.6)]' },
  }

  // Detailed mode: subtle single-tone, no glow
  const detailedColors = {
    blue: { gradient: 'from-blue-600 to-blue-500', glow: '' },
    green: { gradient: 'from-emerald-600 to-emerald-500', glow: '' },
    red: { gradient: 'from-red-600 to-red-500', glow: '' },
    white: { gradient: 'from-gray-400 to-gray-300', glow: '' },
    black: { gradient: 'from-gray-600 to-gray-500', glow: '' },
    gold: { gradient: 'from-yellow-600 to-yellow-500', glow: '' },
  }

  // Simple mode: flat single color, no glow
  const simpleColors = {
    blue: { gradient: 'bg-blue-500', glow: '' },
    green: { gradient: 'bg-green-500', glow: '' },
    red: { gradient: 'bg-red-500', glow: '' },
    white: { gradient: 'bg-gray-400', glow: '' },
    black: { gradient: 'bg-gray-600', glow: '' },
    gold: { gradient: 'bg-amber-500', glow: '' },
  }

  const colorMap = barStyle === 'glow' ? mtgColors : barStyle === 'subtle' ? detailedColors : simpleColors
  const colors = colorMap[manaType]
  const useGradientClass = barStyle !== 'flat'

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
      <div
        className="mana-bar"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label || `Progress: ${current} of ${total}`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            useGradientClass && 'bg-gradient-to-r',
            colors.gradient,
            isFull && colors.glow
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isFull && (
        <p
          className={cn(
            'text-xs mt-1 text-center',
            barStyle === 'glow' && 'animate-pulse'
          )}
          style={{ color: 'var(--arcane-gold)' }}
        >
          {config.progress.completionText}
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
