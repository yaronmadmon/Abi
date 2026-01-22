'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EarlyAccessPage() {
  const router = useRouter()

  useEffect(() => {
    // TEMPORARY: When login is hidden, redirect to app instead of showing placeholder
    // This allows access while login UI is hidden
    const SHOW_LOGIN_PAGE = false
    if (!SHOW_LOGIN_PAGE) {
      router.push('/today')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md w-full text-center">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Access Enabled for Early Users
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Thank you for your interest. The app is currently available to early access users.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            If you have access, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
