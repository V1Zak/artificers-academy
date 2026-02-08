'use client'

import { cn } from '@/lib/utils'
import type { ValidationError } from '@/lib/api'
import { useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'
import { TypewriterText } from './TypewriterText'

interface CounterspellAlertProps {
  errors: ValidationError[]
  className?: string
}

/**
 * CounterspellAlert - Display validation errors with mode-aware text
 */
export function CounterspellAlert({ errors, className }: CounterspellAlertProps) {
  const { mode } = useMode()
  const config = getModeConfig(mode)

  if (errors.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-mana-red">
        <AlertIcon />
        <span className="font-semibold">
          <TypewriterText text={config.validation.errorCountHeader(errors.length)} />
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
                {config.validation.errorTitles[error.type] || config.validation.defaultErrorTitle}
              </p>
              <p className="text-sm text-silver/70 mt-1">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AlertIcon() {
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
 * ResolveAlert - Display successful validation results with mode-aware text
 */
export function ResolveAlert({
  toolsFound,
  resourcesFound,
  promptsFound,
  className,
}: ResolveAlertProps) {
  const { mode } = useMode()
  const config = getModeConfig(mode)

  const totalFound = toolsFound.length + resourcesFound.length + promptsFound.length

  if (totalFound === 0) return null

  return (
    <div className={cn('resolve-alert', className)}>
      <div className="flex items-center gap-2 text-mana-green mb-3">
        <SuccessIcon />
        <span className="font-semibold">
          <TypewriterText text={config.validation.successHeader} />
        </span>
      </div>

      {toolsFound.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-silver">
            {config.validation.toolsLabel} ({toolsFound.length}):
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
          <p className="text-sm font-medium text-silver">
            {config.validation.resourcesLabel} ({resourcesFound.length}):
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
          <p className="text-sm font-medium text-silver">
            {config.validation.promptsLabel} ({promptsFound.length}):
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

function SuccessIcon() {
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
