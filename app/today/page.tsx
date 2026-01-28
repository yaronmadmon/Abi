'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, CheckSquare, FileText, ShoppingCart } from 'lucide-react'
import GreetingHeader from '@/components/today/GreetingHeader'
import AIFocusHeader from '@/components/today/AIFocusHeader'
import WeatherCard from '@/components/today/WeatherCard'
import CalendarCard from '@/components/today/CalendarCard'
import QuickCaptureRow from '@/components/today/QuickCaptureRow'
import CareCard from '@/components/today/CareCard'
import GlanceBar from '@/components/today/GlanceBar'
import NowCard from '@/components/today/NowCard'
import { useEveningMode } from '@/hooks/useEveningMode'
import { getCalendarPreferences, formatInCalendar, getCalendarSystem } from '@/lib/calendarSystems'
import type { CalendarPreferences } from '@/lib/calendarSystems'
import type { Task } from '@/types/home'
import PageContainer from '@/components/ui/PageContainer'
import { logger } from '@/lib/logger'

interface Appointment {
  id: string
  title: string
  date?: string
  time?: string
}

interface Note {
  id: string
  title: string
  body: string
}

export default function TodayPage() {
  const isEveningMode = useEveningMode()
  const router = useRouter()
  const [taskCount, setTaskCount] = useState(0)
  const [appointmentCount, setAppointmentCount] = useState(0)
  const [noteCount, setNoteCount] = useState(0)
  const [shoppingCount, setShoppingCount] = useState(0)
  const [calendarPrefs, setCalendarPrefs] = useState<CalendarPreferences>({
    selectedCalendars: [],
    showInToday: true,
    showInWeekly: false
  })

  useEffect(() => {
    setCalendarPrefs(getCalendarPreferences())
    loadCounts()
    
    // Listen for updates
    const handleTasksUpdate = () => loadCounts()
    const handleAppointmentsUpdate = () => loadCounts()
    const handleNotesUpdate = () => loadCounts()
    const handleShoppingUpdate = () => loadCounts()
    const handleCalendarUpdate = () => setCalendarPrefs(getCalendarPreferences())
    
    window.addEventListener('tasksUpdated', handleTasksUpdate)
    window.addEventListener('appointmentsUpdated', handleAppointmentsUpdate)
    window.addEventListener('notesUpdated', handleNotesUpdate)
    window.addEventListener('shoppingUpdated', handleShoppingUpdate)
    window.addEventListener('calendarPreferencesUpdated', handleCalendarUpdate)
    window.addEventListener('storage', loadCounts)
    
    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdate)
      window.removeEventListener('appointmentsUpdated', handleAppointmentsUpdate)
      window.removeEventListener('notesUpdated', handleNotesUpdate)
      window.removeEventListener('shoppingUpdated', handleShoppingUpdate)
      window.removeEventListener('calendarPreferencesUpdated', handleCalendarUpdate)
      window.removeEventListener('storage', loadCounts)
    }
  }, [])

  const loadCounts = () => {
    try {
      // Count active tasks
      try {
        const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]')
        const today = new Date().toISOString().split('T')[0]
        const activeTasks = tasks.filter((task) => {
          if (task.completed) return false
          if (!task.dueDate) return false
          const taskDate = task.dueDate
          const daysDiff = Math.floor((new Date(taskDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
          return taskDate < today || taskDate === today || (daysDiff > 0 && daysDiff <= 7)
        })
        setTaskCount(activeTasks.length)
      } catch (error) {
        logger.error('Error parsing tasks', error as Error)
        setTaskCount(0)
      }

      // Count upcoming appointments
      try {
        const appointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]')
        const today = new Date().toISOString().split('T')[0]
        const upcomingAppointments = appointments.filter((apt) => {
          if (!apt.date) return false
          return apt.date >= today
        })
        setAppointmentCount(upcomingAppointments.length)
      } catch (error) {
        logger.error('Error parsing appointments', error as Error)
        setAppointmentCount(0)
      }

      // Count notes
      try {
        const notes: Note[] = JSON.parse(localStorage.getItem('notes') || '[]')
        setNoteCount(notes.length)
      } catch (error) {
        logger.error('Error parsing notes', error as Error)
        setNoteCount(0)
      }

      // Count shopping items
      try {
        const shoppingItems = JSON.parse(localStorage.getItem('shoppingItems') || '[]')
        const pendingItems = shoppingItems.filter((item: any) => !item.completed)
        setShoppingCount(pendingItems.length)
      } catch (error) {
        logger.error('Error parsing shopping items', error as Error)
        setShoppingCount(0)
      }
    } catch (error) {
      logger.error('Error loading counts', error as Error)
    }
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer>
        {/* Greeting Header - Top Left */}
        <div className="mb-6">
          <GreetingHeader />
          
          {/* Multi-Calendar Display */}
          {calendarPrefs?.showInToday && calendarPrefs?.selectedCalendars && calendarPrefs.selectedCalendars.length > 0 && (
            <div className="mt-4 space-y-2">
              {calendarPrefs.selectedCalendars.map((calendarId: string) => {
                const system = getCalendarSystem(calendarId)
                if (!system) return null
                
                return (
                  <div key={calendarId} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-base">{system.emoji}</span>
                    <span>{formatInCalendar(new Date(), calendarId)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AI Focus Header - Hidden in evening mode */}
        {!isEveningMode && <AIFocusHeader />}

        {/* 2. Weather & Calendar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <WeatherCard />
          <CalendarCard />
        </div>

        {/* Now Card - Shows urgent tasks and next appointment */}
        <NowCard />

        {/* 3. Summary Cards - Navigate to list pages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Link
              href="/dashboard/tasks"
              className="glass-card p-4 hover:shadow-soft-lg transition-all duration-200 card-press relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft" style={{ background: 'linear-gradient(to bottom right, var(--accent-primary), var(--accent-primary))' }}>
                  <CheckSquare className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>To-Do</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {taskCount === 0 ? 'All done!' : `${taskCount} active`}
                  </p>
                </div>
              </div>
              {taskCount > 0 && (
                <div className="pending-badge">
                  {taskCount > 99 ? '99+' : taskCount}
                </div>
              )}
            </Link>

            <Link
              href="/dashboard/notes"
              className="glass-card p-4 hover:shadow-soft-lg transition-all duration-200 card-press relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notes</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {noteCount === 0 ? 'No notes yet' : `${noteCount} notes`}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/shopping"
              className="glass-card p-4 hover:shadow-soft-lg transition-all duration-200 card-press relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <ShoppingCart className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Shopping</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {shoppingCount === 0 ? 'List is empty' : `${shoppingCount} items`}
                  </p>
                </div>
              </div>
              {shoppingCount > 0 && (
                <div className="pending-badge">
                  {shoppingCount > 99 ? '99+' : shoppingCount}
                </div>
              )}
            </Link>
          </div>

        {/* Quick Capture Row - Hidden in evening mode */}
        {!isEveningMode && <QuickCaptureRow />}

        {/* 4. Plan Something Card - Hidden in evening mode */}
        {!isEveningMode && (
          <Link href="/kitchen/planner" className="glass-card p-5 mb-4 block hover:shadow-soft-lg transition-all duration-250 card-press">
            <div className="w-full flex items-center justify-between text-left group">
              <div>
                <h3 className="text-lg font-semibold mb-1 transition-colors duration-250" style={{ color: 'var(--text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
                  Plan Something
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Meal planning, events & more</p>
              </div>
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-250" style={{ color: 'var(--icon-color)' }} strokeWidth={1.5} />
            </div>
          </Link>
        )}

        {/* 5. Care / Reset Card - Always visible, essential */}
        <CareCard />

        {/* 6. Glance Bar - Hidden in evening mode */}
        {!isEveningMode && <GlanceBar />}
      </PageContainer>
    </div>
  )
}
