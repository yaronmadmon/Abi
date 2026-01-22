// Multi-Calendar System Support
// Uses native JavaScript Intl API - no external dependencies

export interface CalendarSystem {
  id: string
  name: string
  locale: string
  calendar: string
  emoji: string
  description: string
}

export const CALENDAR_SYSTEMS: CalendarSystem[] = [
  {
    id: 'gregorian',
    name: 'Gregorian',
    locale: 'en-US',
    calendar: 'gregory',
    emoji: '📅',
    description: 'Standard international calendar'
  },
  {
    id: 'hebrew',
    name: 'Hebrew',
    locale: 'he-IL',
    calendar: 'hebrew',
    emoji: '🕎',
    description: 'Jewish lunar-solar calendar'
  },
  {
    id: 'chinese',
    name: 'Chinese',
    locale: 'zh-CN',
    calendar: 'chinese',
    emoji: '🏮',
    description: 'Traditional Chinese lunisolar calendar'
  },
  {
    id: 'islamic',
    name: 'Islamic',
    locale: 'ar-SA',
    calendar: 'islamic',
    emoji: '🌙',
    description: 'Hijri lunar calendar'
  },
  {
    id: 'persian',
    name: 'Persian',
    locale: 'fa-IR',
    calendar: 'persian',
    emoji: '🇮🇷',
    description: 'Solar Hijri calendar'
  },
  {
    id: 'indian',
    name: 'Indian',
    locale: 'hi-IN',
    calendar: 'indian',
    emoji: '🇮🇳',
    description: 'National calendar of India'
  },
  {
    id: 'buddhist',
    name: 'Buddhist',
    locale: 'th-TH',
    calendar: 'buddhist',
    emoji: '☸️',
    description: 'Thai Buddhist calendar'
  },
  {
    id: 'japanese',
    name: 'Japanese',
    locale: 'ja-JP',
    calendar: 'japanese',
    emoji: '🇯🇵',
    description: 'Japanese imperial calendar'
  },
  {
    id: 'ethiopic',
    name: 'Ethiopian',
    locale: 'am-ET',
    calendar: 'ethiopic',
    emoji: '🇪🇹',
    description: 'Ethiopian calendar'
  },
  {
    id: 'coptic',
    name: 'Coptic',
    locale: 'ar-EG',
    calendar: 'coptic',
    emoji: '✝️',
    description: 'Coptic Orthodox calendar'
  }
]

export interface CalendarPreferences {
  selectedCalendars: string[]  // Hebrew, Chinese, etc. (Gregorian is always the base)
  showInToday: boolean
  showInWeekly: boolean
}

const STORAGE_KEY = 'calendarPreferences'

export function getCalendarPreferences(): CalendarPreferences {
  if (typeof window === 'undefined') {
    return {
      selectedCalendars: [],
      showInToday: true,
      showInWeekly: false
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const prefs = JSON.parse(stored)
      // Migrate old format (primary/secondary) to new format
      if ('primary' in prefs || 'secondary' in prefs) {
        const migrated: CalendarPreferences = {
          selectedCalendars: prefs.secondary || [],
          showInToday: prefs.showInToday ?? true,
          showInWeekly: prefs.showInWeekly ?? false
        }
        // Save migrated format
        saveCalendarPreferences(migrated)
        return migrated
      }
      return prefs
    } catch (error) {
      console.error('Error parsing calendar preferences:', error)
    }
  }

  return {
    selectedCalendars: [],
    showInToday: true,
    showInWeekly: false
  }
}

export function saveCalendarPreferences(preferences: CalendarPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  window.dispatchEvent(new Event('calendarPreferencesUpdated'))
}

export function formatInCalendar(
  date: Date,
  calendarId: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const system = CALENDAR_SYSTEMS.find(s => s.id === calendarId)
  if (!system) {
    return date.toLocaleDateString()
  }

  try {
    const formatter = new Intl.DateTimeFormat(
      `${system.locale}-u-ca-${system.calendar}`,
      options || {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    )
    return formatter.format(date)
  } catch (error) {
    console.error(`Error formatting date in ${calendarId}:`, error)
    return date.toLocaleDateString()
  }
}

export function formatInCalendarShort(
  date: Date,
  calendarId: string
): string {
  return formatInCalendar(date, calendarId, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatInCalendarWithWeekday(
  date: Date,
  calendarId: string
): string {
  return formatInCalendar(date, calendarId, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getCalendarSystem(id: string): CalendarSystem | undefined {
  return CALENDAR_SYSTEMS.find(s => s.id === id)
}

export function getActiveCalendars(): CalendarSystem[] {
  const prefs = getCalendarPreferences()
  const calendars: CalendarSystem[] = []
  
  // Add all selected calendars
  prefs.selectedCalendars.forEach(id => {
    const calendar = getCalendarSystem(id)
    if (calendar && calendar.id !== 'gregorian') {  // Gregorian is always the base, don't duplicate
      calendars.push(calendar)
    }
  })
  
  return calendars
}
