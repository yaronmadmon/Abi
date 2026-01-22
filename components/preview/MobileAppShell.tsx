'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useMobilePreview } from '@/contexts/MobilePreviewContext'
import GlobalSearchBar from '@/components/search/GlobalSearchBar'
import ThemeToggles from '@/components/ThemeToggles'
import BottomNavClient from '@/components/navigation/BottomNavClient'
import AbbyLogo from '@/components/branding/AbbyLogo'

interface MobileAppShellProps {
  children: ReactNode
}

export default function MobileAppShell({ children }: MobileAppShellProps) {
  const { isMobilePreview } = useMobilePreview()
  
  // Only render mobile shell in mobile preview mode
  if (!isMobilePreview) {
    return null
  }

  // Mobile app shell structure
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Status Bar Spacer - Accounts for notch/status bar */}
      <div className="h-8 flex-shrink-0" aria-hidden="true" />
      
      {/* Mobile Header - Sticky inside phone, full-width */}
      <header 
        className="sticky top-0 z-[60] flex-shrink-0 backdrop-blur-xl px-4 py-3"
        style={{
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between gap-3 w-full">
          <Link href="/today" className="flex-shrink-0">
            <AbbyLogo size="small" showSubtitle={false} />
          </Link>
          <div className="flex-1 min-w-0">
            <GlobalSearchBar />
          </div>
          <ThemeToggles />
        </div>
      </header>

      {/* Scrollable Content Area - Full width, respects bottom nav - ONLY scroll container */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden min-w-0"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '80px', // Space for bottom nav (64px) + padding
        }}
      >
        {/* Mobile Content Wrapper - Removes desktop constraints, enforces mobile spacing */}
        <div className="mobile-content-wrapper w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Inside phone, sticky to bottom */}
      <BottomNavClient />
    </div>
  )
}
