'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

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

interface MonthlyCalendarProps {
  appointments: Appointment[]
  tasks: Task[]
  onDateClick?: (date: Date) => void
}

export default function MonthlyCalendar({ appointments, tasks, onDateClick }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Get events for a specific date
  const getEventsForDate = (date: Date): (Appointment | Task)[] => {
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents: (Appointment | Task)[] = []
    
    // Add appointments
    appointments.forEach(apt => {
      if (apt.date === dateStr) {
        dayEvents.push(apt)
      }
    })
    
    // Add tasks
    tasks.forEach(task => {
      if (!task.completed && task.dueDate === dateStr) {
        dayEvents.push(task)
      }
    })
    
    return dayEvents
  }

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Generate calendar days
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="glass-card p-4">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>
        
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const events = getEventsForDate(date)
          const isTodayDate = isToday(date)
          const isCurrentMonth = date.getMonth() === month

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateClick?.(date)}
              className={`aspect-square p-1 rounded-lg transition-colors text-left relative ${
                isTodayDate
                  ? 'bg-blue-500 text-white font-semibold'
                  : isCurrentMonth
                  ? 'hover:bg-gray-100 text-gray-900'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className={`text-xs ${isTodayDate ? 'text-white' : 'text-gray-700'}`}>
                {date.getDate()}
              </div>
              {events.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {events.slice(0, 2).map((event, idx) => (
                    <div
                      key={idx}
                      className={`text-[10px] px-1 py-0.5 rounded truncate ${
                        isTodayDate
                          ? 'bg-white/30 text-white'
                          : 'time' in event
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className={`text-[10px] px-1 ${
                      isTodayDate ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
