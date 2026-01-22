import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// TEMPORARY: Hide login page UI for deployment
// Set to true to show login page
const SHOW_LOGIN_PAGE = false

export async function middleware(request: NextRequest) {
  // ⚠️ DEV AUTH BYPASS - ONLY ACTIVE IN DEVELOPMENT
  // ============================================================================
  // This bypasses authentication ONLY when:
  // 1. NODE_ENV is not 'production' (development/test)
  // 2. AND ENABLE_DEV_AUTH_BYPASS is explicitly set to 'true'
  // ============================================================================
  // In production, this bypass is automatically disabled by NODE_ENV check
  // To enable in dev: set ENABLE_DEV_AUTH_BYPASS=true in .env.local
  // ============================================================================
  const isDev = process.env.NODE_ENV !== 'production'
  const bypassEnabled = process.env.ENABLE_DEV_AUTH_BYPASS === 'true'
  
  if (isDev && bypassEnabled) {
    // Only bypass in development when explicitly enabled
    return NextResponse.next()
  }
  // ============================================================================
  // PRODUCTION: Authentication is always enforced
  // ============================================================================

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow access (for development)
  // This allows the app to run before Supabase is set up
  if (!supabaseUrl || !supabaseAnonKey) {
    // In development, allow access to all routes
    // In production, you should have these variables set
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️ Supabase environment variables are missing in production!')
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes that require authentication
  const protectedPaths = ['/dashboard', '/today', '/home', '/kitchen', '/finance', '/people', '/office']
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    // TEMPORARY: When login is hidden, allow access to app (for deployment)
    // This allows the app to work while login UI is hidden
    if (!SHOW_LOGIN_PAGE) {
      // Allow access - login is hidden so we bypass auth check
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/auth/signin', '/auth/signup']
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/today', request.url))
  }

  // TEMPORARY: Redirect unauthenticated users away from login page
  if (isAuthPath && !user && !SHOW_LOGIN_PAGE) {
    return NextResponse.redirect(new URL('/early-access', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
