import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    request.cookies,
    (name, value, options) => {
      request.cookies.set({ name, value, ...options })
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      response.cookies.set({ name, value, ...options })
    },
    (name, options) => {
      request.cookies.delete({ name, ...options })
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      response.cookies.delete({ name, ...options })
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes that require authentication
  const protectedPaths = ['/dashboard', '/today', '/home', '/kitchen', '/finance', '/people', '/office']
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/auth/signin', '/auth/signup']
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/today', request.url))
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
