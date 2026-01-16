'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { MobilePreviewProvider } from '@/contexts/MobilePreviewContext'

interface MobilePreviewFrameProps {
  children: ReactNode
  enablePreview?: boolean // Toggle for dev/preview mode (default: true in dev)
}

export default function MobilePreviewFrame({ children, enablePreview = true }: MobilePreviewFrameProps) {
  const { viewMode } = useTheme()
  
  // Only show preview frame in mobile mode when enabled
  // In production, set enablePreview={false} or check env var
  const isMobilePreview = viewMode === 'mobile' && enablePreview
  
  if (!isMobilePreview) {
    return (
      <MobilePreviewProvider isMobilePreview={false}>
        {children}
      </MobilePreviewProvider>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm z-50">
      {/* Phone Frame Container - iPhone 14 Pro dimensions */}
      <div 
        className="relative"
        style={{
          width: '375px', // iPhone-like width
          height: '812px', // iPhone-like height (19.5:9 aspect ratio)
          maxWidth: 'min(90vw, 375px)',
          maxHeight: 'min(90vh, 812px)',
          aspectRatio: '375 / 812',
        }}
      >
        {/* Phone Frame Bezel - Outer device shell */}
        <div className="absolute inset-0 bg-gray-950 rounded-[3rem] p-2 shadow-2xl">
          {/* Inner Screen Area - Actual display, uses app theme background */}
          <div 
            className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
            style={{
              backgroundColor: 'var(--background)',
            }}
          >
            {/* Status Bar / Notch Area - Visual device chrome */}
            <div className="absolute top-0 left-0 right-0 h-12 z-50 pointer-events-none">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
            </div>
            
            {/* App Viewport - Fills 100% of inner screen, creates stacking context for fixed children */}
            {/* MobileAppShell handles scrolling - this container just provides bounds */}
            <div 
              className="relative w-full h-full overflow-hidden rounded-[2.5rem]"
            >
              <MobilePreviewProvider isMobilePreview={true}>
                {children}
              </MobilePreviewProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
