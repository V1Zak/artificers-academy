'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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
    </>
  )
}
