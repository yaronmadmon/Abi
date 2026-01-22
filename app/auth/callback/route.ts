import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = createServerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        // Redirect to signin with error message
        const signinUrl = new URL('/auth/signin', requestUrl.origin)
        signinUrl.searchParams.set('error', 'auth_failed')
        return NextResponse.redirect(signinUrl)
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      // Redirect to signin with error message
      const signinUrl = new URL('/auth/signin', requestUrl.origin)
      signinUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(signinUrl)
    }
  } else {
    // No code provided, redirect to signin
    return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin))
  }

  // URL to redirect to after sign in process completes successfully
  return NextResponse.redirect(new URL('/today', requestUrl.origin))
}
