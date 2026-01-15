'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Plus, Clock, MapPin, User } from 'lucide-react'
import AppointmentCreateSheet from '@/components/sheets/AppointmentCreateSheet'

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
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = () => {
    const stored = localStorage.getItem('appointments')
    if (stored) {
      setAppointments(JSON.parse(stored))
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
    loadAppointments()
  }

  // Group appointments by date
  const groupedAppointments = appointments.reduce((acc, apt) => {
    const date = apt.date || 'No date'
    if (!acc[date]) acc[date] = []
    acc[date].push(apt)
    return acc
  }, {} as Record<string, Appointment[]>)

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort()

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/home" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-sm text-gray-500">Upcoming events</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">New</span>
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
            <p className="text-gray-500 mb-2">No appointments yet</p>
            <p className="text-sm text-gray-400 mb-6">Add your first appointment to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
              <span>Add Appointment</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => (
              <div key={date} className="glass-card p-4">
                <h2 className="font-semibold text-gray-700 mb-3">
                  {date === 'No date' ? 'No Date' : new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <div className="space-y-3">
                  {groupedAppointments[date].map((apt) => (
                    <div key={apt.id} className="p-3 rounded-lg bg-white/50 border border-gray-100">
                      <h3 className="font-medium text-gray-900 mb-2">{apt.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        {apt.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>{apt.time}</span>
                          </div>
                        )}
                        {apt.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>{apt.location}</span>
                          </div>
                        )}
                        {apt.forWho && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>{apt.forWho}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
