'use client'

import { useEffect, useState } from 'react'

interface AuthStatus {
  authenticated: boolean
  user: { id: string; email: string } | null
  cookieCount: number
  hasAuthCookie: boolean
  debug: string[]
  error?: string
}

export function AuthDebugIndicator() {
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      setStatus({
        authenticated: false,
        user: null,
        cookieCount: 0,
        hasAuthCookie: false,
        debug: ['Failed to fetch status'],
        error: String(err),
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" title="Checking auth..." />
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Indicator dot */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all ${
          status?.authenticated ? 'bg-green-500' : 'bg-red-500'
        } hover:scale-110`}
        title={status?.authenticated ? 'Logged in' : 'Not logged in'}
      />

      {/* Expanded debug panel */}
      {expanded && (
        <div className="absolute bottom-10 right-0 w-80 bg-black/90 text-white text-xs rounded-lg shadow-xl p-4 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">Auth Debug</span>
            <button onClick={checkStatus} className="text-blue-400 hover:underline">
              Refresh
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${status?.authenticated ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{status?.authenticated ? 'Authenticated' : 'Not Authenticated'}</span>
            </div>

            {status?.user && (
              <div className="bg-white/10 p-2 rounded">
                <div>User: {status.user.email}</div>
                <div className="text-gray-400 truncate">ID: {status.user.id}</div>
              </div>
            )}

            <div className="text-gray-400">
              Cookies: {status?.cookieCount} | Auth Cookie: {status?.hasAuthCookie ? 'Yes' : 'No'}
            </div>

            {status?.error && (
              <div className="text-red-400">Error: {status.error}</div>
            )}

            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="font-semibold mb-1">Debug Log:</div>
              <div className="space-y-1 text-gray-300">
                {status?.debug.map((log, i) => (
                  <div key={i} className="break-all">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
