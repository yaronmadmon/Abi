'use client'

import { ReactNode } from 'react'
import { useMobilePreview } from '@/contexts/MobilePreviewContext'
import BottomNavClient from '@/components/navigation/BottomNavClient'
import GlobalSearchBar from '@/components/search/GlobalSearchBar'
import ThemeToggles from '@/components/ThemeToggles'

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
        className="sticky top-0 z-[60] backdrop-blur-xl px-6 py-3 transition-colors"
        style={{
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <GlobalSearchBar />
          </div>
          <ThemeToggles />
        </div>
      </div>
      {children}
      <BottomNavClient />
    </>
  )
}
