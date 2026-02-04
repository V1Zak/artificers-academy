'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  getLevel,
  getPhaseContent,
  validateCode,
  type Level,
  type Phase,
  type PhaseContentResponse,
  type ValidationResponse,
} from '@/lib/api'
import { CounterspellAlert, ResolveAlert } from '@/components/theme'

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

export default function PhasePage() {
  const params = useParams()
  const router = useRouter()
  const levelId = params.levelId as string
  const phaseId = params.phaseId as string

  const [level, setLevel] = useState<Level | null>(null)
  const [content, setContent] = useState<PhaseContentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editor state
  const [code, setCode] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null)
  const [validating, setValidating] = useState(false)

  // Find current phase and navigation
  const currentPhaseIndex = level?.phases.findIndex((p) => p.id === phaseId) ?? -1
  const currentPhase = level?.phases[currentPhaseIndex]
  const prevPhase = currentPhaseIndex > 0 ? level?.phases[currentPhaseIndex - 1] : null
  const nextPhase = level?.phases[currentPhaseIndex + 1]

  useEffect(() => {
    async function loadContent() {
      setLoading(true)
      setError(null)
      try {
        const [levelData, phaseData] = await Promise.all([
          getLevel(levelId),
          getPhaseContent(levelId, phaseId),
        ])
        setLevel(levelData)
        setContent(phaseData)
      } catch (err) {
        setError('Failed to load content')
      } finally {
        setLoading(false)
      }
    }
    loadContent()
  }, [levelId, phaseId])

  const handleValidate = useCallback(async () => {
    if (!code.trim()) return

    setValidating(true)
    setValidationResult(null)

    try {
      const result = await validateCode(code)
      setValidationResult(result)
    } catch (err) {
      setError('Failed to validate code')
    } finally {
      setValidating(false)
    }
  }, [code])

  const handleCompletePhase = useCallback(() => {
    // TODO: Save progress to backend
    if (nextPhase) {
      router.push(`/battlefield/${levelId}/${nextPhase.id}`)
    } else {
      router.push(`/battlefield/${levelId}`)
    }
  }, [levelId, nextPhase, router])

  if (loading) {
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
              <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          ) : (
            'Complete Level'
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Simple markdown renderer for tutorial content
 */
function MarkdownContent({ content }: { content: string }) {
  // Basic markdown parsing - in production, use a proper markdown library
  const html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-scroll-bg/50 border border-scroll-border rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm font-mono">${escapeHtml(code.trim())}</code></pre>`
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-scroll-bg/50 px-1.5 py-0.5 rounded text-sm font-mono text-arcane-purple">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-mana-blue hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Tables (basic support)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean).map(c => c.trim())
      if (cells.every(c => c.match(/^-+$/))) {
        return '' // Skip separator rows
      }
      const cellHtml = cells.map(c => `<td class="border border-scroll-border/50 px-4 py-2">${c}</td>`).join('')
      return `<tr>${cellHtml}</tr>`
    })
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-scroll-border" />')
    // Paragraphs (wrap remaining text)
    .replace(/^(?!<[h|p|u|o|l|t|c|d|s|b|a|e|i])(.*[^\n])$/gm, '<p class="my-4 leading-relaxed">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p class="my-4 leading-relaxed"><\/p>/g, '')

  return (
    <div
      className="prose prose-scroll max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
