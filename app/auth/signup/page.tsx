'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/feedback/ToastContainer'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabaseReady, setSupabaseReady] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSupabaseReady(false)
      return
    }

    // Dynamically import and initialize Supabase
    import('@/lib/supabase-client').then(({ useSupabase }) => {
      try {
        const client = useSupabase()
        setSupabase(client)
        setSupabaseReady(true)
      } catch (error) {
        console.error('Failed to initialize Supabase:', error)
        setSupabaseReady(false)
      }
    })
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase || !supabaseReady) {
      showToast('Supabase not configured. Please check your environment variables.', 'error')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      showToast('Account created! Please check your email to verify your account.', 'success')
      router.push('/auth/signin')
    } catch (error: any) {
      showToast(error.message || 'Failed to create account', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpWithGoogle = async () => {
    if (!supabase || !supabaseReady) {
      showToast('Supabase not configured. Please check your environment variables.', 'error')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      showToast(error.message || 'Failed to sign up with Google', 'error')
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
            <div className="space-y-3 text-left bg-blue-50 p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--card-bg)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Quick Setup:</p>
              <ol className="text-sm space-y-2 list-decimal list-inside" style={{ color: 'var(--text-secondary)' }}>
                <li>Open <code className="bg-gray-100 px-2 py-1 rounded text-xs">SETUP-SUPABASE.md</code></li>
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" className="text-blue-500 underline">supabase.com</a></li>
                <li>Run the database schema</li>
                <li>Create <code className="bg-gray-100 px-2 py-1 rounded text-xs">.env.local</code> with your keys</li>
                <li>Restart the dev server</li>
              </ol>
            </div>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
          <h1 className="text-3xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
            Create Account
          </h1>
          <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
            Sign up to get started
          </p>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: 'var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                }}
                placeholder="John Doe"
              />
            </div>

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
                minLength={6}
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
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)' }} className="px-2">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={handleSignUpWithGoogle}
              disabled={loading}
              className="mt-4 w-full px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
              }}
            >
              Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <a href="/auth/signin" className="text-blue-500 hover:text-blue-600">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
