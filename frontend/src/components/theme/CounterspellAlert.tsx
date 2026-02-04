'use client'

import { cn } from '@/lib/utils'
import type { ValidationError } from '@/lib/api'

interface CounterspellAlertProps {
  errors: ValidationError[]
  className?: string
}

/**
 * CounterspellAlert - Display validation errors as "counterspells"
 *
 * In the language of the Grand Artificer, errors are spells
 * that have been countered - failed incantations that need correction.
 */
export function CounterspellAlert({ errors, className }: CounterspellAlertProps) {
  if (errors.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-mana-red">
        <CounterspellIcon />
        <span className="font-semibold">
          {errors.length} Counterspell{errors.length > 1 ? 's' : ''} Detected
        </span>
      </div>
      {errors.map((error, index) => (
        <div key={index} className="counterspell-alert">
          <div className="flex items-start gap-3">
            <span className="text-mana-red font-mono text-sm">
              {error.line ? `Line ${error.line}` : 'Global'}
            </span>
            <div>
              <p className="text-sm font-medium text-mana-red/90">
                {getErrorTitle(error.type)}
              </p>
              <p className="text-sm text-scroll-text/80 mt-1">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function getErrorTitle(type: string): string {
  const titles: Record<string, string> = {
    syntax_error: 'Forbidden Runes',
    missing_import: 'Missing Mana Source',
    missing_instance: 'Unbound Library',
    empty_deck: 'Empty Decklist',
    missing_docstring: 'Missing Oracle Text',
    short_docstring: 'Insufficient Oracle Text',
    invalid_resource_uri: 'Invalid Permanent Binding',
    missing_resource_uri: 'Unbound Permanent',
  }
  return titles[type] || 'Spell Fizzled'
}

function CounterspellIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  )
}

interface ResolveAlertProps {
  toolsFound: string[]
  resourcesFound: string[]
  promptsFound: string[]
  className?: string
}

/**
 * ResolveAlert - Display successful validation results
 */
export function ResolveAlert({
  toolsFound,
  resourcesFound,
  promptsFound,
  className,
}: ResolveAlertProps) {
  const totalFound = toolsFound.length + resourcesFound.length + promptsFound.length

  if (totalFound === 0) return null

  return (
    <div className={cn('resolve-alert', className)}>
      <div className="flex items-center gap-2 text-mana-green mb-3">
        <ResolveIcon />
        <span className="font-semibold">Spell Resolves Successfully!</span>
      </div>

      {toolsFound.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-scroll-text">
            Sorceries Discovered ({toolsFound.length}):
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {toolsFound.map((tool) => (
              <span
                key={tool}
                className="px-2 py-1 bg-mana-blue/10 text-mana-blue text-xs rounded font-mono"
              >
                @tool {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {resourcesFound.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-scroll-text">
            Permanents Discovered ({resourcesFound.length}):
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {resourcesFound.map((resource) => (
              <span
                key={resource}
                className="px-2 py-1 bg-mana-green/10 text-mana-green text-xs rounded font-mono"
              >
                @resource {resource}
              </span>
            ))}
          </div>
        </div>
      )}

      {promptsFound.length > 0 && (
        <div>
          <p className="text-sm font-medium text-scroll-text">
            Tutors Discovered ({promptsFound.length}):
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {promptsFound.map((prompt) => (
              <span
                key={prompt}
                className="px-2 py-1 bg-arcane-purple/10 text-arcane-purple text-xs rounded font-mono"
              >
                @prompt {prompt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResolveIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
