'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
})

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: React.ReactNode
  initialUser?: User | null
}

export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current

    // If we have initial user, we're already loaded
    if (initialUser) {
      setUser(initialUser)
      setLoading(false)
      return
    }

    // Otherwise, fetch user
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
      } catch (err) {
        setError('Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [initialUser])

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  )
}
