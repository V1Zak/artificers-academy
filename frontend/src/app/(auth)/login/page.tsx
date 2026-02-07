'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getModeConfig } from '@/lib/mode-config'
import type { LearningMode } from '@/lib/api'

// Debug mode controlled by environment variable
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

function getStoredMode(): LearningMode {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('learning-mode')
    if (stored === 'simple' || stored === 'detailed' || stored === 'mtg') return stored
  }
  return 'mtg'
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 rounded w-3/4 mx-auto mb-2" style={{ backgroundColor: 'var(--obsidian)' }} />
      <div className="h-4 rounded w-1/2 mx-auto mb-6" style={{ backgroundColor: 'var(--obsidian)' }} />
      <div className="space-y-4">
        <div className="h-10 rounded" style={{ backgroundColor: 'var(--obsidian)' }} />
        <div className="h-10 rounded" style={{ backgroundColor: 'var(--obsidian)' }} />
        <div className="h-10 rounded" style={{ backgroundColor: 'var(--obsidian)' }} />
      </div>
    </div>
  )
}

interface DebugInfo {
  message: string
  userId?: string
  email?: string
  error?: string
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const searchParams = useSearchParams()
  const config = getModeConfig(getStoredMode())

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setDebugInfo({ message: 'Auth failed', error: authError.message })
        setLoading(false)
        setShowDebug(true)
        return
      }

      setDebugInfo({
        message: 'Login successful',
        userId: data.user?.id,
        email: data.user?.email || undefined,
      })
      setShowDebug(true)

      const next = searchParams.get('next')
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

      setTimeout(() => {
        window.location.href = safeNext
      }, 500)
    } catch (err) {
      console.error('[LOGIN] Unexpected error:', err)
      setError('An unexpected error occurred')
      setDebugInfo({ message: 'Unexpected error', error: String(err) })
      setLoading(false)
      setShowDebug(true)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-2">
        {config.auth.loginHeading}
      </h1>
      <p className="text-center mb-6" style={{ color: 'var(--silver-muted)' }}>
        {config.auth.loginSubtext}
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="counterspell-alert">
            <p className="text-sm text-mana-red">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
            style={{
              border: '1px solid var(--obsidian-border)',
              backgroundColor: 'var(--obsidian)',
              color: 'var(--silver)',
            }}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
            style={{
              border: '1px solid var(--obsidian-border)',
              backgroundColor: 'var(--obsidian)',
              color: 'var(--silver)',
            }}
            placeholder="Your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-arcane disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--silver-muted)' }}>
        New here?{' '}
        <Link href="/signup" className="hover:underline" style={{ color: 'var(--arcane-purple)' }}>
          Create an account
        </Link>
      </p>

      {/* Debug Bypass Button - only shown when DEBUG_MODE is enabled */}
      {DEBUG_MODE && (
        <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--obsidian-border)' }}>
          <p className="text-xs text-center mb-2" style={{ color: 'var(--silver-faint)' }}>Development Debug</p>
          <button
            type="button"
            onClick={() => {
              document.cookie = 'debug-auth-bypass=artificer-debug-2024; path=/; max-age=3600'
              window.location.href = '/dashboard'
            }}
            className="w-full px-4 py-2 text-sm bg-yellow-500/20 text-yellow-700 border border-yellow-500/50 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            Debug: Bypass Auth
          </button>
        </div>
      )}

      {/* Debug Panel - only shown when DEBUG_MODE is enabled */}
      {DEBUG_MODE && showDebug && debugInfo && (
        <div className="mt-6 p-4 bg-black/80 text-white text-xs rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-yellow-400">Debug Info</span>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className={`mb-2 ${debugInfo.error ? 'text-red-400' : 'text-green-400'}`}>
            {debugInfo.message}
          </div>

          {debugInfo.userId && (
            <div className="text-blue-300">User ID: {debugInfo.userId}</div>
          )}
          {debugInfo.email && (
            <div className="text-blue-300">Email: {debugInfo.email}</div>
          )}
          {debugInfo.error && (
            <div className="text-red-300">Error: {debugInfo.error}</div>
          )}
        </div>
      )}
    </>
  )
}
