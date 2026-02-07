'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// Debug mode controlled by environment variable
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

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
      <div className="h-8 bg-white/[0.06] rounded w-3/4 mx-auto mb-2" />
      <div className="h-4 bg-white/[0.06] rounded w-1/2 mx-auto mb-6" />
      <div className="space-y-4">
        <div className="h-10 bg-white/[0.06] rounded" />
        <div className="h-10 bg-white/[0.06] rounded" />
        <div className="h-10 bg-white/[0.06] rounded" />
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)
    setLoading(true)

    try {
      // Use Supabase client directly - this handles cookies automatically
      const supabase = createClient()

      console.log('[LOGIN DEBUG] Attempting login with Supabase client directly')

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.log('[LOGIN DEBUG] Auth error:', authError.message)
        setError(authError.message)
        setDebugInfo({ message: 'Auth failed', error: authError.message })
        setLoading(false)
        setShowDebug(true)
        return
      }

      console.log('[LOGIN DEBUG] Auth success! User:', data.user?.email)
      console.log('[LOGIN DEBUG] Session exists:', !!data.session)

      setDebugInfo({
        message: 'Login successful',
        userId: data.user?.id,
        email: data.user?.email || undefined,
      })
      setShowDebug(true)

      // Get redirect URL from query params, with validation
      const next = searchParams.get('next')
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

      // Wait a moment then redirect
      setTimeout(() => {
        window.location.href = safeNext
      }, 500)
    } catch (err) {
      console.error('[LOGIN DEBUG] Unexpected error:', err)
      setError('An unexpected error occurred')
      setDebugInfo({ message: 'Unexpected error', error: String(err) })
      setLoading(false)
      setShowDebug(true)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-2">
        Welcome Back, Planeswalker
      </h1>
      <p className="text-center text-silver/60 mb-6">
        Enter the Academy to continue your journey
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
            className="w-full px-4 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-silver placeholder:text-silver/30 focus:outline-none focus:ring-2 focus:ring-arcane-gold/50 focus:border-arcane-gold/30 transition-colors"
            placeholder="artificer@academy.com"
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
            className="w-full px-4 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-silver placeholder:text-silver/30 focus:outline-none focus:ring-2 focus:ring-arcane-gold/50 focus:border-arcane-gold/30 transition-colors"
            placeholder="Your secret incantation"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-arcane disabled:opacity-50"
        >
          {loading ? 'Summoning...' : 'Enter the Academy'}
        </button>
      </form>

      <p className="text-center text-sm mt-6">
        New to the Academy?{' '}
        <Link href="/signup" className="text-arcane-purple hover:underline">
          Begin your initiation
        </Link>
      </p>

      {/* Debug Bypass Button - only shown when DEBUG_MODE is enabled */}
      {DEBUG_MODE && (
        <div className="mt-8 pt-4 border-t border-white/[0.08]/30">
          <p className="text-xs text-silver/40 text-center mb-2">Development Debug</p>
          <button
            type="button"
            onClick={() => {
              document.cookie = 'debug-auth-bypass=artificer-debug-2024; path=/; max-age=3600'
              console.log('[DEBUG] Auth bypass cookie set')
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
