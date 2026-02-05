import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const debugLogs: string[] = []
  const log = (msg: string) => {
    console.log(`[AUTH DEBUG] ${msg}`)
    debugLogs.push(msg)
  }

  try {
    const { email, password } = await request.json()
    log(`Login attempt for: ${email}`)

    if (!email || !password) {
      log('ERROR: Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required', debug: debugLogs },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    log(`Supabase URL: ${supabaseUrl ? 'SET' : 'MISSING'}`)
    log(`Supabase Key: ${supabaseKey ? 'SET (length: ' + supabaseKey.length + ')' : 'MISSING'}`)

    if (!supabaseUrl || !supabaseKey) {
      log('ERROR: Missing Supabase credentials')
      return NextResponse.json(
        { error: 'Server configuration error', debug: debugLogs },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    log('Supabase client created')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      log(`Auth error: ${error.message}`)
      return NextResponse.json(
        { error: error.message, debug: debugLogs },
        { status: 401 }
      )
    }

    log(`Auth success! User ID: ${data.user?.id}`)
    log(`Session exists: ${!!data.session}`)
    log(`Access token length: ${data.session?.access_token?.length || 0}`)
    log(`Refresh token length: ${data.session?.refresh_token?.length || 0}`)

    // Extract project ref from Supabase URL
    const projectRef = supabaseUrl
      .replace('https://', '')
      .replace('.supabase.co', '')
    log(`Project ref: ${projectRef}`)

    const cookieName = `sb-${projectRef}-auth-token`
    log(`Cookie name: ${cookieName}`)

    const cookieValue = JSON.stringify({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at,
      expires_in: data.session?.expires_in,
      token_type: data.session?.token_type,
      user: data.user,
    })
    log(`Cookie value length: ${cookieValue.length}`)

    // Create response with debug info
    const response = NextResponse.json({
      success: true,
      user: { id: data.user?.id, email: data.user?.email },
      redirectTo: '/dashboard',
      debug: debugLogs,
      cookieInfo: {
        name: cookieName,
        valueLength: cookieValue.length,
        willBeSet: true,
      },
    })

    // Set the auth cookie
    response.cookies.set(cookieName, cookieValue, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
    log('Cookie set on response')

    response.headers.set('Cache-Control', 'no-store')
    log('Response ready')

    return response
  } catch (err) {
    log(`Unexpected error: ${err}`)
    return NextResponse.json(
      { error: 'Unexpected error', debug: debugLogs },
      { status: 500 }
    )
  }
}
