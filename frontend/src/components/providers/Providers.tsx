'use client'

import { UserProvider, ProgressProvider } from '@/contexts'
import type { User } from '@supabase/supabase-js'

interface ProvidersProps {
  children: React.ReactNode
  user: User | null
}

/**
 * Client-side providers wrapper.
 * Receives initial user from server component and provides contexts.
 */
export function Providers({ children, user }: ProvidersProps) {
  return (
    <UserProvider initialUser={user}>
      <ProgressProvider>
        {children}
      </ProgressProvider>
    </UserProvider>
  )
}
