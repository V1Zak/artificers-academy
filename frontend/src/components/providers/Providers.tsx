'use client'

import { UserProvider, ModeProvider, ProgressProvider } from '@/contexts'
import { ToastProvider } from '@/contexts/ToastContext'
import type { User } from '@supabase/supabase-js'

interface ProvidersProps {
  children: React.ReactNode
  user: User | null
}

/**
 * Client-side providers wrapper.
 * Receives initial user from server component and provides contexts.
 * Chain: UserProvider -> ModeProvider -> ProgressProvider -> ToastProvider
 */
export function Providers({ children, user }: ProvidersProps) {
  return (
    <UserProvider initialUser={user}>
      <ModeProvider>
        <ProgressProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ProgressProvider>
      </ModeProvider>
    </UserProvider>
  )
}
