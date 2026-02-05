'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Your incantations do not match!')
      return
    }

    if (password.length < 6) {
      setError('Your password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Use server-side API route for signup to ensure proper handling
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Check Your Scroll</h1>
        <p className="text-scroll-text/70 mb-4">
          We&apos;ve sent a magical seal to your email. Click the link to complete
          your initiation into the Academy.
        </p>
        <Link href="/login" className="text-arcane-purple hover:underline">
          Return to the gates
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-2">
        Join the Academy
      </h1>
      <p className="text-center text-scroll-text/70 mb-6">
        Begin your journey as an Artificer
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
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
            placeholder="Create a secret incantation"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-scroll-border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-arcane-gold"
            placeholder="Repeat your incantation"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-arcane disabled:opacity-50"
        >
          {loading ? 'Inscribing...' : 'Begin Initiation'}
        </button>
      </form>

      <p className="text-center text-sm mt-6">
        Already an Artificer?{' '}
        <Link href="/login" className="text-arcane-purple hover:underline">
          Enter the Academy
        </Link>
      </p>
    </>
  )
}
