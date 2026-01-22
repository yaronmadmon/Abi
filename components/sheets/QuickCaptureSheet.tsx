'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppointmentCreateSheet from './AppointmentCreateSheet'
import ThoughtCreateSheet from './ThoughtCreateSheet'
import { showToast } from '../feedback/ToastContainer'

interface QuickCaptureSheetProps {
  type: 'thought' | 'task' | 'reminder' | 'appointment' | 'note'
  isOpen: boolean
  onClose: () => void
}

export default function QuickCaptureSheet({ type, isOpen, onClose }: QuickCaptureSheetProps) {
  const router = useRouter()
  const [showNativeForm, setShowNativeForm] = useState(true)
  const [showAIFallback, setShowAIFallback] = useState(false)

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setShowNativeForm(true)
      setShowAIFallback(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // Handle note creation - navigate to full-screen editor
  const handleNoteCreate = () => {
    try {
      // Create new note and navigate to full-screen editor
      const newNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: '',
        body: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
      }
      
      // Save to localStorage
      const stored = localStorage.getItem('notes') || '[]'
      const notes = JSON.parse(stored)
      notes.push(newNote)
      localStorage.setItem('notes', JSON.stringify(notes))
      
      // Trigger update event
      window.dispatchEvent(new Event('notesUpdated'))
      
      // Navigate to full-screen editor
      onClose()
      router.push(`/dashboard/notes/${newNote.id}`)
    } catch (error) {
      console.error('❌ Failed to create note:', error)
      showToast('Couldn\'t create note', 'error')
    }
  }

  const handleAppointmentSave = (appointment: {
    title: string
    date: string
    time: string
    location?: string
    forWho?: string
  }) => {
    try {
      // Save appointment to localStorage
      const stored = localStorage.getItem('appointments') || '[]'
      const appointments = JSON.parse(stored)
      const newAppointment = {
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...appointment,
        createdAt: new Date().toISOString(),
      }
      appointments.push(newAppointment)
      localStorage.setItem('appointments', JSON.stringify(appointments))
      
      // Trigger update event for UI refresh
      window.dispatchEvent(new Event('appointmentsUpdated'))
      
      showToast('Appointment created', 'success')
      onClose()
    } catch (error) {
      showToast('Couldn\'t create appointment', 'error')
    }
  }

  const handleThoughtSave = (thought: string) => {
    try {
      // Save thought to localStorage
      const stored = localStorage.getItem('thoughts') || '[]'
      const thoughts = JSON.parse(stored)
      const newThought = {
        id: `thought-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: thought,
        createdAt: new Date().toISOString(),
      }
      thoughts.push(newThought)
      localStorage.setItem('thoughts', JSON.stringify(thoughts))
      
      // Trigger update event for UI refresh (for future thoughts card/widget)
      window.dispatchEvent(new Event('thoughtsUpdated'))
      
      showToast('Thought saved', 'success')
      onClose()
    } catch (error) {
      showToast('Couldn\'t save thought', 'error')
    }
  }

  const handleTaskIntent = (route: string, payload: any) => {
    // Tasks are handled by the router, just close
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleReminderIntent = (route: string, payload: any) => {
    // Reminders are handled by the router, just close
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // For notes, create and navigate to full-screen editor (Apple Notes style)
  if (type === 'note' && showNativeForm) {
    // Create note immediately and navigate to editor
    handleNoteCreate()
    return null
  }

  if (type === 'appointment' && showNativeForm) {
    return <AppointmentCreateSheet isOpen={isOpen} onClose={onClose} onSave={handleAppointmentSave} />
  }

  if (type === 'thought' && showNativeForm) {
    return <ThoughtCreateSheet isOpen={isOpen} onClose={onClose} onSave={handleThoughtSave} />
  }

  // For tasks and reminders, use AI routing (they have their own native forms in their pages)
  // But provide a quick capture option here
  if (type === 'task' || type === 'reminder') {
    return (
      <div className="fixed inset-0 z-[100] flex items-end" style={{ animation: 'fadeIn 200ms ease-in-out' }}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full rounded-t-3xl shadow-soft-lg max-h-[60vh] flex flex-col" style={{ backgroundColor: 'var(--card-bg)', animation: 'slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {type === 'task' ? 'Add a To-Do' : type === 'reminder' ? 'Add a Reminder' : type === 'appointment' ? 'Add an Appointment' : type === 'note' ? 'Add a Note' : 'Quick Capture'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {type === 'task' ? 'What needs to be done?' : type === 'reminder' ? 'What should I remind you about?' : 'Describe what you need'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-gray-500 text-center">Quick capture moved to full-page view</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
