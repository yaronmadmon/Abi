'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Calendar,
  ChevronLeft,
  CreditCard,
  Download,
  HelpCircle,
  Home,
  Lock,
  LogOut,
  Mail,
  Mic,
  Monitor,
  Moon,
  Shield,
  ShoppingCart,
  Sparkles,
  Sun,
  Trash2,
  User,
  Users,
  UserRound,
  Settings as SettingsIcon,
  SlidersHorizontal,
} from 'lucide-react'
import SettingsSection from './SettingsSection'
import SettingsRow from './SettingsRow'
import { showToast } from '@/components/feedback/ToastContainer'
import { useAbiSettings, type AbiConfirmationStyle, type AbiResponseStyle, type AbiTone, type MeasurementUnits } from './useAbiSettings'
import { useTheme } from '@/contexts/ThemeContext'

type ScreenId =
  | 'main'
  | 'account'
  | 'householdProfile'
  | 'householdMembers'
  | 'billing'
  | 'security'
  | 'responseStyle'
  | 'confirmationStyle'
  | 'AbiTone'
  | 'dietaryPreferences'
  | 'shoppingPreferences'
  | 'measurementUnits'
  | 'dailySummaryTime'
  | 'quietHours'
  | 'whatAbbyCanRemember'
  | 'calendarConnection'
  | 'exportData'
  | 'howAbbyWorks'
  | 'sendFeedback'
  | 'contactSupport'

function formatTimeLabel(hhmm: string) {
  // "21:00" -> "9:00 PM" (simple, locale-safe)
  const [hStr, mStr] = hhmm.split(':')
  const h = Number(hStr)
  const m = Number(mStr)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm
  const hour12 = ((h + 11) % 12) + 1
  const ampm = h >= 12 ? 'PM' : 'AM'
  const mm = String(m).padStart(2, '0')
  return `${hour12}:${mm} ${ampm}`
}

function PrimaryButton({ children, onClick, variant = 'primary' }: { children: string; onClick: () => void; variant?: 'primary' | 'danger' }) {
  const isDanger = variant === 'danger'
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-3 rounded-xl font-medium transition-all active:scale-[0.99]"
      style={{
        backgroundColor: isDanger ? '#b91c1c' : 'var(--accent-blue)',
        color: 'white',
      }}
    >
      {children}
    </button>
  )
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (next: string) => void
  placeholder: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={5}
      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{
        borderColor: 'var(--input-border)',
        backgroundColor: 'var(--input-bg)',
        color: 'var(--text-primary)',
      }}
    />
  )
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  isDanger,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  isDanger?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-0 overflow-hidden">
        <div className="p-5">
          <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {title}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-medium"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl font-medium"
            style={{
              backgroundColor: isDanger ? '#b91c1c' : 'var(--accent-blue)',
              color: 'white',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsScreen({ 
  email, 
  name, 
  provider, 
  userId 
}: { 
  email: string | null
  name: string | null
  provider: string | null
  userId: string | null
}) {
  const router = useRouter()
  const { viewMode, colorMode, toggleViewMode, toggleColorMode } = useTheme()
  const {
    settings,
    update,
    setQuietHours,
    setAbiCanRemember,
    addHouseholdMember,
    removeHouseholdMember,
    responseStyleLabel,
    confirmationStyleLabel,
    abiToneLabel,
    measurementUnitsLabel,
    resetToDefaults,
  } = useAbiSettings()

  const [stack, setStack] = useState<ScreenId[]>(['main'])
  const current = stack[stack.length - 1] || 'main'

  const push = (id: ScreenId) => setStack((prev) => [...prev, id])
  const pop = () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))

  const [confirm, setConfirm] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    isDanger?: boolean
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {},
  })

  const sectionStackClass = 'flex flex-col'
  const [feedbackText, setFeedbackText] = useState('')

  const membersSubtitle = useMemo(() => {
    const count = settings.householdMembers?.length || 0
    if (count <= 1) return 'Just you'
    return `${count} people`
  }, [settings.householdMembers])

  const quietHoursValue = useMemo(() => {
    if (!settings.quietHours.enabled) return 'Off'
    return `${formatTimeLabel(settings.quietHours.start)} – ${formatTimeLabel(settings.quietHours.end)}`
  }, [settings.quietHours.enabled, settings.quietHours.start, settings.quietHours.end])

  const rememberValue = useMemo(() => {
    const v = settings.abiCanRemember
    if (!v || v === null || typeof v !== 'object' || Array.isArray(v)) return 'Nothing'
    const enabledCount = Object.values(v).filter(Boolean).length
    return enabledCount === 0 ? 'Nothing' : enabledCount === 5 ? 'Everything' : 'Custom'
  }, [settings.abiCanRemember])

  const openClearabiMemory = () => {
    setConfirm({
      open: true,
      title: "Clear Abby’s memory?",
      message:
        'This clears what Abby has learned on this device (like chat history). Your lists and plans stay as they are.',
      confirmLabel: 'Clear memory',
      isDanger: true,
      onConfirm: () => {
        try {
          localStorage.removeItem('aiChatConsoleMessages')
          localStorage.removeItem('abiMemory.v1')
          showToast("Abby’s memory is cleared on this device.", 'success')
        } catch {
          showToast('Couldn’t clear memory right now.', 'error')
        } finally {
          setConfirm((c) => ({ ...c, open: false }))
        }
      },
    })
  }

  const openDeleteHouseholdData = () => {
    setConfirm({
      open: true,
      title: 'Delete household data?',
      message:
        'This removes your household data from this device (lists, notes, and settings). This can’t be undone.',
      confirmLabel: 'Delete',
      isDanger: true,
      onConfirm: () => {
        try {
          const keysToRemove = [
            'AbbySettings.v1',
            'tasks',
            'appointments',
            'notes',
            'thoughts',
            'shoppingItems',
            'meals',
            'aiChatConsoleMessages',
            'AbbyFeedback.v1',
          ]
          keysToRemove.forEach((k) => localStorage.removeItem(k))
          resetToDefaults()
          setStack(['main'])
          showToast('Household data deleted from this device.', 'success')
        } catch {
          showToast('Couldn’t delete data right now.', 'error')
        } finally {
          setConfirm((c) => ({ ...c, open: false }))
        }
      },
    })
  }

  const exportMyData = () => {
    try {
      const keys = [
        'AbbySettings.v1',
        'tasks',
        'appointments',
        'notes',
        'thoughts',
        'shoppingItems',
        'meals',
        'aiChatConsoleMessages',
        'AbbyFeedback.v1',
      ]
      const payload: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        keys: {},
      }

      keys.forEach((k) => {
        const raw = localStorage.getItem(k)
        ;(payload.keys as any)[k] = raw ? (() => {
          try {
            return JSON.parse(raw)
          } catch {
            return raw
          }
        })() : null
      })

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `Abby-export-${date}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('Your data export is ready.', 'success')
    } catch {
      showToast('Couldn’t export your data right now.', 'error')
    }
  }

  const Header = ({ title }: { title: string }) => (
    <div className="mb-6">
      {current !== 'main' ? (
        <button
          type="button"
          onClick={pop}
          className="flex items-center gap-2 text-sm font-medium mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          Settings
        </button>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
          {current === 'main' ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              How Abby behaves in your home.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )

  const mainScreen = (
    <>
      <Header title="Settings" />

      <div className="space-y-5">
        <SettingsSection title="Account">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Mail className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Email"
              kind="readonly"
              value={email || 'Not available'}
              isLast={false}
            />
            <SettingsRow
              icon={<User className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Name"
              kind="readonly"
              value={name || 'Not set'}
              isLast={false}
            />
            <SettingsRow
              icon={<Lock className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Login method"
              kind="readonly"
              value={provider ? (provider === 'google' ? 'Google' : provider === 'email' ? 'Email' : provider) : 'Not available'}
              isLast={false}
            />
            <SettingsRow
              icon={<UserRound className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Account details"
              onPress={() => push('account')}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Display">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Monitor className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="View mode"
              value={viewMode === 'mobile' ? 'Mobile' : 'Desktop'}
              kind="action"
              onPress={toggleViewMode}
              isLast={false}
            />
            <SettingsRow
              icon={colorMode === 'light' ? <Moon className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} /> : <Sun className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Color mode"
              value={colorMode === 'light' ? 'Light' : 'Dark'}
              kind="action"
              onPress={toggleColorMode}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Household">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Home className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Household Profile"
              subtitle={settings.householdName}
              onPress={() => push('householdProfile')}
              isLast={false}
            />
            <SettingsRow
              icon={<Users className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Household Members"
              subtitle={membersSubtitle}
              onPress={() => push('householdMembers')}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Notification Channels" description="How you receive notifications from the app">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Mail className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Email notifications"
              kind="toggle"
              toggled={settings.emailNotifications}
              onToggle={(next) => update({ emailNotifications: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<Bell className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="SMS notifications"
              kind="toggle"
              toggled={settings.smsNotifications}
              onToggle={(next) => update({ smsNotifications: next })}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Billing">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<CreditCard className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Current plan"
              kind="readonly"
              value="Free"
              isLast={false}
            />
            <SettingsRow
              icon={<CreditCard className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Payment method"
              kind="readonly"
              value="Not set"
              isLast={false}
            />
            <SettingsRow
              icon={<CreditCard className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Billing"
              onPress={() => push('billing')}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Abby Assistant"
          description="Choose how Abby speaks, checks in, and helps you around the house."
        >
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Sparkles className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Enable Abby Assistant"
              kind="toggle"
              toggled={settings.abiAssistantEnabled}
              onToggle={(next) => update({ abiAssistantEnabled: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<Mic className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Voice Mode"
              kind="toggle"
              toggled={settings.voiceModeEnabled}
              onToggle={(next) => update({ voiceModeEnabled: next })}
              disabled={!settings.abiAssistantEnabled}
              isLast={false}
            />
            <SettingsRow
              icon={<SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Response Style"
              value={responseStyleLabel[settings.responseStyle]}
              onPress={() => push('responseStyle')}
              disabled={!settings.abiAssistantEnabled}
              isLast={false}
            />
            <SettingsRow
              icon={<Lock className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Confirmation Style"
              value={confirmationStyleLabel[settings.confirmationStyle]}
              onPress={() => push('confirmationStyle')}
              disabled={!settings.abiAssistantEnabled}
              isLast={false}
            />
            <SettingsRow
              icon={<SettingsIcon className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Abby Tone"
              value={abiToneLabel?.[settings.abiTone] ?? 'Not set'}
              onPress={() => push('AbiTone')}
              disabled={!settings.abiAssistantEnabled}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Personalization">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Calendar className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Calendar Systems"
              value="Hebrew, Chinese, Islamic..."
              onPress={() => router.push('/settings/calendar')}
              isLast={false}
            />
            <SettingsRow
              icon={<UserRound className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Dietary Preferences"
              value={settings.dietaryPreferencesNote.trim() ? 'Saved' : 'None yet'}
              onPress={() => push('dietaryPreferences')}
              isLast={false}
            />
            <SettingsRow
              icon={<ShoppingCart className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Shopping Preferences"
              value={settings.shoppingPreferencesNote.trim() ? 'Saved' : 'None yet'}
              onPress={() => push('shoppingPreferences')}
              isLast={false}
            />
            <SettingsRow
              icon={<SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Measurement Units"
              value={measurementUnitsLabel[settings.measurementUnits]}
              onPress={() => push('measurementUnits')}
              isLast={false}
            />
            <SettingsRow
              icon={<Bell className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Daily Summary Time"
              value={formatTimeLabel(settings.dailySummaryTime)}
              onPress={() => push('dailySummaryTime')}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Abby Reminders" description="What Abby reminds you about">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<ShoppingCart className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Shopping reminders"
              kind="toggle"
              toggled={settings.shoppingReminders}
              onToggle={(next) => update({ shoppingReminders: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<Sparkles className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Meal prep reminders"
              kind="toggle"
              toggled={settings.mealPrepReminders}
              onToggle={(next) => update({ mealPrepReminders: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<Calendar className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Calendar reminders"
              kind="toggle"
              toggled={settings.calendarReminders}
              onToggle={(next) => update({ calendarReminders: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<Bell className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Quiet hours"
              value={quietHoursValue}
              onPress={() => push('quietHours')}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Parental Controls">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Lock className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Enable Parental Mode"
              kind="toggle"
              toggled={settings.parentalModeEnabled}
              onToggle={(next) => update({ parentalModeEnabled: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<ShoppingCart className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Require approval for shopping actions"
              kind="toggle"
              toggled={settings.requireApprovalForShoppingActions}
              onToggle={(next) => update({ requireApprovalForShoppingActions: next })}
              disabled={!settings.parentalModeEnabled}
              isLast={false}
            />
            <SettingsRow
              icon={<Calendar className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Restrict calendar edits"
              kind="toggle"
              toggled={settings.restrictCalendarEdits}
              onToggle={(next) => update({ restrictCalendarEdits: next })}
              disabled={!settings.parentalModeEnabled}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Security">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Shield className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Security"
              onPress={() => push('security')}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Privacy & Data">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Lock className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="What Abby can remember"
              value={rememberValue}
              onPress={() => push('whatAbbyCanRemember')}
              isLast={false}
            />
            <SettingsRow
              icon={<Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} strokeWidth={1.75} />}
              title="Clear Abby memory"
              kind="danger"
              onPress={openClearabiMemory}
              isLast={false}
            />
            <SettingsRow
              icon={<Download className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Export my data"
              onPress={() => push('exportData')}
              isLast={false}
            />
            <SettingsRow
              icon={<Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} strokeWidth={1.75} />}
              title="Delete household data"
              kind="danger"
              onPress={openDeleteHouseholdData}
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Connected Apps">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Calendar className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Calendar"
              value={settings.calendarConnected ? 'Connected' : 'Not connected'}
              onPress={() => push('calendarConnection')}
              isLast={false}
            />
            <SettingsRow
              icon={<ShoppingCart className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Grocery apps"
              value="Coming soon"
              kind="readonly"
              disabled
              isLast={false}
            />
            <SettingsRow
              icon={<Home className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Smart home"
              value="Not available yet"
              kind="readonly"
              disabled
              isLast
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Help & Support">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<HelpCircle className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="How Abby works"
              onPress={() => push('howAbbyWorks')}
              isLast={false}
            />
            <SettingsRow
              icon={<Mail className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Send feedback"
              onPress={() => push('sendFeedback')}
              isLast={false}
            />
            <SettingsRow
              icon={<Mail className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Contact support"
              onPress={() => push('contactSupport')}
              isLast
            />
          </div>
        </SettingsSection>
      </div>
    </>
  )

  const optionScreen = <T extends string>({
    title,
    value,
    options,
    onSelect,
  }: {
    title: string
    value: T
    options: Array<{ value: T; label: string; subtitle?: string }>
    onSelect: (next: T) => void
  }) => (
    <>
      <Header title={title} />
      <SettingsSection title={title}>
        <div className={sectionStackClass}>
          {options.map((opt, idx) => (
            <SettingsRow
              key={opt.value}
              title={opt.label}
              subtitle={opt.subtitle}
              kind="action"
              onPress={() => {
                onSelect(opt.value)
                pop()
              }}
              rightAccessory={
                opt.value === value ? (
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>
                    ✓
                  </span>
                ) : null
              }
              isLast={idx === options.length - 1}
            />
          ))}
        </div>
      </SettingsSection>
    </>
  )

  const contentByScreen: Record<ScreenId, JSX.Element> = {
    main: mainScreen,

    account: (
      <>
        <Header title="Account" />
        <SettingsSection title="Your account">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Mail className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Email"
              kind="readonly"
              value={email || 'Not available'}
              isLast={false}
            />
            <SettingsRow
              icon={<User className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Name"
              kind="readonly"
              value={name || 'Not set'}
              isLast={false}
            />
            <SettingsRow
              icon={<Lock className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Login method"
              kind="readonly"
              value={provider ? (provider === 'google' ? 'Google' : provider === 'email' ? 'Email' : provider) : 'Not available'}
              isLast
            />
          </div>
        </SettingsSection>
      </>
    ),

    billing: (
      <>
        <Header title="Billing" />
        <SettingsSection title="Subscription">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<CreditCard className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Current plan"
              kind="readonly"
              value="Free"
              isLast={false}
            />
            <SettingsRow
              icon={<CreditCard className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Payment method"
              kind="readonly"
              value="Not set"
              isLast
            />
          </div>
        </SettingsSection>
        <SettingsSection title="Information">
          <div className="px-4 py-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Billing features are coming soon. You'll be able to upgrade your plan and manage payment methods here.
            </p>
          </div>
        </SettingsSection>
      </>
    ),

    security: (
      <>
        <Header title="Security" />
        <SettingsSection title="Account security">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<LogOut className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Sign out"
              kind="action"
              onPress={async () => {
                try {
                  const { createClient } = await import('@/lib/supabase-client')
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  showToast('Signed out successfully', 'success')
                  // TEMPORARY: Redirect to early access page instead of login
                  router.push('/early-access')
                } catch (error) {
                  console.error('Error signing out:', error)
                  showToast('Could not sign out. Please try again.', 'error')
                }
              }}
              isLast={false}
            />
            <SettingsRow
              icon={<Trash2 className="w-4 h-4" style={{ color: '#b91c1c' }} strokeWidth={1.75} />}
              title="Delete account"
              kind="danger"
              onPress={() => {
                setConfirm({
                  open: true,
                  title: 'Delete account?',
                  message: 'This will permanently delete your account and all associated data. This action cannot be undone.',
                  confirmLabel: 'Delete account',
                  isDanger: true,
                  onConfirm: async () => {
                    try {
                      // For MVP, redirect to support for account deletion
                      // In production, this would call an API route with Supabase admin client
                      window.location.href = 'mailto:support@abby.app?subject=Account%20Deletion%20Request'
                      showToast('Please contact support to delete your account.', 'info')
                      setConfirm((c) => ({ ...c, open: false }))
                    } catch (error) {
                      console.error('Error deleting account:', error)
                      showToast('Could not process deletion request.', 'error')
                      setConfirm((c) => ({ ...c, open: false }))
                    }
                  },
                })
              }}
              isLast
            />
          </div>
        </SettingsSection>
      </>
    ),

    householdProfile: (
      <>
        <Header title="Household Profile" />
        <SettingsSection title="Home">
          <div className="px-4 py-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Household name
            </label>
            <input
              value={settings.householdName}
              onChange={(e) => update({ householdName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: 'var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
              }}
              placeholder="Our Home"
            />
            <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              This helps Abby speak naturally (“at home”, “in our kitchen”, etc.).
            </p>
          </div>
        </SettingsSection>
      </>
    ),

    householdMembers: (
      <>
        <Header title="Household Members" />
        <SettingsSection title="People at home">
          <div className={sectionStackClass}>
            {(settings.householdMembers || []).map((name, idx, arr) => (
              <SettingsRow
                key={name}
                icon={<Users className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
                title={name}
                kind="action"
                onPress={() => {
                  if (name === 'Me') {
                    showToast('“Me” stays so Abby always has someone to help.', 'success')
                    return
                  }
                  removeHouseholdMember(name)
                  showToast('Member removed.', 'success')
                }}
                rightAccessory={
                  name === 'Me' ? (
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Primary
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Remove
                    </span>
                  )
                }
                isLast={idx === arr.length - 1}
              />
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="Add someone">
          <div className="px-4 py-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Name
            </label>
            <div className="flex gap-2">
              <input
                id="new-member"
                className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: 'var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                }}
                placeholder="e.g., Sam"
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  const input = e.currentTarget as HTMLInputElement
                  addHouseholdMember(input.value)
                  input.value = ''
                  showToast('Member added.', 'success')
                }}
              />
              <button
                type="button"
                className="px-4 py-3 rounded-xl font-medium"
                style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}
                onClick={() => {
                  const el = document.getElementById('new-member') as HTMLInputElement | null
                  if (!el) return
                  addHouseholdMember(el.value)
                  el.value = ''
                  showToast('Member added.', 'success')
                }}
              >
                Add
              </button>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              This is just for Abby’s tone and references (you can change it anytime).
            </p>
          </div>
        </SettingsSection>
      </>
    ),

    responseStyle: optionScreen<AbiResponseStyle>({
      title: 'Response Style',
      value: settings.responseStyle,
      options: [
        { value: 'gentle_supportive', label: 'Gentle & supportive', subtitle: 'Warm, encouraging, and calm.' },
        { value: 'short_clear', label: 'Short & clear', subtitle: 'Quick answers with the essentials.' },
        { value: 'detailed_guiding', label: 'Detailed & guiding', subtitle: 'Step-by-step help when you need it.' },
      ],
      onSelect: (next) => update({ responseStyle: next }),
    }),

    confirmationStyle: optionScreen<AbiConfirmationStyle>({
      title: 'Confirmation Style',
      value: settings.confirmationStyle,
      options: [
        { value: 'ask_before_doing', label: 'Ask before doing', subtitle: 'Abby checks with you first.' },
        { value: 'just_do_it', label: 'Just do it', subtitle: 'Abby moves faster with fewer prompts.' },
      ],
      onSelect: (next) => update({ confirmationStyle: next }),
    }),

    AbiTone: optionScreen<AbiTone>({
      title: 'Abby Tone',
      value: settings.abiTone,
      options: [
        { value: 'warm', label: 'Warm', subtitle: 'Friendly, human, and gentle.' },
        { value: 'neutral', label: 'Neutral', subtitle: 'Balanced and steady.' },
        { value: 'efficient', label: 'Efficient', subtitle: 'Direct, quick, and focused.' },
      ],
      onSelect: (next) => update({ abiTone: next }),
    }),

    dietaryPreferences: (
      <>
        <Header title="Dietary Preferences" />
        <SettingsSection title="Tell Abby what matters">
          <div className="px-4 py-4">
            <TextArea
              value={settings.dietaryPreferencesNote}
              onChange={(next) => update({ dietaryPreferencesNote: next })}
              placeholder="Examples: peanut allergy, vegetarian dinners, low-sugar snacks, no pork…"
            />
            <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Abby uses this for meal ideas and shopping suggestions.
            </p>
          </div>
        </SettingsSection>
      </>
    ),

    shoppingPreferences: (
      <>
        <Header title="Shopping Preferences" />
        <SettingsSection title="How you like to shop">
          <div className="px-4 py-4">
            <TextArea
              value={settings.shoppingPreferencesNote}
              onChange={(next) => update({ shoppingPreferencesNote: next })}
              placeholder="Examples: I buy store-brand, I like curbside pickup, I restock on Sundays…"
            />
            <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Abby uses this to keep shopping help consistent with your routine.
            </p>
          </div>
        </SettingsSection>
      </>
    ),

    measurementUnits: optionScreen<MeasurementUnits>({
      title: 'Measurement Units',
      value: settings.measurementUnits,
      options: [
        { value: 'us', label: 'US (cups, °F)', subtitle: 'Great for US-style recipes.' },
        { value: 'metric', label: 'Metric (ml, °C)', subtitle: 'Great for metric recipes.' },
      ],
      onSelect: (next) => update({ measurementUnits: next }),
    }),

    dailySummaryTime: (
      <>
        <Header title="Daily Summary Time" />
        <SettingsSection title="When Abby checks in">
          <div className="px-4 py-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Time
            </label>
            <input
              type="time"
              value={settings.dailySummaryTime}
              onChange={(e) => update({ dailySummaryTime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border"
              style={{
                borderColor: 'var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {['07:30', '08:30', '09:30'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className="px-3 py-2 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  onClick={() => update({ dailySummaryTime: t })}
                >
                  {formatTimeLabel(t)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Abby can summarize your day and what’s coming up.
            </p>
          </div>
        </SettingsSection>
      </>
    ),

    quietHours: (
      <>
        <Header title="Quiet Hours" />
        <SettingsSection title="Let evenings stay calm">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Bell className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Enable quiet hours"
              kind="toggle"
              toggled={settings.quietHours.enabled}
              onToggle={(next) => setQuietHours({ enabled: next })}
              isLast={false}
            />
            <div className="px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    Starts
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => setQuietHours({ start: e.target.value })}
                    disabled={!settings.quietHours.enabled}
                    className="w-full px-4 py-3 rounded-xl border"
                    style={{
                      borderColor: 'var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      opacity: settings.quietHours.enabled ? 1 : 0.6,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    Ends
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => setQuietHours({ end: e.target.value })}
                    disabled={!settings.quietHours.enabled}
                    className="w-full px-4 py-3 rounded-xl border"
                    style={{
                      borderColor: 'var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      opacity: settings.quietHours.enabled ? 1 : 0.6,
                    }}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                During quiet hours, Abby stays more gentle with reminders.
              </p>
            </div>
          </div>
        </SettingsSection>
      </>
    ),

    whatAbbyCanRemember: (
      <>
        <Header title="What Abby can remember" />
        <SettingsSection title="Your comfort comes first" description="Choose what Abby can learn from your home life. You can change this anytime.">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Users className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Names & relationships"
              kind="toggle"
              toggled={settings.abiCanRemember?.namesAndRelationships ?? false}
              onToggle={(next) => setAbiCanRemember({ namesAndRelationships: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<Home className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Routines & preferences"
              kind="toggle"
              toggled={settings.abiCanRemember?.routinesAndPreferences ?? false}
              onToggle={(next) => setAbiCanRemember({ routinesAndPreferences: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<ShoppingCart className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Shopping habits"
              kind="toggle"
              toggled={settings.abiCanRemember?.shoppingHabits ?? false}
              onToggle={(next) => setAbiCanRemember({ shoppingHabits: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<Sparkles className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Meal preferences"
              kind="toggle"
              toggled={settings.abiCanRemember?.mealPreferences ?? false}
              onToggle={(next) => setAbiCanRemember({ mealPreferences: next })}
              isLast={false}
            />
            <SettingsRow
              icon={<Calendar className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Calendar context"
              kind="toggle"
              toggled={settings.abiCanRemember?.calendarContext ?? false}
              onToggle={(next) => setAbiCanRemember({ calendarContext: next })}
              isLast
            />
          </div>
        </SettingsSection>
      </>
    ),

    calendarConnection: (
      <>
        <Header title="Calendar" />
        <SettingsSection title="Connection">
          <div className={sectionStackClass}>
            <SettingsRow
              icon={<Calendar className="w-4 h-4" style={{ color: 'var(--icon-color)' }} strokeWidth={1.75} />}
              title="Calendar connection"
              kind="toggle"
              toggled={settings.calendarConnected}
              onToggle={(next) => {
                update({ calendarConnected: next })
                showToast(next ? 'Calendar marked as connected.' : 'Calendar marked as not connected.', 'success')
              }}
              isLast={false}
            />
            <div className="px-4 py-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                This is a simple connection status for now. Abby will use it to know whether to offer calendar help.
              </p>
            </div>
          </div>
        </SettingsSection>
      </>
    ),

    exportData: (
      <>
        <Header title="Export my data" />
        <SettingsSection title="Download a copy">
          <div className="px-4 py-4">
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              You can export a copy of your data saved on this device.
            </p>
            <PrimaryButton onClick={exportMyData}>Export as file</PrimaryButton>
          </div>
        </SettingsSection>
      </>
    ),

    howAbbyWorks: (
      <>
        <Header title="How Abby works" />
        <SettingsSection title="A calm helper">
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Abby is here to help you run your home with less mental load. You can ask for quick help, or let Abby guide you step-by-step—your choice.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your settings shape how Abby responds: tone, level of detail, and when Abby should ask before taking action.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              You’re always in control. You can adjust what Abby remembers, clear memory, or export your data whenever you want.
            </p>
          </div>
        </SettingsSection>
      </>
    ),

    sendFeedback: (
      <>
        <Header title="Send feedback" />
        <SettingsSection title="What should we improve?">
          <div className="px-4 py-4">
            <TextArea
              value={feedbackText}
              onChange={setFeedbackText}
              placeholder="Share what felt great, what felt confusing, or what you wish Abby could do…"
            />
            <div className="mt-3">
              <PrimaryButton
                onClick={() => {
                  const text = feedbackText.trim()
                  if (!text) {
                    showToast('Write a quick note first.', 'error')
                    return
                  }
                  try {
                    const key = 'AbbyFeedback.v1'
                    const raw = localStorage.getItem(key)
                    const existing = raw ? JSON.parse(raw) : []
                    const next = Array.isArray(existing) ? existing : []
                    next.push({ id: `fb-${Date.now()}`, text, createdAt: new Date().toISOString() })
                    localStorage.setItem(key, JSON.stringify(next))
                    setFeedbackText('')
                    showToast('Thanks — feedback saved.', 'success')
                  } catch {
                    showToast('Couldn’t save feedback right now.', 'error')
                  }
                }}
              >
                Send feedback
              </PrimaryButton>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Feedback is saved on this device.
            </p>
          </div>
        </SettingsSection>
      </>
    ),

    contactSupport: (
      <>
        <Header title="Contact support" />
        <SettingsSection title="Get help">
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              If something isn’t working the way you expect, we’re here to help.
            </p>
            <PrimaryButton
              onClick={() => {
                window.location.href = 'mailto:support@Abby.app?subject=Abby%20Support'
              }}
            >
              Email support
            </PrimaryButton>
            <button
              type="button"
              className="w-full px-4 py-3 rounded-xl font-medium"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('support@Abby.app')
                  showToast('Support email copied.', 'success')
                } catch {
                  showToast('Couldn’t copy right now.', 'error')
                }
              }}
            >
              Copy support email
            </button>
          </div>
        </SettingsSection>
      </>
    ),
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        {contentByScreen[current]}
      </div>

      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        isDanger={confirm.isDanger}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
        onConfirm={confirm.onConfirm}
      />
    </div>
  )
}

