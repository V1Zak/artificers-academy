'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface CodeScrollProps {
  code: string
  language?: string
  title?: string
  className?: string
}

export function CodeScroll({
  code,
  language = 'python',
  title,
  className,
}: CodeScrollProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className={cn('scroll-container overflow-hidden', className)}>
      {title && (
        <div className="px-4 py-2 border-b border-white/[0.06] bg-white/[0.03] flex items-center justify-between">
          <span className="text-sm font-semibold text-arcane-purple">
            {title}
          </span>
          <CopyButton copied={copied} onClick={handleCopy} />
        </div>
      )}
      <div className="code-scroll relative group">
        {!title && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton copied={copied} onClick={handleCopy} />
          </div>
        )}
        <pre className="whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2 py-1 text-xs rounded transition-all duration-200',
        copied
          ? 'text-mana-green bg-mana-green/10'
          : 'text-silver/40 hover:text-silver/70 hover:bg-white/[0.05]'
      )}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

interface CodeScrollEditableProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CodeScrollEditable({
  value,
  onChange,
  placeholder = '# Write your code here...',
  className,
}: CodeScrollEditableProps) {
  return (
    <div className={cn('scroll-container overflow-hidden', className)}>
      <div className="px-4 py-2 border-b border-white/[0.06] bg-white/[0.03]">
        <span className="text-sm font-semibold text-arcane-purple">
          Your Code
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-64 p-4 font-mono text-sm bg-black/30 text-silver resize-none focus:outline-none"
        spellCheck={false}
      />
    </div>
  )
}
