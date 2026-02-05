import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  // Use standard Supabase client (not SSR) since we'll manually handle cookies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }

  // Create response
  const response = NextResponse.json({
    user: data.user,
    redirectTo: '/dashboard',
  })

  // Manually set the auth cookie with the session
  // Extract project ref from Supabase URL (e.g., https://xxxxx.supabase.co -> xxxxx)
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!
    .replace('https://', '')
    .replace('.supabase.co', '')

  const cookieName = `sb-${projectRef}-auth-token`
  const cookieValue = JSON.stringify({
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
    expires_at: data.session?.expires_at,
    expires_in: data.session?.expires_in,
    token_type: data.session?.token_type,
    user: data.user,
  })

  // Set the auth cookie
  response.cookies.set(cookieName, cookieValue, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  response.headers.set('Cache-Control', 'no-store')

  return response
}
