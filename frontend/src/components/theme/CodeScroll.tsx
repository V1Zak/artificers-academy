'use client'

import { cn } from '@/lib/utils'

interface CodeScrollProps {
  code: string
  language?: string
  title?: string
  className?: string
}

/**
 * CodeScroll - A parchment-styled code display component
 *
 * Displays code in the aesthetic of an ancient scroll,
 * befitting the Grand Artificer's documentation style.
 */
export function CodeScroll({
  code,
  language = 'python',
  title,
  className,
}: CodeScrollProps) {
  return (
    <div className={cn('scroll-container overflow-hidden', className)}>
      {title && (
        <div className="px-4 py-2 border-b border-scroll-border bg-scroll-bg/50">
          <span className="text-sm font-semibold text-arcane-purple">
            {title}
          </span>
        </div>
      )}
      <div className="code-scroll">
        <pre className="whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

interface CodeScrollEditableProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Editable version of CodeScroll for user input
 */
export function CodeScrollEditable({
  value,
  onChange,
  placeholder = '# Write your spell here, Artificer...',
  className,
}: CodeScrollEditableProps) {
  return (
    <div className={cn('scroll-container overflow-hidden', className)}>
      <div className="px-4 py-2 border-b border-scroll-border bg-scroll-bg/50">
        <span className="text-sm font-semibold text-arcane-purple">
          Your Decklist
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-64 p-4 font-mono text-sm bg-[#FDF8F0] text-scroll-text resize-none focus:outline-none"
        spellCheck={false}
      />
    </div>
  )
}
