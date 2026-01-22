/* eslint-disable no-console */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type AbiResponseStyle = 'gentle_supportive' | 'short_clear' | 'detailed_guiding'
export type AbiConfirmationStyle = 'ask_before_doing' | 'just_do_it'
export type AbiTone = 'warm' | 'neutral' | 'efficient'
export type MeasurementUnits = 'us' | 'metric'

export interface QuietHours {
  enabled: boolean
  start: string // "HH:MM"
  end: string // "HH:MM"
}

export interface AbiCanRemember {
  namesAndRelationships: boolean
  routinesAndPreferences: boolean
  shoppingHabits: boolean
  mealPreferences: boolean
  calendarContext: boolean
}

export interface AbiSettings {
  // Account-ish (local placeholders)
  householdName: string
  householdMembers: string[]

  // Abi Assistant
  abiAssistantEnabled: boolean
  voiceModeEnabled: boolean
  responseStyle: AbiResponseStyle
  confirmationStyle: AbiConfirmationStyle
  abiTone: AbiTone

  // Personalization
  dietaryPreferencesNote: string
  shoppingPreferencesNote: string
  measurementUnits: MeasurementUnits
  dailySummaryTime: string // "HH:MM"

  // Notifications
  shoppingReminders: boolean
  mealPrepReminders: boolean
  calendarReminders: boolean
  quietHours: QuietHours
  // Notification Channels (app-level)
  emailNotifications: boolean
  smsNotifications: boolean

  // Parental controls
  parentalModeEnabled: boolean
  requireApprovalForShoppingActions: boolean
  restrictCalendarEdits: boolean

  // Privacy & data
  abiCanRemember: AbiCanRemember

  // Connected apps (local placeholder state)
  calendarConnected: boolean
}

const STORAGE_KEY = 'abiSettings.v1'

const defaultSettings: AbiSettings = {
  householdName: 'Our Home',
  householdMembers: ['Me'],

  abiAssistantEnabled: true,
  voiceModeEnabled: true,
  responseStyle: 'gentle_supportive',
  confirmationStyle: 'ask_before_doing',
  abiTone: 'warm',

  dietaryPreferencesNote: '',
  shoppingPreferencesNote: '',
  measurementUnits: 'us',
  dailySummaryTime: '08:30',

  shoppingReminders: true,
  mealPrepReminders: true,
  calendarReminders: true,
  quietHours: { enabled: false, start: '21:00', end: '07:00' },
  emailNotifications: true,
  smsNotifications: false,

  parentalModeEnabled: false,
  requireApprovalForShoppingActions: true,
  restrictCalendarEdits: false,

  abiCanRemember: {
    namesAndRelationships: true,
    routinesAndPreferences: true,
    shoppingHabits: true,
    mealPreferences: true,
    calendarContext: true,
  },

  calendarConnected: false,
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function normalizeSettings(raw: unknown): AbiSettings {
  // Keep it strict-but-forgiving: merge unknown objects into defaults.
  if (!raw || typeof raw !== 'object') return defaultSettings
  return {
    ...defaultSettings,
    ...(raw as Partial<AbiSettings>),
    quietHours: {
      ...defaultSettings.quietHours,
      ...((raw as Partial<AbiSettings>).quietHours || {}),
    },
    abiCanRemember: {
      ...defaultSettings.abiCanRemember,
      ...((raw as Partial<AbiSettings>).abiCanRemember || {}),
    },
    householdMembers: Array.isArray((raw as Partial<AbiSettings>).householdMembers)
      ? ((raw as Partial<AbiSettings>).householdMembers as string[]).filter((m) => typeof m === 'string' && m.trim())
      : defaultSettings.householdMembers,
  }
}

export function useAbiSettings() {
  const [settings, setSettings] = useState<AbiSettings>(defaultSettings)
  const [isHydrated, setIsHydrated] = useState(false)
  const didHydrateRef = useRef(false)

  // Initial load
  useEffect(() => {
    if (didHydrateRef.current) return
    didHydrateRef.current = true
    const parsed = safeParseJson<unknown>(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
    setSettings(normalizeSettings(parsed))
    setIsHydrated(true)
  }, [])

  // Persist
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {
      console.warn('Failed to save settings:', e)
    }
  }, [isHydrated, settings])

  // Cross-tab sync (best-effort)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const parsed = safeParseJson<unknown>(e.newValue)
      setSettings(normalizeSettings(parsed))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((patch: Partial<AbiSettings>) => {
    setSettings((prev) => normalizeSettings({ ...prev, ...patch }))
  }, [])

  const setQuietHours = useCallback((quietHours: Partial<QuietHours>) => {
    setSettings((prev) =>
      normalizeSettings({
        ...prev,
        quietHours: {
          ...prev.quietHours,
          ...quietHours,
        },
      })
    )
  }, [])

  const setAbiCanRemember = useCallback((patch: Partial<AbiCanRemember>) => {
    setSettings((prev) =>
      normalizeSettings({
        ...prev,
        abiCanRemember: {
          ...prev.abiCanRemember,
          ...patch,
        },
      })
    )
  }, [])

  const addHouseholdMember = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSettings((prev) => {
      const next = Array.from(new Set([...(prev.householdMembers || []), trimmed]))
      return normalizeSettings({ ...prev, householdMembers: next })
    })
  }, [])

  const removeHouseholdMember = useCallback((name: string) => {
    setSettings((prev) => {
      const next = (prev.householdMembers || []).filter((m) => m !== name)
      return normalizeSettings({ ...prev, householdMembers: next.length ? next : ['Me'] })
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  const helpers = useMemo(() => {
    const responseStyleLabel: Record<AbiResponseStyle, string> = {
      gentle_supportive: 'Gentle & supportive',
      short_clear: 'Short & clear',
      detailed_guiding: 'Detailed & guiding',
    }
    const confirmationStyleLabel: Record<AbiConfirmationStyle, string> = {
      ask_before_doing: 'Ask before doing',
      just_do_it: 'Just do it',
    }
    const abiToneLabel: Record<AbiTone, string> = {
      warm: 'Warm',
      neutral: 'Neutral',
      efficient: 'Efficient',
    }
    const measurementUnitsLabel: Record<MeasurementUnits, string> = {
      us: 'US (cups, °F)',
      metric: 'Metric (ml, °C)',
    }

    return {
      responseStyleLabel,
      confirmationStyleLabel,
      abiToneLabel,
      measurementUnitsLabel,
    }
  }, [])

  return {
    settings,
    isHydrated,
    update,
    setQuietHours,
    setAbiCanRemember,
    addHouseholdMember,
    removeHouseholdMember,
    resetToDefaults,
    ...helpers,
  }
}

