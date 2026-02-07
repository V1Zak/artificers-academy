'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
import { CounterspellAlert, ResolveAlert, MarkdownRenderer } from '@/components/theme'
import { useProgress } from '@/contexts'
import { SkeletonText } from '@/components/ui/Skeleton'

// Dynamic import for Monaco to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@/components/editor/MonacoEditor').then((mod) => mod.MonacoEditor),
  {
    ssr: false,
    loading: () => (
      <div className="scroll-container h-[400px] flex items-center justify-center">
        <p className="text-silver/60">Loading editor...</p>
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
  const [showHints, setShowHints] = useState(false)

  // Refs for cleanup and debouncing
  const abortControllerRef = useRef<AbortController | null>(null)
  const validateDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null)
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

  // Reset code initialization when navigating to different phase
  useEffect(() => {
    codeInitializedRef.current = false
    setCode('') // Clear previous phase's code
    setValidationResult(null)
    setValidationError(null)
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-4 w-20 bg-white/[0.06] rounded animate-pulse" />
        </div>
        <div className="mb-8 space-y-2">
          <div className="h-4 w-20 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-8 w-80 bg-white/[0.06] rounded animate-pulse" />
        </div>
        <div className="glass-card p-8 mb-8">
          <SkeletonText lines={8} />
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
          className="inline-flex items-center gap-2 text-silver/60 hover:text-silver"
        >
          <ChevronLeftIcon />
          {level.title}
        </Link>
        <span className="text-sm text-silver/50">
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
        <MarkdownRenderer content={content.content} />
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

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleValidate}
              disabled={validating || !code.trim()}
              className="btn-arcane disabled:opacity-50 min-h-[44px]"
            >
              {validating ? 'Validating...' : 'Validate Code'}
            </button>
            <button
              onClick={() => setShowHints(!showHints)}
              className="px-4 py-2 text-sm border border-arcane-gold/50 text-arcane-gold rounded-lg hover:bg-arcane-gold/10 transition-colors min-h-[44px]"
            >
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </button>
            {validationResult?.valid && (
              <span className="text-mana-green font-medium">
                ✓ Code is valid!
              </span>
            )}
          </div>

          {/* Hints Panel */}
          {showHints && (
            <div className="mt-4 p-4 bg-arcane-gold/10 border border-arcane-gold/30 rounded-lg">
              <h3 className="font-semibold text-arcane-gold mb-3">Hints from the Grand Artificer</h3>
              <PhaseHints levelId={levelId} phaseId={phaseId} />
            </div>
          )}

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/[0.06]">
        {prevPhase ? (
          <Link
            href={`/battlefield/${levelId}/${prevPhase.id}`}
            className="inline-flex items-center gap-2 text-silver/60 hover:text-silver min-h-[44px]"
          >
            <ChevronLeftIcon />
            <span className="hidden sm:inline">Previous: </span>{prevPhase.title}
          </Link>
        ) : (
          <div />
        )}

        <button
          onClick={handleCompletePhase}
          disabled={currentPhase?.validation_required && !validationResult?.valid}
          className="btn-arcane disabled:opacity-50 min-h-[44px]"
        >
          {nextPhase ? (
            <>
              <span className="hidden sm:inline">Next: </span>{nextPhase.title}
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
// HINTS COMPONENT
// ==========================================

interface HintData {
  hints: string[]
  starterCode?: string
}

const PHASE_HINTS: Record<string, Record<string, HintData>> = {
  level1: {
    phase3: {
      hints: [
        "Start by importing FastMCP: from fastmcp import FastMCP",
        "Create your server instance: mcp = FastMCP('mtg-oracle')",
        "Use the @mcp.tool() decorator to define your search function",
        "Your tool function needs a detailed docstring - this becomes the 'Oracle Text' that Claude reads",
        "Use httpx for async HTTP requests to the Scryfall API",
        "The Scryfall API endpoint is: https://api.scryfall.com/cards/named?fuzzy={card_name}",
        "Don't forget to handle errors gracefully - what if the card isn't found?",
      ],
      starterCode: `from fastmcp import FastMCP
import httpx

mcp = FastMCP("mtg-oracle")

@mcp.tool()
async def search_card(card_name: str) -> str:
    """
    Search for a Magic: The Gathering card by name.

    This tool queries the Scryfall API to find card information
    including oracle text, mana cost, and type line.

    Args:
        card_name: The name of the card to search for (fuzzy matching supported)

    Returns:
        Card information including name, mana cost, type, and oracle text
    """
    # Your implementation here
    pass
`,
    },
  },
}

function PhaseHints({ levelId, phaseId }: { levelId: string; phaseId: string }) {
  const [revealedHints, setRevealedHints] = useState(0)
  const [showStarter, setShowStarter] = useState(false)

  const hintData = PHASE_HINTS[levelId]?.[phaseId]

  if (!hintData) {
    return (
      <p className="text-silver/60 text-sm">
        No hints available for this phase. You&apos;ve got this, Artificer!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progressive hints */}
      <div className="space-y-2">
        {hintData.hints.slice(0, revealedHints).map((hint, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className="text-arcane-gold font-bold">{i + 1}.</span>
            <span className="text-silver">{hint}</span>
          </div>
        ))}
      </div>

      {revealedHints < hintData.hints.length && (
        <button
          onClick={() => setRevealedHints(revealedHints + 1)}
          className="text-sm text-arcane-purple hover:underline"
        >
          Reveal next hint ({revealedHints + 1} of {hintData.hints.length})
        </button>
      )}

      {/* Starter code */}
      {hintData.starterCode && (
        <div className="mt-4 pt-4 border-t border-arcane-gold/20">
          <button
            onClick={() => setShowStarter(!showStarter)}
            className="text-sm text-arcane-purple hover:underline"
          >
            {showStarter ? 'Hide starter code' : 'Show starter code template'}
          </button>

          {showStarter && (
            <pre className="mt-2 p-3 bg-black/30 border border-white/[0.06] rounded text-xs overflow-x-auto">
              <code>{hintData.starterCode}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
