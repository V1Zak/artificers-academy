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
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 bg-mana-black text-white p-4 flex flex-col">
          <div className="mb-8">
            <Link href="/dashboard" className="text-xl font-bold text-arcane-gold">
              The Academy
            </Link>
          </div>

          <nav className="flex-1 space-y-2">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/battlefield">The Battlefield</NavLink>
            <NavLink href="/codex">The Codex</NavLink>
            <NavLink href="/inspector">The Inspector</NavLink>
          </nav>

          <div className="pt-4 border-t border-white/20">
            <p className="text-sm text-white/60 truncate">{user.email}</p>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-white/60 hover:text-white mt-2"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
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
      className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  )
}
