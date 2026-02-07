'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { useUser } from './UserContext'
import {
  getUserPreference,
  setUserPreference as apiSetPreference,
  type LearningMode,
} from '@/lib/api'

const STORAGE_KEY = 'learning-mode'

const THEME_MAP: Record<LearningMode, string> = {
  simple: 'simple',
  detailed: 'detailed',
  mtg: 'dark',
}

interface ModeContextType {
  mode: LearningMode
  setMode: (mode: LearningMode) => void
  loading: boolean
}

const ModeContext = createContext<ModeContextType | null>(null)

export function useMode() {
  const context = useContext(ModeContext)
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}

interface ModeProviderProps {
  children: React.ReactNode
}

export function ModeProvider({ children }: ModeProviderProps) {
  const { user } = useUser()
  const [mode, setModeState] = useState<LearningMode>(() => {
    // Read from localStorage for instant theme on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'simple' || stored === 'detailed' || stored === 'mtg') {
        return stored
      }
    }
    return 'mtg'
  })
  const [loading, setLoading] = useState(true)

  // Sync theme attribute whenever mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', THEME_MAP[mode])
  }, [mode])

  // Fetch preference from server when user is available
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchPreference() {
      try {
        const pref = await getUserPreference(user!.id, { signal: controller.signal })
        if (controller.signal.aborted) return
        const serverMode = pref.active_mode
        if (serverMode === 'simple' || serverMode === 'detailed' || serverMode === 'mtg') {
          setModeState(serverMode)
          localStorage.setItem(STORAGE_KEY, serverMode)
        }
      } catch {
        // Keep localStorage value on error
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchPreference()

    return () => {
      controller.abort()
    }
  }, [user?.id])

  const setMode = useCallback(
    (newMode: LearningMode) => {
      setModeState(newMode)
      localStorage.setItem(STORAGE_KEY, newMode)
      document.documentElement.setAttribute('data-theme', THEME_MAP[newMode])

      // Persist to server if user is logged in (fire-and-forget)
      if (user?.id) {
        apiSetPreference(user.id, newMode).catch(() => {
          // Non-critical, localStorage is the source of truth for instant UX
        })
      }
    },
    [user?.id]
  )

  const value = useMemo(
    () => ({ mode, setMode, loading }),
    [mode, setMode, loading]
  )

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  )
}
