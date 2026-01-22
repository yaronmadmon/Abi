'use client'

import { useState, useEffect, useMemo, useRef, memo } from 'react'
import { Calendar, Clock, ChevronLeft, ChevronRight, MapPin, User, CheckSquare, X, Settings, Plus } from 'lucide-react'
import Link from 'next/link'
import { getCalendarPreferences, getCalendarSystem, formatInCalendar } from '@/lib/calendarSystems'
import AppointmentCreateSheet from '@/components/sheets/AppointmentCreateSheet'
import { showToast } from '@/components/feedback/ToastContainer'
import { FeatureErrorBoundary } from '@/components/errors/FeatureErrorBoundary'

interface Appointment {
  id: string
  title: string
  date?: string
  time?: string
  location?: string
  forWho?: string
}

interface Task {
  id: string
  title: string
  dueDate?: string
  completed: boolean
}

type CalendarEvent = Appointment | Task

// Memoized because: Prevents re-renders when Today page updates,
// expensive operations: date calculations, event filtering, calendar rendering.
// Remove memo if: useMemo on calendar days + events is sufficient, or component isolated.
const CalendarCardContent = memo(function CalendarCardContent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [calendarPrefs, setCalendarPrefs] = useState(getCalendarPreferences())
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  useEffect(() => {
    loadCalendarData()
    // Refresh every minute
    const interval = setInterval(loadCalendarData, 60 * 1000)
    
    // Listen for updates from other components
    const handleTasksUpdate = () => loadCalendarData()
    const handleAppointmentsUpdate = () => loadCalendarData()
    const handleCalendarUpdate = () => setCalendarPrefs(getCalendarPreferences())
    
    window.addEventListener('tasksUpdated', handleTasksUpdate)
    window.addEventListener('appointmentsUpdated', handleAppointmentsUpdate)
    window.addEventListener('calendarPreferencesUpdated', handleCalendarUpdate)
    
    // Also listen for storage events (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks' || e.key === 'appointments') {
        loadCalendarData()
      }
      if (e.key === 'calendarPreferences') {
        setCalendarPrefs(getCalendarPreferences())
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('tasksUpdated', handleTasksUpdate)
      window.removeEventListener('appointmentsUpdated', handleAppointmentsUpdate)
      window.removeEventListener('calendarPreferencesUpdated', handleCalendarUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const loadCalendarData = () => {
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      // Load appointments
      const loadedAppointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]')
      setAppointments(loadedAppointments)
      
      // Load tasks
      const loadedTasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]')
      setTasks(loadedTasks)
      
      // Count active items (overdue, due today, upcoming)
      const allTasks = loadedTasks.filter(task => !task.completed && task.dueDate)
      const overdueTasks = allTasks.filter(task => task.dueDate && task.dueDate < today)
      const todayTasks = allTasks.filter(task => task.dueDate === today)
      const upcomingTasks = allTasks.filter(task => task.dueDate === tomorrowStr || (task.dueDate && task.dueDate > today))
      
      const allAppointments = loadedAppointments.filter(apt => apt.date)
      const overdueAppointments = allAppointments.filter(apt => apt.date && apt.date < today)
      const todayAppointments = allAppointments.filter(apt => apt.date === today)
      const upcomingAppointments = allAppointments.filter(apt => apt.date === tomorrowStr || (apt.date && apt.date > today))
      
      // Count all active items (overdue + due today + upcoming)
      setPendingCount(
        overdueTasks.length + todayTasks.length + upcomingTasks.length +
        overdueAppointments.length + todayAppointments.length + upcomingAppointments.length
      )
    } catch (err) {
      console.error('Error loading calendar data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents: CalendarEvent[] = []
    
    // Add appointments
    appointments.forEach(apt => {
      if (apt.date === dateStr) {
        dayEvents.push(apt)
      }
    })
    
    // Add tasks (including reminders which have IDs starting with "reminder-")
    tasks.forEach(task => {
      if (!task.completed && task.dueDate === dateStr) {
        dayEvents.push(task)
      }
    })
    
    // Sort by time (appointments first, then tasks)
    dayEvents.sort((a, b) => {
      const timeA = 'time' in a ? (a.time || '00:00') : '23:59'
      const timeB = 'time' in b ? (b.time || '00:00') : '23:59'
      return timeA.localeCompare(timeB)
    })
    
    return dayEvents
  }

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Calendar grid generation
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }, [year, month, startingDayOfWeek, daysInMonth])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    if (isExpanded && selectedDate) {
      setSelectedDate(today)
      const events = getEventsForDate(today)
      // Keep expanded if there are events, otherwise collapse
      if (events.length === 0) {
        setIsExpanded(false)
        setSelectedDate(null)
      }
    }
  }

  // Handle day click
  const handleDayClick = (date: Date) => {
    const events = getEventsForDate(date)
    setSelectedDate(date)
    setIsExpanded(true)
  }

  // Handle collapse
  const handleCollapse = () => {
    setIsExpanded(false)
    setSelectedDate(null)
  }

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const diff = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next month
        goToNextMonth()
      } else {
        // Swipe right - previous month
        goToPreviousMonth()
      }
    }
    
    touchStartX.current = null
    touchEndX.current = null
  }

  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  // Handle appointment save
  const handleAppointmentSave = (appointment: { title: string; date: string; time: string; location?: string; forWho?: string }) => {
    try {
      const stored = localStorage.getItem('appointments') || '[]'
      const existingAppointments = JSON.parse(stored)
      
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        location: appointment.location,
        forWho: appointment.forWho,
      }
      
      existingAppointments.push(newAppointment)
      localStorage.setItem('appointments', JSON.stringify(existingAppointments))
      
      // Trigger update event
      window.dispatchEvent(new Event('appointmentsUpdated'))
      
      // Reload calendar data
      loadCalendarData()
      
      showToast('Appointment created', 'success')
      setShowCreateSheet(false)
    } catch (error) {
      console.error('Error creating appointment:', error)
      showToast('Failed to create appointment', 'error')
    }
  }

  // Format time
  const formatTime = (time?: string) => {
    if (!time) return ''
    try {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
      return `${displayHour}:${minutes} ${period}`
    } catch {
      return time
    }
  }

  // Count events for a day (for indicators)
  const getEventCount = (date: Date): number => {
    return getEventsForDate(date).length
  }

  if (loading) {
    return (
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className="glass-card p-5 mb-4 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between relative">
          <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
          <div className="flex items-center gap-2">
            <Link
              href="/settings/calendar"
              className="p-1.5 rounded-lg hover:bg-gray-100/50 transition-colors"
              title="Calendar Systems"
            >
              <Settings className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
            </Link>
            {pendingCount > 0 && !isExpanded && (
              <div className="pending-badge" style={{ position: 'static', top: 'auto', right: 'auto', marginLeft: 'auto' }}>
                {pendingCount > 99 ? '99+' : pendingCount}
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Calendar Dates */}
        {!isExpanded && calendarPrefs.selectedCalendars && calendarPrefs.selectedCalendars.length > 0 && (
          <div className="mt-2 space-y-1">
            {calendarPrefs.selectedCalendars.map((calendarId) => {
              const system = getCalendarSystem(calendarId)
              if (!system) return null
              
              return (
                <div key={calendarId} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span>{system.emoji}</span>
                  <span>{formatInCalendar(currentDate, calendarId, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly Calendar View */}
      {!isExpanded && (
        <div className="animate-fade-in">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100/50 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" strokeWidth={2} />
            </button>
            
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {monthNames[month]} {year}
              </h3>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Today
              </button>
            </div>
            
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100/50 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" strokeWidth={2} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const isTodayDate = isToday(date)
              const isCurrentMonth = date.getMonth() === month
              const eventCount = getEventCount(date)

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  className={`aspect-square p-1 rounded-lg transition-all duration-150 text-center relative ${
                    isTodayDate
                      ? 'bg-blue-500 text-white font-semibold'
                      : isCurrentMonth
                      ? 'hover:bg-gray-100/50 text-gray-900'
                      : 'text-gray-400 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`text-xs ${isTodayDate ? 'text-white' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </div>
                  {/* Event indicators */}
                  {eventCount > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 justify-center">
                      {eventCount <= 3 ? (
                        // Show individual dots for up to 3 events
                        Array.from({ length: Math.min(eventCount, 3) }).map((_, i) => {
                          const events = getEventsForDate(date)
                          const event = events[i]
                          const isAppointment = 'time' in event
                          const isReminder = 'id' in event && event.id.startsWith('reminder-')
                          
                          return (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                isTodayDate
                                  ? 'bg-white/80'
                                  : isAppointment
                                  ? 'bg-blue-500'
                                  : isReminder
                                  ? 'bg-purple-500'
                                  : 'bg-orange-500'
                              }`}
                            />
                          )
                        })
                      ) : (
                        // Show number for 4+ events
                        <div
                          className={`text-[8px] font-semibold px-1 py-0.5 rounded ${
                            isTodayDate
                              ? 'bg-white/30 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {eventCount}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Daily Agenda View */}
      {isExpanded && selectedDate && (
        <div className="animate-slide-up">
          {/* Daily Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: selectedDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedDateEvents.length === 0 
                  ? 'No events scheduled' 
                  : `${selectedDateEvents.length} ${selectedDateEvents.length === 1 ? 'event' : 'events'}`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Today
              </button>
              <button
                onClick={handleCollapse}
                className="p-1.5 rounded-lg hover:bg-gray-100/50 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Agenda List */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1} />
                <p className="text-sm mb-3">No events scheduled for this day</p>
                <button
                  onClick={() => setShowCreateSheet(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>Add Appointment</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => {
                  const isAppointment = 'time' in event
                  const isReminder = 'id' in event && event.id.startsWith('reminder-')
                  
                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-white/50 border border-gray-100/50 hover:bg-white/70 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          {isAppointment ? (
                            <Calendar className="w-4 h-4 text-blue-500" strokeWidth={2} />
                          ) : isReminder ? (
                            <Clock className="w-4 h-4 text-purple-500" strokeWidth={2} />
                          ) : (
                            <CheckSquare className="w-4 h-4 text-orange-500" strokeWidth={2} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">{event.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {'time' in event && event.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" strokeWidth={1.5} />
                                <span>{formatTime(event.time)}</span>
                              </div>
                            )}
                            {'location' in event && event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" strokeWidth={1.5} />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {'forWho' in event && event.forWho && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" strokeWidth={1.5} />
                                <span>{event.forWho}</span>
                              </div>
                            )}
                            {isReminder && (
                              <span className="text-purple-600 font-medium">Reminder</span>
                            )}
                            {!isAppointment && !isReminder && (
                              <span className="text-orange-600 font-medium">To-Do</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Create Sheet */}
      <AppointmentCreateSheet
        isOpen={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        onSave={handleAppointmentSave}
        initialDate={selectedDate?.toISOString().split('T')[0]}
      />
    </div>
  )
})

export default function CalendarCard() {
  return (
    <FeatureErrorBoundary featureName="Calendar">
      <CalendarCardContent />
    </FeatureErrorBoundary>
  )
}
