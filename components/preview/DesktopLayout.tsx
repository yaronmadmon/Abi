'use client'

import { ReactNode } from 'react'
import { useMobilePreview } from '@/contexts/MobilePreviewContext'
import BottomNavClient from '@/components/navigation/BottomNavClient'
import GlobalSearchBar from '@/components/search/GlobalSearchBar'

interface DesktopLayoutProps {
  children: ReactNode
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const { isMobilePreview } = useMobilePreview()
  
  // Hide desktop layout in mobile preview
  if (isMobilePreview) {
    return null
  }

  return (
    <>
      <div 
        className="sticky top-0 z-[60] px-6 py-3 transition-all duration-250"
        style={{
          backgroundColor: 'var(--bg-main)',
          borderBottom: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <GlobalSearchBar />
        </div>
      </div>
      {children}
      <BottomNavClient />
    </>
  )
}
