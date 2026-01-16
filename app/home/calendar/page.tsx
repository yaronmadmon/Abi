'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Plus, Clock, MapPin, User, CheckSquare } from 'lucide-react'
import AppointmentCreateSheet from '@/components/sheets/AppointmentCreateSheet'
import MonthlyCalendar from '@/components/calendar/MonthlyCalendar'
import type { Task } from '@/types/home'

interface Appointment {
  id: string
  title: string
  date?: string
  time?: string
  location?: string
  forWho?: string
  createdAt: string
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateEvents, setSelectedDateEvents] = useState<(Appointment | Task)[]>([])

  useEffect(() => {
    loadData()
    // Listen for storage changes
    const handleStorageChange = () => {
      loadData()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadData = () => {
    const storedAppointments = localStorage.getItem('appointments')
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments))
    }

    const storedTasks = localStorage.getItem('tasks')
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
  }

  const handleAppointmentSave = (appointment: {
    title: string
    date: string
    time: string
    location?: string
    forWho?: string
  }) => {
    const stored = localStorage.getItem('appointments') || '[]'
    const appointments = JSON.parse(stored)
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...appointment,
      createdAt: new Date().toISOString(),
    }
    appointments.push(newAppointment)
    localStorage.setItem('appointments', JSON.stringify(appointments))
    loadData()
    setShowCreateForm(false)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayEvents: (Appointment | Task)[] = []
    
    // Add appointments for this date
    appointments.forEach(apt => {
      if (apt.date === dateStr) {
        dayEvents.push(apt)
      }
    })
    
    // Add tasks for this date
    tasks.forEach(task => {
      if (!task.completed && task.dueDate === dateStr) {
        dayEvents.push(task)
      }
    })
    
    setSelectedDateEvents(dayEvents)
  }

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/home" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-sm text-gray-500">Monthly view with appointments & tasks</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">New</span>
          </button>
        </div>

        {/* Monthly Calendar */}
        <div className="mb-6">
          <MonthlyCalendar
            appointments={appointments}
            tasks={tasks}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button
                onClick={() => {
                  setSelectedDate(null)
                  setSelectedDateEvents([])
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No events scheduled for this day</p>
                <button
                  onClick={() => {
                    setShowCreateForm(true)
                    // Pre-fill the date in the form
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>Add Event</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-white/50 border border-gray-100">
                    <div className="flex items-start gap-3">
                      {'time' in event ? (
                        <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      ) : (
                        <CheckSquare className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          {'time' in event && event.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {'location' in event && event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {'forWho' in event && event.forWho && (
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>{event.forWho}</span>
                            </div>
                          )}
                          {'dueDate' in event && (
                            <span className="text-orange-600">To-Do</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showCreateForm && (
          <AppointmentCreateSheet
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSave={handleAppointmentSave}
          />
        )}
      </div>
    </div>
  )
}
