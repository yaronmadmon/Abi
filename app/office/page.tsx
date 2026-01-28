'use client'

import SummaryCard from '@/components/section/SummaryCard'

export default function OfficePage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Office</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Documents, scanner & archive</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCard
            title="Documents"
            subtitle="Important files"
            icon="📄"
            href="/office/documents"
            variant="gradient"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>View and manage documents</p>
          </SummaryCard>

          <SummaryCard
            title="Scanner"
            subtitle="Scan documents"
            icon="📷"
            href="/office/scanner"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Scan new documents</p>
          </SummaryCard>

          <SummaryCard
            title="Fax"
            subtitle="Send & receive"
            icon="📠"
            href="/office/fax"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fax management</p>
          </SummaryCard>

        </div>

      </div>
    </div>
  )
}
