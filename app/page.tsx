import { redirect } from 'next/navigation'

// TEMPORARY: Hide login page UI for deployment
// Set to true to show login page
const SHOW_LOGIN_PAGE = false

export default async function HomePage() {
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
    redirect('/today')
  }
  // ============================================================================
  // PRODUCTION: Authentication is always enforced
  // ============================================================================

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, show a setup message
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-md w-full glass-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Setup Required
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Supabase environment variables are not configured.
          </p>
          <div className="space-y-3 text-left bg-blue-50 p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--card-bg)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>To get started:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside" style={{ color: 'var(--text-secondary)' }}>
              <li>Open <code className="bg-gray-100 px-2 py-1 rounded">SETUP-SUPABASE.md</code></li>
              <li>Create a Supabase project</li>
              <li>Run the database schema</li>
              <li>Create <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> with your keys</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Supabase
          </a>
        </div>
      </div>
    )
  }

  try {
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect('/today')
    } else {
      // TEMPORARY: When login is hidden, allow access to app
      if (!SHOW_LOGIN_PAGE) {
        redirect('/today')
      }
      redirect('/auth/signin')
    }
  } catch (error) {
    // If there's an error, allow access when login is hidden
    if (!SHOW_LOGIN_PAGE) {
      redirect('/today')
    }
    redirect('/auth/signin')
  }
}
