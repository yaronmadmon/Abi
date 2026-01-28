'use client'

import Link from 'next/link'

export default function ArchivePage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/office" className="text-sm mb-2 inline-block transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              ← Back to Office
            </Link>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Archive</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Stored documents</p>
          </div>
        </div>

        <div className="glass-card p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="mb-4">Document archive is not yet available.</p>
        </div>
      </div>
    </div>
  )
}
