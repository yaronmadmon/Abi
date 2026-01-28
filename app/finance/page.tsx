'use client'

import { useState, useEffect } from 'react'
import SummaryCard from '@/components/section/SummaryCard'

export default function FinancePage() {
  const [upcomingBills, setUpcomingBills] = useState<any[]>([])

  useEffect(() => {
    // Load financial data
    loadData()
  }, [])

  const loadData = () => {
    // Placeholder for bills data
    setUpcomingBills([])
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)', transition: 'all 250ms' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', transition: 'all 250ms' }}>Finance</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', transition: 'all 250ms' }}>Bills, budget & subscriptions</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCard
            title="Bills"
            subtitle="Upcoming payments"
            icon="🧾"
            href="/finance/bills"
            variant="gradient"
          >
            {upcomingBills.length > 0 ? (
              <div className="space-y-2">
                {upcomingBills.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="text-sm" style={{ color: 'var(--text-primary)', transition: 'all 250ms' }}>
                    • {bill.name} - ${bill.amount}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-secondary)', transition: 'all 250ms' }}>No upcoming bills</p>
            )}
          </SummaryCard>

          <SummaryCard
            title="Budget"
            subtitle="Monthly overview"
            icon="💰"
            href="/finance/budget"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)', transition: 'all 250ms' }}>Track your spending</p>
          </SummaryCard>

          <SummaryCard
            title="Subscriptions"
            subtitle="Active services"
            icon="🔄"
            href="/finance/subscriptions"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)', transition: 'all 250ms' }}>Manage your subscriptions</p>
          </SummaryCard>

          <SummaryCard
            title="Transactions"
            subtitle="Recent activity"
            icon="💸"
            href="/finance/transactions"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)', transition: 'all 250ms' }}>View transaction history</p>
          </SummaryCard>
        </div>

      </div>
    </div>
  )
}
