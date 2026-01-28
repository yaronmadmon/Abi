'use client'

import Link from 'next/link'
import PageContainer from '@/components/ui/PageContainer'

export default function SmartHomePage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer maxWidth="2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/today" className="text-sm mb-2 inline-block transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              ← Back to Today
            </Link>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Smart Home</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Connected devices</p>
          </div>
        </div>

        <div className="glass-card p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="mb-4">Smart home features are not yet available.</p>
        </div>
      </PageContainer>
    </div>
  )
}
