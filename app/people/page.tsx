'use client'

import SummaryCard from '@/components/section/SummaryCard'

export default function PeoplePage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">People</h1>
          <p className="text-sm text-gray-500">Family, pets & applicants</p>
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
            <p className="text-sm text-gray-500">Manage family members</p>
          </SummaryCard>

          <SummaryCard
            title="Pets"
            subtitle="Your furry friends"
            icon="🐾"
            href="/people/pets"
          >
            <p className="text-sm text-gray-500">Pet care & information</p>
          </SummaryCard>

          <SummaryCard
            title="Applicants"
            subtitle="Caregivers & staff"
            icon="👤"
            href="/people/applicants"
          >
            <p className="text-sm text-gray-500">Manage applicants</p>
          </SummaryCard>
        </div>

        {/* Placeholder for lists */}
        <div className="glass-card p-8 text-center text-gray-500">
          People management features coming soon. Use the summary cards above to navigate.
        </div>
      </div>
    </div>
  )
}
