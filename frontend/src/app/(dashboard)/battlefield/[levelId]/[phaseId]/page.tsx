'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  getLevel,
  getPhaseContent,
  validateCode,
  type Level,
  type PhaseContentResponse,
  type ValidationResponse,
} from '@/lib/api'
import { CounterspellAlert, ResolveAlert } from '@/components/theme'
import { useProgress } from '@/contexts'

// Dynamic import for Monaco to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@/components/editor/MonacoEditor').then((mod) => mod.MonacoEditor),
  {
    ssr: false,
    loading: () => (
      <div className="scroll-container h-[400px] flex items-center justify-center">
        <p className="text-scroll-text/70">Loading editor...</p>
      </div>
    ),
  }
)

// Storage key for persisting code
const getStorageKey = (levelId: string, phaseId: string) =>
  `artificer-code-${levelId}-${phaseId}`

export default function PhasePage() {
  const params = useParams()
  const router = useRouter()
  const levelId = params.levelId as string
  const phaseId = params.phaseId as string

  // ==========================================
  // ALL STATE DECLARATIONS AT THE TOP
  // ==========================================
  const [level, setLevel] = useState<Level | null>(null)
  const [content, setContent] = useState<PhaseContentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editor state
  const [code, setCode] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null)
  const [validating, setValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Refs for cleanup and debouncing
  const abortControllerRef = useRef<AbortController | null>(null)
  const validateDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const codeInitializedRef = useRef(false)

  // Progress context
  const {
    getSavedCode,
    completePhase,
    saveCode: saveCodeToServer,
    loading: progressLoading,
  } = useProgress()

  // ==========================================
  // DERIVED STATE (computed from state)
  // ==========================================
  const currentPhaseIndex = level?.phases.findIndex((p) => p.id === phaseId) ?? -1
  const currentPhase = level?.phases[currentPhaseIndex]
  const prevPhase = currentPhaseIndex > 0 ? level?.phases[currentPhaseIndex - 1] : null
  const nextPhase = level?.phases[currentPhaseIndex + 1]

  // ==========================================
  // EFFECTS
  // ==========================================

  // Load content with proper cleanup
  useEffect(() => {
    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    async function loadContent() {
      setLoading(true)
      setError(null)

      try {
        const [levelData, phaseData] = await Promise.all([
          getLevel(levelId, { signal: controller.signal }),
          getPhaseContent(levelId, phaseId, { signal: controller.signal }),
        ])

        // Don't update state if aborted
        if (controller.signal.aborted) return

        setLevel(levelData)
        setContent(phaseData)
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') return

        setError('Failed to load content. Is the backend running?')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadContent()

    // Cleanup on unmount or dependency change
    return () => {
      controller.abort()
    }
  }, [levelId, phaseId])

  // Load saved code: prioritize server-saved, fallback to localStorage
  useEffect(() => {
    if (codeInitializedRef.current) return
    if (progressLoading) return // Wait for progress to load

    // First, try to get server-saved code
    const serverCode = getSavedCode(levelId, phaseId)
    if (serverCode) {
      setCode(serverCode)
      codeInitializedRef.current = true
      return
    }

    // Fallback to localStorage
    const storageKey = getStorageKey(levelId, phaseId)
    const localCode = localStorage.getItem(storageKey)
    if (localCode) {
      setCode(localCode)
    }

    codeInitializedRef.current = true
  }, [levelId, phaseId, progressLoading, getSavedCode])

  // Save code to localStorage when it changes (immediate backup)
  useEffect(() => {
    if (!codeInitializedRef.current) return
    if (!code) return

    const storageKey = getStorageKey(levelId, phaseId)
    localStorage.setItem(storageKey, code)
  }, [code, levelId, phaseId])

  // Debounced save to server (every 5 seconds after last change)
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (!codeInitializedRef.current) return
    if (!code) return

    // Clear previous debounce
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current)
    }

    // Debounce server save (5 seconds)
    saveDebounceRef.current = setTimeout(() => {
      saveCodeToServer(levelId, phaseId, code).catch(() => {
        // Silently fail - localStorage backup exists
      })
    }, 5000)

    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current)
      }
    }
  }, [code, levelId, phaseId, saveCodeToServer])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (validateDebounceRef.current) {
        clearTimeout(validateDebounceRef.current)
      }
    }
  }, [])

  // ==========================================
  // CALLBACKS
  // ==========================================

  const handleValidate = useCallback(async () => {
    if (!code.trim()) return
    if (validating) return // Prevent double submission

    setValidating(true)
    setValidationResult(null)
    setValidationError(null)

    try {
      const result = await validateCode(code)
      setValidationResult(result)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setValidationError('Failed to validate code. Is the backend running?')
    } finally {
      setValidating(false)
    }
  }, [code, validating])

  // Debounced validation for keyboard shortcut
  const handleValidateDebounced = useCallback(() => {
    if (validateDebounceRef.current) {
      clearTimeout(validateDebounceRef.current)
    }

    validateDebounceRef.current = setTimeout(() => {
      handleValidate()
    }, 300)
  }, [handleValidate])

  const handleCompletePhase = useCallback(async () => {
    try {
      // Save progress to server with code snapshot
      await completePhase(levelId, phaseId, code || undefined)
    } catch (err) {
      // Log error but don't block navigation - localStorage has a backup
      console.error('Failed to save progress:', err)
    }

    if (nextPhase) {
      router.push(`/battlefield/${levelId}/${nextPhase.id}`)
    } else {
      router.push(`/battlefield/${levelId}`)
    }
  }, [levelId, phaseId, code, nextPhase, router, completePhase])

  // ==========================================
  // RENDER
  // ==========================================

  if (loading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">📜</div>
          <p className="text-scroll-text/70">Loading phase content...</p>
        </div>
      </div>
    )
  }

  if (error || !content || !level) {
    return (
      <div className="scroll-container p-8 text-center">
        <p className="text-mana-red mb-4">{error || 'Content not found'}</p>
        <Link href={`/battlefield/${levelId}`} className="btn-arcane">
          Return to Level
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/battlefield/${levelId}`}
          className="inline-flex items-center gap-2 text-scroll-text/70 hover:text-scroll-text"
        >
          <ChevronLeftIcon />
          {level.title}
        </Link>
        <span className="text-sm text-scroll-text/60">
          Phase {currentPhaseIndex + 1} of {level.phases.length}
        </span>
      </div>

      {/* Phase Header */}
      <div className="mb-8">
        <p className="text-arcane-purple font-medium mb-1">
          {currentPhase?.type === 'lesson' ? '📖 Lesson' : '⚗️ Tutorial'}
        </p>
        <h1 className="text-3xl font-bold">{content.title}</h1>
      </div>

      {/* Content */}
      <div className="scroll-container p-8 mb-8">
        <MarkdownContent content={content.content} />
      </div>

      {/* Code Editor (for tutorial phases with validation) */}
      {currentPhase?.validation_required && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Code</h2>
          <MonacoEditor
            value={code}
            onChange={setCode}
            height="400px"
            onValidate={handleValidateDebounced}
          />

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleValidate}
              disabled={validating || !code.trim()}
              className="btn-arcane disabled:opacity-50"
            >
              {validating ? 'Validating...' : 'Validate Code'}
            </button>
            {validationResult?.valid && (
              <span className="text-mana-green font-medium">
                ✓ Code is valid!
              </span>
            )}
          </div>

          {/* Validation Results */}
          {validationError && (
            <div className="mt-6 counterspell-alert">
              <p className="text-sm text-mana-red">{validationError}</p>
            </div>
          )}
          {validationResult && (
            <div className="mt-6">
              {validationResult.valid ? (
                <ResolveAlert
                  toolsFound={validationResult.tools_found}
                  resourcesFound={validationResult.resources_found}
                  promptsFound={validationResult.prompts_found}
                />
              ) : (
                <CounterspellAlert errors={validationResult.errors} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-scroll-border">
        {prevPhase ? (
          <Link
            href={`/battlefield/${levelId}/${prevPhase.id}`}
            className="inline-flex items-center gap-2 text-scroll-text/70 hover:text-scroll-text"
          >
            <ChevronLeftIcon />
            Previous: {prevPhase.title}
          </Link>
        ) : (
          <div />
        )}

        <button
          onClick={handleCompletePhase}
          disabled={currentPhase?.validation_required && !validationResult?.valid}
          className="btn-arcane disabled:opacity-50"
        >
          {nextPhase ? (
            <>
              Next: {nextPhase.title}
              <ChevronRightIcon className="ml-2" />
            </>
          ) : (
            'Complete Level'
          )}
        </button>
      </div>
    </div>
  )
}

// ==========================================
// ICON COMPONENTS
// ==========================================

function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  )
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 inline ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  )
}

// ==========================================
// MARKDOWN RENDERER
// ==========================================

/**
 * Simple markdown renderer for tutorial content.
 *
 * Note: This is a basic regex-based parser for MVP. For production,
 * consider using react-markdown or similar library for:
 * - Nested structures (lists within lists)
 * - GFM features (task lists, strikethrough)
 * - Syntax highlighting in code blocks
 *
 * Content is trusted (from our own markdown files), so dangerouslySetInnerHTML
 * is acceptable here. User-generated content should use a sanitizing library.
 */
function MarkdownContent({ content }: { content: string }) {
  const html = useMemo(() => parseMarkdown(content), [content])

  return (
    <div
      className="prose prose-scroll max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function parseMarkdown(content: string): string {
  let html = content

  // Code blocks (must be first to protect code content)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-scroll-bg/50 border border-scroll-border rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm font-mono">${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code (protect before other transformations)
  const inlineCodePlaceholders: string[] = []
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodePlaceholders.length}__`
    inlineCodePlaceholders.push(
      `<code class="bg-scroll-bg/50 px-1.5 py-0.5 rounded text-sm font-mono text-arcane-purple">${escapeHtml(code)}</code>`
    )
    return placeholder
  })

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<![*])\*([^*]+)\*(?![*])/g, '<em>$1</em>')

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-mana-blue hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // Unordered lists - wrap in <ul>
  html = html.replace(/((?:^\- .+$\n?)+)/gm, (match) => {
    const items = match
      .split('\n')
      .filter(Boolean)
      .map((line) => line.replace(/^\- (.*)$/, '<li>$1</li>'))
      .join('')
    return `<ul class="list-disc ml-6 my-4">${items}</ul>`
  })

  // Ordered lists - wrap in <ol>
  html = html.replace(/((?:^\d+\. .+$\n?)+)/gm, (match) => {
    const items = match
      .split('\n')
      .filter(Boolean)
      .map((line) => line.replace(/^\d+\. (.*)$/, '<li>$1</li>'))
      .join('')
    return `<ol class="list-decimal ml-6 my-4">${items}</ol>`
  })

  // Tables - wrap properly
  html = html.replace(/((?:\|.+\|\n?)+)/g, (match) => {
    const rows = match.trim().split('\n')
    let tableHtml = '<table class="w-full my-4 border-collapse">'
    let isHeader = true

    for (const row of rows) {
      const cells = row.split('|').filter(Boolean).map((c) => c.trim())

      // Skip separator row
      if (cells.every((c) => /^-+$/.test(c))) {
        isHeader = false
        continue
      }

      const tag = isHeader ? 'th' : 'td'
      const cellClass = isHeader
        ? 'border border-scroll-border/50 px-4 py-2 bg-scroll-bg/30 font-semibold text-left'
        : 'border border-scroll-border/50 px-4 py-2'

      const cellsHtml = cells
        .map((c) => `<${tag} class="${cellClass}">${c}</${tag}>`)
        .join('')
      tableHtml += `<tr>${cellsHtml}</tr>`

      if (isHeader) isHeader = false
    }

    tableHtml += '</table>'
    return tableHtml
  })

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-scroll-border" />')

  // Paragraphs - wrap standalone text lines
  html = html.replace(
    /^(?!<[a-z]|__|$)(.+)$/gm,
    '<p class="my-4 leading-relaxed">$1</p>'
  )

  // Restore inline code
  inlineCodePlaceholders.forEach((code, i) => {
    html = html.replace(`__INLINE_CODE_${i}__`, code)
  })

  // Clean up empty paragraphs and extra whitespace
  html = html.replace(/<p class="my-4 leading-relaxed"><\/p>/g, '')
  html = html.replace(/\n{3,}/g, '\n\n')

  return html
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
