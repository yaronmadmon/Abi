'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  title: string
  date?: string
  time?: string
  location?: string
}

interface Task {
  id: string
  title: string
  dueDate?: string
  completed: boolean
}

export default function CalendarCard() {
  const [upcomingEvents, setUpcomingEvents] = useState<(Appointment | Task)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalendarData()
    // Refresh every minute
    const interval = setInterval(loadCalendarData, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadCalendarData = () => {
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      // Load appointments
      const appointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]')
      
      // Load tasks
      const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]')
      
      // Combine and filter upcoming events
      const events: (Appointment | Task)[] = []
      
      // Add today's appointments
      appointments
        .filter(apt => apt.date === today || apt.date === tomorrowStr)
        .sort((a, b) => {
          const timeA = a.time || '00:00'
          const timeB = b.time || '00:00'
          return timeA.localeCompare(timeB)
        })
        .forEach(apt => events.push(apt))
      
      // Add today's and tomorrow's tasks
      tasks
        .filter(task => !task.completed && (task.dueDate === today || task.dueDate === tomorrowStr))
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
        .slice(0, 3)
        .forEach(task => events.push(task))
      
      // Sort all events by date and time
      events.sort((a, b) => {
        const dateA = 'date' in a ? a.date : ('dueDate' in a ? a.dueDate : today)
        const dateB = 'date' in b ? b.date : ('dueDate' in b ? b.dueDate : today)
        if (dateA !== dateB) {
          return (dateA || '').localeCompare(dateB || '')
        }
        const timeA = 'time' in a ? (a.time || '00:00') : '00:00'
        const timeB = 'time' in b ? (b.time || '00:00') : '00:00'
        return timeA.localeCompare(timeB)
      })

      setUpcomingEvents(events.slice(0, 3))
    } catch (err) {
      console.error('Error loading calendar data:', err)
    } finally {
      setLoading(false)
    }
  }

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

  const formatDate = (date?: string) => {
    if (!date) return 'Today'
    const eventDate = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date === today.toISOString().split('T')[0]) {
      return 'Today'
    } else if (date === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow'
    } else {
      return eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="glass-card p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
        <Link 
          href="/home/calendar"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div className="text-center py-4">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1} />
          <p className="text-sm text-gray-500">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingEvents.map((event, index) => {
            const isAppointment = 'time' in event
            const eventDate = formatDate('date' in event ? event.date : ('dueDate' in event ? event.dueDate : undefined))
            const eventTime = isAppointment ? formatTime((event as Appointment).time) : null

            return (
              <div
                key={event.id || index}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-colors"
              >
                <div className="mt-0.5">
                  {isAppointment ? (
                    <Calendar className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{eventDate}</span>
                    {eventTime && (
                      <>
                        <span>•</span>
                        <span>{eventTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
