'use client'

import Link from 'next/link'
import PageContainer from '@/components/ui/PageContainer'

export default function SmartHomePage() {
  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer maxWidth="2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/today" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to Today
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Home</h1>
            <p className="text-sm text-gray-500">Connected devices</p>
          </div>
        </div>

        <div className="glass-card p-8 text-center text-gray-500">
          <p className="mb-4">Smart home features are not yet available.</p>
        </div>
      </PageContainer>
    </div>
  )
}
