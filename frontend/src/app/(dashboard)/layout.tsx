import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Providers } from '@/components/providers'
import { MobileSidebar } from '@/components/layout/MobileSidebar'
import { DesktopNav, DesktopModeBadge, DesktopBranding } from '@/components/layout/DesktopNav'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import type { User } from '@supabase/supabase-js'

// Debug user for bypassing auth during development
const DEBUG_USER: User = {
  id: 'debug-user-12345',
  email: 'debug@artificers-academy.dev',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
} as User

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const debugBypass = cookieStore.get('debug-auth-bypass')?.value === 'artificer-debug-2024'

  let user: User | null = null

  if (debugBypass) {
    // Debug bypass enabled - use mock user
    console.log('[AUTH DEBUG] Debug bypass active - using mock user')
    user = DEBUG_USER
  } else {
    // Normal auth flow
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  if (!user) {
    redirect('/login')
  }

  return (
    <Providers user={user}>
      <div className="min-h-screen flex" style={{ backgroundColor: 'var(--void)' }}>
        {/* Skip to content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-arcane-gold focus:text-void focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>

        {/* Mobile sidebar */}
        <MobileSidebar email={user.email || ''} />

        {/* Desktop sidebar - hidden on mobile */}
        <DesktopSidebar email={user.email || ''} />

        {/* Main content - extra top padding on mobile for hamburger button */}
        <main id="main-content" className="flex-1 p-4 pt-16 md:p-8 overflow-y-auto" style={{ backgroundColor: 'var(--void)' }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </Providers>
  )
}

function DesktopSidebar({ email }: { email: string }) {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r" style={{ borderColor: 'var(--obsidian-border)', backgroundColor: 'var(--void-light)' }}>
      <div className="p-4 mb-4">
        <DesktopBranding />
      </div>

      {/* Mode badge - client component */}
      <DesktopModeBadge />

      {/* Mode-aware nav labels - client component */}
      <DesktopNav />

      {/* Mode switch link */}
      <div className="px-4 py-2">
        <Link
          href="/"
          className="text-sm transition-colors flex items-center gap-2"
          style={{ color: 'var(--silver-faint)' }}
        >
          Switch Mode
        </Link>
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--obsidian-border)' }}>
        <p className="text-sm truncate" style={{ color: 'var(--silver-faint)' }}>{email}</p>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm transition-colors mt-2"
            style={{ color: 'var(--silver-faint)' }}
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
