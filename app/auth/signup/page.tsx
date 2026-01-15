'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/supabase-client'
import { showToast } from '@/components/feedback/ToastContainer'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = useSupabase()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
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
