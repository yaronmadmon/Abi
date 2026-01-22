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
    
    console.log('Change detection:', {
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
      console.log('Saving preferences:', preferences)
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
      console.error('Error saving calendar preferences:', error)
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
            className="text-gray-500 hover:text-gray-700 text-sm mb-3 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendar Systems</h1>
                <p className="text-sm text-gray-500 mt-1">
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
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                Apply & Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        {preferences.selectedCalendars.length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-6 border-2 border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Preview</h2>
            <div className="space-y-3">
              {/* Gregorian (always shown) */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Standard</div>
                <div className="text-lg font-semibold text-gray-900">
                  📅 {formatInCalendarWithWeekday(previewDate, 'gregorian')}
                </div>
              </div>
              
              {/* Additional Calendars */}
              {preferences.selectedCalendars.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Additional</div>
                  <div className="space-y-1">
                    {preferences.selectedCalendars.map(calendarId => {
                      const system = CALENDAR_SYSTEMS.find(s => s.id === calendarId)
                      return (
                        <div key={calendarId} className="text-sm text-gray-700">
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
        <div className="bg-white rounded-lg p-6 mb-6 border-2 border-gray-100">
          <h2 className="font-bold text-gray-900 mb-2">Additional Calendars</h2>
          <p className="text-sm text-gray-600 mb-4">
            Show these calendar dates alongside the standard Gregorian calendar
          </p>
          <div className="space-y-2">
            {CALENDAR_SYSTEMS.filter(s => s.id !== 'gregorian').map(system => {
              const isActive = preferences.selectedCalendars.includes(system.id)
              return (
                <button
                  key={system.id}
                  onClick={() => toggleCalendar(system.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{system.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {system.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {system.description}
                      </div>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Display Options */}
        <div className="bg-white rounded-lg p-6 border-2 border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Display Options</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showInToday}
                onChange={handleToggleShowInToday}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Show in Today view</div>
                <div className="text-sm text-gray-600">
                  Display secondary calendars on the Today page
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showInWeekly}
                onChange={handleToggleShowInWeekly}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Show in weekly views</div>
                <div className="text-sm text-gray-600">
                  Display secondary calendars in meal planning and weekly schedules
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Calendar dates are calculated using your device's native
            calendar support. All conversions happen instantly with no internet required.
          </p>
        </div>

        {/* Bottom Save Button (sticky on mobile) */}
        {hasChanges && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
            <div className="flex gap-3 max-w-2xl mx-auto">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                Apply & Save
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
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
