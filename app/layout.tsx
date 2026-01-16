import type { Metadata } from 'next'
import './globals.css'
import BottomNavClient from '@/components/navigation/BottomNavClient'
import VoiceAssistantWrapper from '@/components/assistant/VoiceAssistantWrapper'
import GlobalSearchBar from '@/components/search/GlobalSearchBar'
import ToastContainer from '@/components/feedback/ToastContainer'
import MockDataInitializer from '@/components/MockDataInitializer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ThemeToggles from '@/components/ThemeToggles'
import MobilePreviewFrame from '@/components/preview/MobilePreviewFrame'
import MobileAppShell from '@/components/preview/MobileAppShell'
import DesktopLayout from '@/components/preview/DesktopLayout'

export const metadata: Metadata = {
  title: 'AI Home Assistant',
  description: 'Your intelligent home management companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ThemeProvider>
          <MobilePreviewFrame enablePreview={true}>
            {/* Mobile App Shell - Replaces desktop layout in mobile preview */}
            <MobileAppShell>
              {children}
            </MobileAppShell>
            {/* Desktop Layout - Only renders when NOT in mobile preview */}
            <DesktopLayout>
              {children}
            </DesktopLayout>
            <VoiceAssistantWrapper />
            <ToastContainer />
            <MockDataInitializer />
          </MobilePreviewFrame>
        </ThemeProvider>
      </body>
    </html>
  )
}
