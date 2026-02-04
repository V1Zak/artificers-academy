'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { useUser } from './UserContext'
import {
  getProgress,
  updateProgress as apiUpdateProgress,
  type ProgressEntry,
} from '@/lib/api'

interface ProgressContextType {
  /** All progress entries for the user */
  progress: ProgressEntry[]
  /** Loading state */
  loading: boolean
  /** Error message if any */
  error: string | null
  /** Check if a specific phase is completed */
  isPhaseCompleted: (levelId: string, phaseId: string) => boolean
  /** Check if a phase is unlocked (previous phase completed or first phase) */
  isPhaseUnlocked: (levelId: string, phaseId: string, phaseIndex: number) => boolean
  /** Get completed phase count for a level */
  getCompletedCount: (levelId: string) => number
  /** Get saved code for a phase */
  getSavedCode: (levelId: string, phaseId: string) => string | null
  /** Mark a phase as completed */
  completePhase: (levelId: string, phaseId: string, code?: string) => Promise<void>
  /** Save code without marking complete */
  saveCode: (levelId: string, phaseId: string, code: string) => Promise<void>
  /** Refresh progress from server */
  refreshProgress: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

interface ProgressProviderProps {
  children: React.ReactNode
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const { user } = useUser()
  const [progress, setProgress] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch progress when user changes
  const fetchProgress = useCallback(async (signal?: AbortSignal) => {
    if (!user?.id) {
      setProgress([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await getProgress(user.id, { signal })
      if (signal?.aborted) return
      setProgress(response.progress)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to load progress')
      // Don't clear progress on error - keep stale data
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [user?.id])

  useEffect(() => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    fetchProgress(controller.signal)

    return () => {
      controller.abort()
    }
  }, [fetchProgress])

  // Check if a phase is completed
  const isPhaseCompleted = useCallback(
    (levelId: string, phaseId: string): boolean => {
      return progress.some(
        (p) => p.level_id === levelId && p.phase_id === phaseId && p.completed
      )
    },
    [progress]
  )

  // Check if a phase is unlocked
  const isPhaseUnlocked = useCallback(
    (levelId: string, phaseId: string, phaseIndex: number): boolean => {
      // First phase is always unlocked
      if (phaseIndex === 0) return true

      // Check if this phase is already completed (can revisit)
      if (isPhaseCompleted(levelId, phaseId)) return true

      // Otherwise, need to check if previous phase is completed
      // This requires knowing the previous phase ID, which the caller should handle
      // For now, we'll return true if any phase in this level is completed
      // The caller can pass the correct phaseIndex to determine unlock status
      const completedCount = progress.filter(
        (p) => p.level_id === levelId && p.completed
      ).length

      return completedCount >= phaseIndex
    },
    [progress, isPhaseCompleted]
  )

  // Get completed count for a level
  const getCompletedCount = useCallback(
    (levelId: string): number => {
      return progress.filter(
        (p) => p.level_id === levelId && p.completed
      ).length
    },
    [progress]
  )

  // Get saved code for a phase
  const getSavedCode = useCallback(
    (levelId: string, phaseId: string): string | null => {
      const entry = progress.find(
        (p) => p.level_id === levelId && p.phase_id === phaseId
      )
      return entry?.code_snapshot ?? null
    },
    [progress]
  )

  // Mark a phase as completed
  const completePhase = useCallback(
    async (levelId: string, phaseId: string, code?: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      try {
        await apiUpdateProgress(user.id, levelId, phaseId, true, code)

        // Optimistically update local state
        setProgress((prev) => {
          const existing = prev.find(
            (p) => p.level_id === levelId && p.phase_id === phaseId
          )

          if (existing) {
            return prev.map((p) =>
              p.level_id === levelId && p.phase_id === phaseId
                ? { ...p, completed: true, code_snapshot: code ?? p.code_snapshot }
                : p
            )
          }

          return [
            ...prev,
            {
              level_id: levelId,
              phase_id: phaseId,
              completed: true,
              code_snapshot: code ?? null,
            },
          ]
        })
      } catch (err) {
        // Refresh from server on error - use current abort controller if available
        const signal = abortControllerRef.current?.signal
        if (!signal?.aborted) {
          await fetchProgress(signal)
        }
        throw err
      }
    },
    [user?.id, fetchProgress]
  )

  // Save code without marking complete
  const saveCode = useCallback(
    async (levelId: string, phaseId: string, code: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      try {
        await apiUpdateProgress(user.id, levelId, phaseId, false, code)

        // Optimistically update local state
        setProgress((prev) => {
          const existing = prev.find(
            (p) => p.level_id === levelId && p.phase_id === phaseId
          )

          if (existing) {
            // Update existing entry, preserving completion status
            return prev.map((p) =>
              p.level_id === levelId && p.phase_id === phaseId
                ? { ...p, code_snapshot: code }
                : p
            )
          }

          // New entry - if phase isn't in progress array, it hasn't been completed yet
          return [
            ...prev,
            {
              level_id: levelId,
              phase_id: phaseId,
              completed: false,
              code_snapshot: code,
            },
          ]
        })
      } catch (err) {
        // Don't throw - code saving is not critical
        console.error('Failed to save code:', err)
      }
    },
    [user?.id]
  )

  // Refresh progress
  const refreshProgress = useCallback(async () => {
    // Use existing abort controller's signal if available
    const signal = abortControllerRef.current?.signal
    if (!signal?.aborted) {
      await fetchProgress(signal)
    }
  }, [fetchProgress])

  const value = useMemo(
    () => ({
      progress,
      loading,
      error,
      isPhaseCompleted,
      isPhaseUnlocked,
      getCompletedCount,
      getSavedCode,
      completePhase,
      saveCode,
      refreshProgress,
    }),
    [
      progress,
      loading,
      error,
      isPhaseCompleted,
      isPhaseUnlocked,
      getCompletedCount,
      getSavedCode,
      completePhase,
      saveCode,
      refreshProgress,
    ]
  )

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}
