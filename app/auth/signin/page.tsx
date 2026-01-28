'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/feedback/ToastContainer'
import { logger } from '@/lib/logger'
import { Chrome, Apple, Mail } from 'lucide-react'

// TEMPORARY: Google OAuth disabled for deployment
// Set to true to re-enable Google OAuth
const ENABLE_GOOGLE_AUTH = false

// TEMPORARY: Hide login page UI for deployment
// Set to true to show login page
const SHOW_LOGIN_PAGE = false

export default function SignInPage() {
  const [showPasswordAuth, setShowPasswordAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabaseReady, setSupabaseReady] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // TEMPORARY: Redirect away from login page if hidden
    if (!SHOW_LOGIN_PAGE) {
      router.push('/early-access')
      return
    }

    // Check for error from auth callback
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error === 'auth_failed') {
      showToast('Authentication failed. Please try signing in again.', 'error')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSupabaseReady(false)
      return
    }

    // Dynamically import and initialize Supabase
    import('@/lib/supabase-client').then(({ createClient }) => {
      try {
        const client = createClient()
        setSupabase(client)
        setSupabaseReady(true)
      } catch (error) {
        logger.error('Failed to initialize Supabase', error instanceof Error ? error : new Error(String(error)))
        setSupabaseReady(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase || !supabaseReady) {
      showToast('Supabase not configured. Please check your environment variables.', 'error')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      showToast('Signed in successfully', 'success')
      router.push('/today')
      router.refresh()
    } catch (error: any) {
      showToast(error.message || 'Failed to sign in', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSignInWithGoogle = async () => {
    // TEMPORARY: Guard against Google OAuth during deployment
    if (!ENABLE_GOOGLE_AUTH) {
      showToast('Google sign-in coming soon', 'info')
      return
    }

    if (!supabase || !supabaseReady) {
      showToast('Supabase not configured. Please check your environment variables.', 'error')
      return
    }

    setLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      
      if (error) {
        // Provide more helpful error messages
        let errorMessage = error.message || 'Failed to sign in with Google'
        
        // Check for common configuration issues
        if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
          errorMessage = `OAuth configuration error. Please ensure:
1. Google OAuth is enabled in Supabase Dashboard → Authentication → Providers
2. Redirect URL "${redirectUrl}" is added in Supabase Dashboard → Authentication → URL Configuration
3. Google OAuth credentials are configured in Supabase`
        }
        
        throw new Error(errorMessage)
      }
      
      // Success - user will be redirected
      // Don't set loading to false - user is being redirected
    } catch (error: any) {
      console.error('Google OAuth error:', error)
      showToast(error.message || 'Failed to sign in with Google', 'error')
      setLoading(false)
    }
  }

  const handleSignInWithApple = async () => {
    if (!supabase || !supabaseReady) {
      showToast('Supabase not configured. Please check your environment variables.', 'error')
      return
    }

    setLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
        },
      })
      
      if (error) {
        // Provide more helpful error messages
        let errorMessage = error.message || 'Failed to sign in with Apple'
        
        // Check for common configuration issues
        if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
          errorMessage = `OAuth configuration error. Please ensure:
1. Apple OAuth is enabled in Supabase Dashboard → Authentication → Providers
2. Redirect URL "${redirectUrl}" is added in Supabase Dashboard → Authentication → URL Configuration
3. Apple OAuth credentials are configured in Supabase`
        }
        
        throw new Error(errorMessage)
      }
      
      // Success - user will be redirected
      // Don't set loading to false - user is being redirected
    } catch (error: any) {
      console.error('Apple OAuth error:', error)
      showToast(error.message || 'Failed to sign in with Apple', 'error')
      setLoading(false)
    }
  }

  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Setup Required
            </h1>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Supabase is not configured. Please set up your environment variables.
            </p>
            <div className="space-y-3 text-left p-4 rounded-lg mb-6 transition-colors duration-250" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Quick Setup:</p>
              <ol className="text-sm space-y-2 list-decimal list-inside" style={{ color: 'var(--text-secondary)' }}>
                <li>Open <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>SETUP-SUPABASE.md</code></li>
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" className="underline transition-colors duration-250" style={{ color: 'var(--accent-primary)' }}>supabase.com</a></li>
                <li>Run the database schema</li>
                <li>Create <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>.env.local</code> with your keys</li>
                <li>Restart the dev server</li>
              </ol>
            </div>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 text-white rounded-lg transition-colors duration-250"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Set Up Supabase
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Welcome to Abby
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to get started. Your account will be created automatically.
            </p>
          </div>

          {/* OAuth Buttons - Primary */}
          <div className="space-y-3">
            {/* TEMPORARY: Google OAuth hidden during deployment */}
            {ENABLE_GOOGLE_AUTH && (
              <button
                onClick={handleSignInWithGoogle}
                disabled={loading}
                className="w-full px-6 py-3.5 border-2 rounded-xl transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium"
                style={{
                  borderColor: 'var(--glass-border)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
              >
                <Chrome className="w-5 h-5" strokeWidth={2} />
                <span>Continue with Google</span>
              </button>
            )}

            <button
              onClick={handleSignInWithApple}
              disabled={loading}
              className="w-full px-6 py-3.5 border-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
              }}
            >
              <Apple className="w-5 h-5" strokeWidth={2} />
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Password Auth - Hidden by default */}
          {showPasswordAuth ? (
            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)' }} className="px-2">
                    Or use email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: 'var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: 'var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 text-white rounded-lg transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.opacity = '0.9'
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.opacity = '1'
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Don&apos;t have an account?{' '}
                <a href="/auth/signup" className="transition-colors duration-250" style={{ color: 'var(--accent-primary)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                  Sign up
                </a>
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowPasswordAuth(true)}
              className="mt-6 w-full text-sm text-center transition-colors duration-250 flex items-center justify-center gap-2"
              style={{ color: 'var(--accent-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Mail className="w-4 h-4" strokeWidth={2} />
              <span>Sign in with email instead</span>
            </button>
          )}

          <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
