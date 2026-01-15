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
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance</h1>
          <p className="text-sm text-gray-500">Bills, budget & subscriptions</p>
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
                  <div key={bill.id} className="text-sm text-gray-700">
                    • {bill.name} - ${bill.amount}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming bills</p>
            )}
          </SummaryCard>

          <SummaryCard
            title="Budget"
            subtitle="Monthly overview"
            icon="💰"
            href="/finance/budget"
          >
            <p className="text-sm text-gray-500">Track your spending</p>
          </SummaryCard>

          <SummaryCard
            title="Subscriptions"
            subtitle="Active services"
            icon="🔄"
            href="/finance/subscriptions"
          >
            <p className="text-sm text-gray-500">Manage your subscriptions</p>
          </SummaryCard>

          <SummaryCard
            title="Transactions"
            subtitle="Recent activity"
            icon="💸"
            href="/finance/transactions"
          >
            <p className="text-sm text-gray-500">View transaction history</p>
          </SummaryCard>
        </div>

        {/* Placeholder for lists */}
        <div className="glass-card p-8 text-center text-gray-500">
          Financial features coming soon. Use the summary cards above to navigate.
        </div>
      </div>
    </div>
  )
}
