import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Providers } from '@/components/providers'
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
      <div className="min-h-screen flex bg-void">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col border-r border-white/[0.06] bg-void-light backdrop-blur-xl">
          <div className="p-4 mb-4">
            <Link href="/dashboard" className="text-xl font-bold text-luminescent hover:text-luminescent/90 transition-colors">
              The Academy
            </Link>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/battlefield">The Battlefield</NavLink>
            <NavLink href="/codex">The Codex</NavLink>
            <NavLink href="/inspector">The Inspector</NavLink>
          </nav>

          <div className="p-4 border-t border-white/[0.06]">
            <p className="text-sm text-silver/50 truncate">{user.email}</p>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-silver/50 hover:text-silver transition-colors mt-2"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto bg-void">
          {children}
        </main>
      </div>
    </Providers>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2.5 rounded-lg text-silver/70 hover:text-silver hover:bg-white/[0.05] transition-all duration-200"
    >
      {children}
    </Link>
  )
}
