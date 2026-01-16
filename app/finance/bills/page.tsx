'use client'

import Link from 'next/link'

export default function BillsPage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/finance" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to Finance
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bills</h1>
            <p className="text-sm text-gray-500">Upcoming payments</p>
          </div>
        </div>

        <div className="glass-card p-12 text-center">
          <p className="text-gray-500 mb-2">Bill management</p>
          <p className="text-sm text-gray-400">This feature is not yet available.</p>
        </div>
      </div>
    </div>
  )
}
