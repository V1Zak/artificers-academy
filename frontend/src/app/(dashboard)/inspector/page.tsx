'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { CounterspellAlert, ResolveAlert } from '@/components/theme/CounterspellAlert'
import { validateCode, type ValidationResponse } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'

// Dynamic import for Monaco to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@/components/editor/MonacoEditor').then((mod) => mod.MonacoEditor),
  {
    ssr: false,
    loading: () => (
      <div className="scroll-container h-[400px] flex items-center justify-center">
        <p style={{ color: 'var(--silver-muted)' }}>Loading editor...</p>
      </div>
    ),
  }
)

const EXAMPLE_CODE = `from fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
def hello(name: str) -> str:
    """
    Greet someone warmly.

    Args:
        name: The name of the person to greet

    Returns:
        A friendly greeting message
    """
    return f"Hello, {name}!"
`

export default function InspectorPage() {
  const [code, setCode] = useState(EXAMPLE_CODE)
  const [result, setResult] = useState<ValidationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { mode } = useMode()
  const config = getModeConfig(mode)

  const handleValidate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await validateCode(code)
      setResult(response)
      if (response.valid) {
        toast(config.inspector.success, 'success')
      } else {
        toast(config.inspector.failure(response.errors.length), 'error')
      }
    } catch (err) {
      setError('Failed to connect to the validator. Is the backend running?')
      toast('Failed to connect to the validator', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{config.headings.inspectorTitle}</h1>
      <p className="mb-8" style={{ color: 'var(--silver-muted)' }}>
        {config.headings.inspectorSubtitle}
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {config.editor.title}
          </h2>
          <MonacoEditor
            value={code}
            onChange={setCode}
            height="300px"
            title={config.editor.title}
            className="mb-4"
          />
          <button
            onClick={handleValidate}
            disabled={loading || !code.trim()}
            className="btn-arcane disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <LoadingSpinner />}
            {loading ? config.inspector.submitting : config.inspector.submitButton}
          </button>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {config.inspector.resultsHeading}
          </h2>

          {error && (
            <div className="counterspell-alert">
              <p className="text-sm text-mana-red">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.valid ? (
                <ResolveAlert
                  toolsFound={result.tools_found}
                  resourcesFound={result.resources_found}
                  promptsFound={result.prompts_found}
                />
              ) : (
                <CounterspellAlert errors={result.errors} />
              )}
            </div>
          )}

          {!result && !error && (
            <div className="scroll-container p-6 text-center" style={{ color: 'var(--silver-faint)' }}>
              <p>{config.inspector.emptyState}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {config.referenceCards.map((card) => (
            <ReferenceCard
              key={card.decorator}
              title={card.title}
              decorator={card.decorator}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ReferenceCard({
  title,
  decorator,
  description,
}: {
  title: string
  decorator: string
  description: string
}) {
  return (
    <div className="glass-card p-4">
      <h3 className="font-semibold mb-1">{title}</h3>
      <code className="text-sm font-mono" style={{ color: 'var(--arcane-purple)' }}>{decorator}</code>
      <p className="text-sm mt-2" style={{ color: 'var(--silver-muted)' }}>{description}</p>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
