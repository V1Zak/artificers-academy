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
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Your password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
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
        <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
        <p className="mb-4" style={{ color: 'var(--silver-muted)' }}>
          We&apos;ve sent a confirmation link to your email. Click it to complete your registration.
        </p>
        <Link href="/login" className="hover:underline" style={{ color: 'var(--arcane-purple)' }}>
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-2">
        Create Account
      </h1>
      <p className="text-center mb-6" style={{ color: 'var(--silver-muted)' }}>
        Start your learning journey
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
            placeholder="Create a password"
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
            className="w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
            style={{
              border: '1px solid var(--obsidian-border)',
              backgroundColor: 'var(--obsidian)',
              color: 'var(--silver)',
            }}
            placeholder="Repeat your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-arcane disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--silver-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" className="hover:underline" style={{ color: 'var(--arcane-purple)' }}>
          Sign in
        </Link>
      </p>
    </>
  )
}
