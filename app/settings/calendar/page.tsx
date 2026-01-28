'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, Calendar, Save } from 'lucide-react'
import {
  CALENDAR_SYSTEMS,
  getCalendarPreferences,
  saveCalendarPreferences,
  formatInCalendarWithWeekday,
  type CalendarPreferences
} from '@/lib/calendarSystems'
import { showToast } from '@/components/feedback/ToastContainer'
import { logger } from '@/lib/logger'

export default function CalendarSettingsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<CalendarPreferences>({
    selectedCalendars: [],
    showInToday: true,
    showInWeekly: false
  })
  const [originalPreferences, setOriginalPreferences] = useState<CalendarPreferences>({
    selectedCalendars: [],
    showInToday: true,
    showInWeekly: false
  })
  const [hasChanges, setHasChanges] = useState(false)

  const [previewDate] = useState(new Date())

  useEffect(() => {
    const prefs = getCalendarPreferences()
    setPreferences(prefs)
    setOriginalPreferences(prefs)
  }, [])

  // Check if there are unsaved changes
  useEffect(() => {
    const changed = 
      preferences.selectedCalendars.length !== originalPreferences.selectedCalendars.length ||
      preferences.selectedCalendars.some(id => !originalPreferences.selectedCalendars.includes(id)) ||
      originalPreferences.selectedCalendars.some(id => !preferences.selectedCalendars.includes(id)) ||
      preferences.showInToday !== originalPreferences.showInToday ||
      preferences.showInWeekly !== originalPreferences.showInWeekly
    
    logger.debug('Change detection', {
      changed,
      selectedCalendars: preferences.selectedCalendars,
      originalSelected: originalPreferences.selectedCalendars,
      showInToday: preferences.showInToday,
      showInWeekly: preferences.showInWeekly
    })
    
    setHasChanges(changed)
  }, [preferences, originalPreferences])

  const toggleCalendar = (calendarId: string) => {
    const isActive = preferences.selectedCalendars.includes(calendarId)
    setPreferences({
      ...preferences,
      selectedCalendars: isActive
        ? preferences.selectedCalendars.filter(id => id !== calendarId)
        : [...preferences.selectedCalendars, calendarId]
    })
  }

  const handleToggleShowInToday = () => {
    setPreferences({ ...preferences, showInToday: !preferences.showInToday })
  }

  const handleToggleShowInWeekly = () => {
    setPreferences({ ...preferences, showInWeekly: !preferences.showInWeekly })
  }

  const handleSave = () => {
    try {
      logger.debug('Saving preferences', { preferences })
      saveCalendarPreferences(preferences)
      setOriginalPreferences(preferences)
      setHasChanges(false)
      
      // Dispatch event FIRST to update other pages
      window.dispatchEvent(new Event('calendarPreferencesUpdated'))
      
      showToast('✓ Calendar settings saved successfully!', 'success')
      
      // Force a storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'calendarPreferences',
        newValue: JSON.stringify(preferences),
        url: window.location.href
      }))
      
      // Navigate back after a brief delay
      setTimeout(() => {
        // Force reload the page we're going back to
        window.location.href = '/today'
      }, 800)
    } catch (error) {
      logger.error('Error saving calendar preferences', error as Error)
      showToast('Failed to save settings. Please try again.', 'error')
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = confirm('You have unsaved changes. Discard them?')
      if (!confirmed) return
    }
    router.back()
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={handleCancel}
            className="text-sm mb-3 inline-flex items-center gap-1 transition-colors duration-250"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Calendar Systems</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Display dates in multiple calendar systems
                </p>
              </div>
            </div>
          </div>
          
          {/* Save/Cancel Buttons */}
          {hasChanges && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-250"
                style={{ backgroundColor: 'var(--accent-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                Apply & Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-lg font-semibold transition-colors duration-250"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        {preferences.selectedCalendars.length > 0 && (
          <div className="rounded-lg p-6 mb-6 border-2 transition-colors duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
            <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Preview</h2>
            <div className="space-y-3">
              {/* Gregorian (always shown) */}
              <div>
                <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Standard</div>
                <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  📅 {formatInCalendarWithWeekday(previewDate, 'gregorian')}
                </div>
              </div>
              
              {/* Additional Calendars */}
              {preferences.selectedCalendars.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Additional</div>
                  <div className="space-y-1">
                    {preferences.selectedCalendars.map(calendarId => {
                      const system = CALENDAR_SYSTEMS.find(s => s.id === calendarId)
                      return (
                        <div key={calendarId} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {system?.emoji} {formatInCalendarWithWeekday(previewDate, calendarId)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Calendars */}
        <div className="rounded-lg p-6 mb-6 border-2 transition-colors duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
          <h2 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Additional Calendars</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Show these calendar dates alongside the standard Gregorian calendar
          </p>
          <div className="space-y-2">
            {CALENDAR_SYSTEMS.filter(s => s.id !== 'gregorian').map(system => {
              const isActive = preferences.selectedCalendars.includes(system.id)
              return (
                <button
                  key={system.id}
                  onClick={() => toggleCalendar(system.id)}
                  className="w-full p-4 rounded-lg border-2 transition-all duration-250 text-left"
                  style={{
                    border: isActive ? '2px solid var(--accent-primary)' : '2px solid var(--glass-border)',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = 'var(--glass-border)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = 'var(--glass-border)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{system.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {system.name}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {system.description}
                      </div>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--accent-primary)' }} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Display Options */}
        <div className="rounded-lg p-6 border-2 transition-colors duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Display Options</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showInToday}
                onChange={handleToggleShowInToday}
                className="w-5 h-5 rounded transition-colors duration-250"
                style={{ borderColor: 'var(--glass-border)', accentColor: 'var(--accent-primary)' }}
              />
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Show in Today view</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Display secondary calendars on the Today page
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showInWeekly}
                onChange={handleToggleShowInWeekly}
                className="w-5 h-5 rounded transition-colors duration-250"
                style={{ borderColor: 'var(--glass-border)', accentColor: 'var(--accent-primary)' }}
              />
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Show in weekly views</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Display secondary calendars in meal planning and weekly schedules
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg border transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <strong>💡 Tip:</strong> Calendar dates are calculated using your device's native
            calendar support. All conversions happen instantly with no internet required.
          </p>
        </div>

        {/* Bottom Save Button (sticky on mobile) - Apple-style glass pill */}
        {hasChanges && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-floating-bar px-4 py-3 md:hidden z-50" style={{ width: 'calc(100% - 2rem)', maxWidth: '24rem' }}>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-full font-semibold transition-colors duration-250 text-sm"
                style={{ backgroundColor: 'var(--accent-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                Apply & Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-full font-semibold transition-colors duration-250 text-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
