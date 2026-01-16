'use client'

import Link from 'next/link'

export default function BudgetPage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/finance" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to Finance
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget</h1>
            <p className="text-sm text-gray-500">Monthly overview</p>
          </div>
        </div>

        <div className="glass-card p-8 text-center text-gray-500">
          <p className="mb-4">Budget tracking is not yet available.</p>
          <p className="text-sm">Track your spending and budget here.</p>
        </div>
      </div>
    </div>
  )
}
