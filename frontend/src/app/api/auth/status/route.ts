import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const debugLogs: string[] = []
  const log = (msg: string) => {
    console.log(`[AUTH STATUS] ${msg}`)
    debugLogs.push(msg)
  }

  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    log(`Total cookies: ${allCookies.length}`)
    allCookies.forEach(c => {
      log(`Cookie: ${c.name} (length: ${c.value.length})`)
    })

    // Find auth cookie
    const authCookie = allCookies.find(c => c.name.includes('auth-token'))
    log(`Auth cookie found: ${!!authCookie}`)

    if (authCookie) {
      log(`Auth cookie name: ${authCookie.name}`)
      log(`Auth cookie value length: ${authCookie.value.length}`)
      try {
        const parsed = JSON.parse(authCookie.value)
        log(`Parsed cookie - has access_token: ${!!parsed.access_token}`)
        log(`Parsed cookie - has refresh_token: ${!!parsed.refresh_token}`)
        log(`Parsed cookie - user email: ${parsed.user?.email || 'N/A'}`)
      } catch {
        log('Failed to parse auth cookie as JSON')
      }
    }

    // Try to get user via Supabase
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    log(`Supabase getUser error: ${error?.message || 'none'}`)
    log(`Supabase user: ${user?.id || 'null'}`)

    return NextResponse.json({
      authenticated: !!user,
      user: user ? { id: user.id, email: user.email } : null,
      cookieCount: allCookies.length,
      hasAuthCookie: !!authCookie,
      debug: debugLogs,
    })
  } catch (err) {
    log(`Error: ${err}`)
    return NextResponse.json({
      authenticated: false,
      error: String(err),
      debug: debugLogs,
    })
  }
}
