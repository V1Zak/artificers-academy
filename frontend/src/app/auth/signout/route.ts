import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    // Log error but still redirect - user likely wants to leave
    console.error('Signout error:', error.message)
  }

  return NextResponse.redirect(new URL('/login', request.url), {
    status: 302,
  })
}
