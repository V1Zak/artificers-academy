'use client'

import { useState } from 'react'
import { CodeScrollEditable } from '@/components/theme/CodeScroll'
import { CounterspellAlert, ResolveAlert } from '@/components/theme/CounterspellAlert'
import { validateCode, type ValidationResponse } from '@/lib/api'

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

  const handleValidate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await validateCode(code)
      setResult(response)
    } catch (err) {
      setError('Failed to connect to the Inspector. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">The Inspector</h1>
      <p className="text-scroll-text/70 mb-8">
        Submit your Decklist for validation. The Inspector will analyze your
        spells and identify any issues.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Decklist</h2>
          <CodeScrollEditable
            value={code}
            onChange={setCode}
            className="mb-4"
          />
          <button
            onClick={handleValidate}
            disabled={loading || !code.trim()}
            className="btn-arcane disabled:opacity-50"
          >
            {loading ? 'Inspecting...' : 'Submit for Inspection'}
          </button>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Inspector&apos;s Verdict</h2>

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
            <div className="scroll-container p-6 text-center text-scroll-text/60">
              <p>Submit your code to receive the Inspector&apos;s verdict</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ReferenceCard
            title="Sorceries"
            decorator="@mcp.tool()"
            description="Executable functions the Planeswalker can invoke"
          />
          <ReferenceCard
            title="Permanents"
            decorator="@mcp.resource(uri)"
            description="Read-only data accessible via URI"
          />
          <ReferenceCard
            title="Tutors"
            decorator="@mcp.prompt()"
            description="Pre-configured context templates"
          />
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
    <div className="scroll-container p-4">
      <h3 className="font-semibold mb-1">{title}</h3>
      <code className="text-sm text-arcane-purple">{decorator}</code>
      <p className="text-sm text-scroll-text/70 mt-2">{description}</p>
    </div>
  )
}
