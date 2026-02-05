'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
      <div className="h-8 bg-scroll-border/30 rounded w-3/4 mx-auto mb-2" />
      <div className="h-4 bg-scroll-border/30 rounded w-1/2 mx-auto mb-6" />
      <div className="space-y-4">
        <div className="h-10 bg-scroll-border/30 rounded" />
        <div className="h-10 bg-scroll-border/30 rounded" />
        <div className="h-10 bg-scroll-border/30 rounded" />
      </div>
    </div>
  )
}

interface DebugInfo {
  debug?: string[]
  cookieInfo?: { name: string; valueLength: number; willBeSet: boolean }
  success?: boolean
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      setDebugInfo(data)

      console.log('[LOGIN DEBUG] Response status:', response.status)
      console.log('[LOGIN DEBUG] Response data:', data)

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        setShowDebug(true)
        return
      }

      // Use Supabase client to set session - this ensures cookies are in the correct format
      if (data.session?.access_token && data.session?.refresh_token) {
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })

        if (sessionError) {
          console.log('[LOGIN DEBUG] Failed to set session:', sessionError.message)
          setError('Failed to establish session')
          setLoading(false)
          return
        }

        console.log('[LOGIN DEBUG] Session set via Supabase client')
      }

      setShowDebug(true)

      // Get redirect URL from query params, with validation
      const next = searchParams.get('next')
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

      // Wait a moment then redirect
      setTimeout(() => {
        window.location.href = safeNext
      }, 1000)
    } catch (err) {
      console.error('[LOGIN DEBUG] Fetch error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-2">
        Welcome Back, Planeswalker
      </h1>
      <p className="text-center text-scroll-text/70 mb-6">
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
            className="w-full px-4 py-2 border border-scroll-border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-arcane-gold"
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
            className="w-full px-4 py-2 border border-scroll-border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-arcane-gold"
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

      {/* Debug Bypass Button */}
      <div className="mt-8 pt-4 border-t border-scroll-border/30">
        <p className="text-xs text-scroll-text/50 text-center mb-2">Development Debug</p>
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

      {/* Debug Panel */}
      {showDebug && debugInfo && (
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

          <div className={`mb-2 ${debugInfo.success ? 'text-green-400' : 'text-red-400'}`}>
            Status: {debugInfo.success ? 'SUCCESS' : 'FAILED'}
          </div>

          {debugInfo.cookieInfo && (
            <div className="mb-2 text-blue-300">
              Cookie: {debugInfo.cookieInfo.name} ({debugInfo.cookieInfo.valueLength} chars)
            </div>
          )}

          <div className="border-t border-white/20 pt-2 mt-2 space-y-1">
            {debugInfo.debug?.map((log, i) => (
              <div key={i} className="text-gray-300">{log}</div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
