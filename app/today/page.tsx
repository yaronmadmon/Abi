'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import GreetingHeader from '@/components/today/GreetingHeader'
import MoodBar from '@/components/today/MoodBar'
import AIFocusHeader from '@/components/today/AIFocusHeader'
import WeatherCard from '@/components/today/WeatherCard'
import CalendarCard from '@/components/today/CalendarCard'
import QuickCaptureRow from '@/components/today/QuickCaptureRow'
import PlanSomethingSheet from '@/components/sheets/PlanSomethingSheet'
import CareCard from '@/components/today/CareCard'
import GlanceBar from '@/components/today/GlanceBar'
import { useEveningMode } from '@/hooks/useEveningMode'

export default function TodayPage() {
  const [showPlanSheet, setShowPlanSheet] = useState(false)
  const isEveningMode = useEveningMode()

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Greeting Header - Top Left */}
        <div className="mb-6">
          <GreetingHeader />
        </div>

        {/* Mood Bar - Optional, fully private */}
        <MoodBar />

        {/* AI Focus Header - Hidden in evening mode */}
        {!isEveningMode && <AIFocusHeader />}

        {/* 2. Weather & Calendar Cards - Simplified in evening mode */}
        {!isEveningMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <WeatherCard />
            <CalendarCard />
          </div>
        ) : (
          <div className="mb-4">
            <WeatherCard />
          </div>
        )}

        {/* 3. Quick Capture Row - Hidden in evening mode */}
        {!isEveningMode && <QuickCaptureRow />}

        {/* 4. Plan Something Card - Hidden in evening mode */}
        {!isEveningMode && (
          <div className="glass-card p-5 mb-4">
            <button
              onClick={() => setShowPlanSheet(true)}
              className="w-full flex items-center justify-between text-left group"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Plan Something
                </h3>
                <p className="text-sm text-gray-500">What would you like to plan?</p>
              </div>
              <Sparkles className="w-5 h-5 text-[#4a5568] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* 5. Care / Reset Card - Always visible, essential */}
        <CareCard />

        {/* 6. Glance Bar - Hidden in evening mode */}
        {!isEveningMode && <GlanceBar />}

        {/* Plan Something Sheet */}
        <PlanSomethingSheet
          isOpen={showPlanSheet}
          onClose={() => setShowPlanSheet(false)}
        />
      </div>
    </div>
  )
}
