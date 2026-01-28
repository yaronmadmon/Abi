'use client'

import Link from 'next/link'
import PageContainer from '@/components/ui/PageContainer'

export default function ApplicantsPage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/people" className="text-sm mb-2 inline-block transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              ← Back to People
            </Link>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Applicants</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Caregivers & staff</p>
          </div>
        </div>

        <div className="glass-card p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          <p className="mb-4">Applicant management is not yet available.</p>
        </div>
      </PageContainer>
    </div>
  )
}
