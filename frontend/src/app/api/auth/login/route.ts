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

    // Return session data to client - client will store cookie via JavaScript
    // This bypasses server-side Set-Cookie issues
    return NextResponse.json({
      success: true,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
        expires_in: data.session?.expires_in,
        token_type: data.session?.token_type,
      },
      user: { id: data.user?.id, email: data.user?.email },
      cookieName: `sb-${projectRef}-auth-token`,
      redirectTo: '/dashboard',
      debug: debugLogs,
    })
  } catch (err) {
    log(`Unexpected error: ${err}`)
    return NextResponse.json(
      { error: 'Unexpected error', debug: debugLogs },
      { status: 500 }
    )
  }
}
