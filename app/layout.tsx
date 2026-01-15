import type { Metadata } from 'next'
import './globals.css'
import BottomNavClient from '@/components/navigation/BottomNavClient'
import VoiceAssistantWrapper from '@/components/assistant/VoiceAssistantWrapper'
import GlobalSearchBar from '@/components/search/GlobalSearchBar'
import ToastContainer from '@/components/feedback/ToastContainer'
import MockDataInitializer from '@/components/MockDataInitializer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ThemeToggles from '@/components/ThemeToggles'

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
          <div 
            className="sticky top-0 z-40 backdrop-blur-xl px-6 py-3 transition-colors"
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
          <VoiceAssistantWrapper />
          <ToastContainer />
          <MockDataInitializer />
        </ThemeProvider>
      </body>
    </html>
  )
}
