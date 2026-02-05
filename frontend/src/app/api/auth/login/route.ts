import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type CookieToSet = { name: string; value: string; options: CookieOptions }

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  const cookieStore = await cookies()

  // Create the response up front so we can attach auth cookies during sign-in.
  const response = NextResponse.json({
    redirectTo: '/dashboard',
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSetFromSupabase: CookieToSet[]) {
          cookiesToSetFromSupabase.forEach(({ name, value, options }: CookieToSet) =>
            response.cookies.set(name, value, options)
          )
        },
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

  // Ensure the response isn't cached and can carry Set-Cookie headers.
  response.headers.set('Cache-Control', 'no-store')

  return response
}
