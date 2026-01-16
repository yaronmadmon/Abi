'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, CheckSquare, Bell, Calendar, FileText } from 'lucide-react'
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
import type { Task } from '@/types/home'

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
  const [showPlanSheet, setShowPlanSheet] = useState(false)
  const isEveningMode = useEveningMode()
  const [taskCount, setTaskCount] = useState(0)
  const [appointmentCount, setAppointmentCount] = useState(0)
  const [noteCount, setNoteCount] = useState(0)

  useEffect(() => {
    loadCounts()
    
    // Listen for updates
    const handleTasksUpdate = () => loadCounts()
    const handleAppointmentsUpdate = () => loadCounts()
    const handleNotesUpdate = () => loadCounts()
    
    window.addEventListener('tasksUpdated', handleTasksUpdate)
    window.addEventListener('appointmentsUpdated', handleAppointmentsUpdate)
    window.addEventListener('notesUpdated', handleNotesUpdate)
    window.addEventListener('storage', loadCounts)
    
    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdate)
      window.removeEventListener('appointmentsUpdated', handleAppointmentsUpdate)
      window.removeEventListener('notesUpdated', handleNotesUpdate)
      window.removeEventListener('storage', loadCounts)
    }
  }, [])

  const loadCounts = () => {
    try {
      // Count active tasks
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

      // Count upcoming appointments
      const appointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]')
      const upcomingAppointments = appointments.filter((apt) => {
        if (!apt.date) return false
        return apt.date >= today
      })
      setAppointmentCount(upcomingAppointments.length)

      // Count notes
      const notes: Note[] = JSON.parse(localStorage.getItem('notes') || '[]')
      setNoteCount(notes.length)
    } catch (error) {
      console.error('Error loading counts:', error)
    }
  }

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

        {/* 3. Summary Cards - Navigate to list pages */}
        {!isEveningMode && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link
              href="/dashboard/tasks"
              className="glass-card p-4 hover:shadow-soft-lg transition-all duration-200 card-press relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-soft">
                  <CheckSquare className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">To-Do</h3>
                  <p className="text-xs text-gray-500">
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
              href="/home/calendar"
              className="glass-card p-4 hover:shadow-soft-lg transition-all duration-200 card-press relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-soft">
                  <Calendar className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Appointments</h3>
                  <p className="text-xs text-gray-500">
                    {appointmentCount === 0 ? 'None scheduled' : `${appointmentCount} upcoming`}
                  </p>
                </div>
              </div>
              {appointmentCount > 0 && (
                <div className="pending-badge">
                  {appointmentCount > 99 ? '99+' : appointmentCount}
                </div>
              )}
            </Link>

            <Link
              href="/dashboard/notes"
              className="glass-card p-4 hover:shadow-soft-lg transition-all duration-200 card-press relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-soft">
                  <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                  <p className="text-xs text-gray-500">
                    {noteCount === 0 ? 'No notes yet' : `${noteCount} notes`}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/tasks"
              className="glass-card p-4 hover:shadow-soft-lg transition-all duration-200 card-press relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-soft">
                  <Bell className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Reminders</h3>
                  <p className="text-xs text-gray-500">In To-Dos</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Quick Capture Row - Hidden in evening mode */}
        {!isEveningMode && <QuickCaptureRow />}

        {/* 4. Plan Something Card - Hidden in evening mode */}
        {!isEveningMode && (
          <div className="glass-card p-5 mb-4">
            <button
              onClick={() => setShowPlanSheet(true)}
              className="w-full flex items-center justify-between text-left group card-press"
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
