import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for use in the browser.
 * Uses environment variables for configuration.
 *
 * Note: Cookie storage is configured explicitly to ensure
 * auth tokens are properly persisted across page navigations.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  )
}
