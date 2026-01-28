'use client'

import SummaryCard from '@/components/section/SummaryCard'
import PageContainer from '@/components/ui/PageContainer'

export default function PeoplePage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>People</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Family, pets & applicants</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCard
            title="Family"
            subtitle="Household members"
            icon="👨‍👩‍👧‍👦"
            href="/people/family"
            variant="gradient"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage family members</p>
          </SummaryCard>

          <SummaryCard
            title="Pets"
            subtitle="Your furry friends"
            icon="🐾"
            href="/people/pets"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pet care & information</p>
          </SummaryCard>

        </div>

      </PageContainer>
    </div>
  )
}
