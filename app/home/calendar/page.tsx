'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Plus, Clock, MapPin, User, CheckSquare, Settings } from 'lucide-react'
import AppointmentCreateSheet from '@/components/sheets/AppointmentCreateSheet'
import MonthlyCalendar from '@/components/calendar/MonthlyCalendar'
import type { Task } from '@/types/home'
import PageContainer from '@/components/ui/PageContainer'
import { showToast } from '@/components/feedback/ToastContainer'

interface Appointment {
  id: string
  title: string
  date?: string
  time?: string
  location?: string
  forWho?: string
  createdAt: string
  sharedTo?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
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
    try {
      const storedAppointments = localStorage.getItem('appointments')
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments))
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments([])
    }

    try {
      const storedTasks = localStorage.getItem('tasks')
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks))
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    }
  }

  const handleAppointmentSave = async (appointment: {
    title: string
    date: string
    time: string
    location?: string
    forWho?: string
    sharedTo?: {
      id: string
      name: string
      email?: string
      phone?: string
    }
  }) => {
    try {
      const stored = localStorage.getItem('appointments') || '[]'
      const appointments = JSON.parse(stored)
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...appointment,
        createdAt: new Date().toISOString(),
      }
      appointments.push(newAppointment)
      localStorage.setItem('appointments', JSON.stringify(appointments))
      // Notify Today page and other components
      window.dispatchEvent(new Event('appointmentsUpdated'))
      loadData()
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to save appointment:', error)
      // Check if it's a quota exceeded error
      if (error instanceof Error && (error.name === 'QuotaExceededError' || (error as any).code === 22)) {
        alert('Storage is full. Please clear browser data or remove some appointments.')
      } else {
        alert('Failed to save appointment. Please try again.')
      }
      return
    }

    // Share with family member if selected
    if (appointment.sharedTo) {
      try {
        // Get user's notification preferences
        const settingsStr = localStorage.getItem('abiSettings.v1')
        const settings = settingsStr ? JSON.parse(settingsStr) : {}
        
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: appointment.sharedTo,
            item: {
              type: 'appointment',
              title: appointment.title,
              date: appointment.date,
              time: appointment.time,
              location: appointment.location,
            },
            preferences: {
              emailNotifications: settings.emailNotifications !== false,
              smsNotifications: settings.smsNotifications === true,
            },
          }),
        })

        if (response.ok) {
          showToast(`Shared with ${appointment.sharedTo.name}`, 'success')
        } else {
          console.error('Failed to share appointment')
        }
      } catch (error) {
        console.error('Error sharing appointment:', error)
      }
    }
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
      <PageContainer maxWidth="4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/today" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to Today
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-sm text-gray-500">Monthly view with appointments & tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/calendar"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Calendar Systems"
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-medium hidden sm:inline">Calendar Systems</span>
            </Link>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-medium">New</span>
            </button>
          </div>
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
      </PageContainer>
    </div>
  )
}
