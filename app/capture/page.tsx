'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, CheckSquare, Calendar, FileText, Lightbulb, Bell, Mic, Send } from 'lucide-react'
import { showToast } from '@/components/feedback/ToastContainer'

type CaptureType = 'task' | 'appointment' | 'note' | 'thought' | 'reminder'

function QuickCaptureContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = (searchParams.get('type') || 'task') as CaptureType
  const [type, setType] = useState<CaptureType>(typeParam)
  const [content, setContent] = useState('')
  const [isListening, setIsListening] = useState(false)

  const typeConfig = {
    task: {
      icon: CheckSquare,
      label: 'To-Do',
      color: 'from-blue-500 to-blue-600',
      placeholder: 'What needs to be done?',
      action: 'Add Task'
    },
    reminder: {
      icon: Bell,
      label: 'Reminder',
      color: 'from-indigo-500 to-indigo-600',
      placeholder: 'Set a reminder (e.g., "Call mom tomorrow at 3pm")',
      action: 'Add Reminder'
    },
    appointment: {
      icon: Calendar,
      label: 'Appointment',
      color: 'from-purple-500 to-purple-600',
      placeholder: 'Schedule something (e.g., "Doctor appointment Monday at 2pm")',
      action: 'Add Appointment'
    },
    note: {
      icon: FileText,
      label: 'Note',
      color: 'from-gray-500 to-gray-600',
      placeholder: 'Quick note...',
      action: 'Save Note'
    },
    thought: {
      icon: Lightbulb,
      label: 'Thought',
      color: 'from-yellow-500 to-yellow-600',
      placeholder: 'Capture a thought...',
      action: 'Save Thought'
    }
  }

  const config = typeConfig[type]

  const handleSave = () => {
    if (!content.trim()) {
      showToast('Please enter something', 'error')
      return
    }

    try {
      if (type === 'task') {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        tasks.push({
          id: `task-${Date.now()}`,
          title: content,
          category: 'other',
          completed: false,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('tasks', JSON.stringify(tasks))
        window.dispatchEvent(new Event('tasksUpdated'))
        showToast('Task added! ✓', 'success')
      } else if (type === 'reminder') {
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]')
        reminders.push({
          id: `reminder-${Date.now()}`,
          title: content,
          completed: false,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('reminders', JSON.stringify(reminders))
        window.dispatchEvent(new Event('remindersUpdated'))
        showToast('Reminder set! ⏰', 'success')
      } else if (type === 'appointment') {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
        appointments.push({
          id: `apt-${Date.now()}`,
          title: content,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('appointments', JSON.stringify(appointments))
        window.dispatchEvent(new Event('appointmentsUpdated'))
        showToast('Appointment added! 📅', 'success')
      } else if (type === 'note') {
        const newNote = {
          id: `note-${Date.now()}`,
          title: '',
          body: content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pinned: false
        }
        const notes = JSON.parse(localStorage.getItem('notes') || '[]')
        notes.push(newNote)
        localStorage.setItem('notes', JSON.stringify(notes))
        window.dispatchEvent(new Event('notesUpdated'))
        showToast('Note saved', 'success')
      } else if (type === 'thought') {
        const thoughts = JSON.parse(localStorage.getItem('thoughts') || '[]')
        thoughts.push({
          id: `thought-${Date.now()}`,
          text: content,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('thoughts', JSON.stringify(thoughts))
        window.dispatchEvent(new Event('thoughtsUpdated'))
        showToast('Thought saved', 'success')
      }

      router.back()
    } catch (error) {
      console.error('Error saving:', error)
      showToast('Couldn\'t save that. Try again?', 'error')
    }
  }

  const IconComponent = config.icon

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md border-b transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors duration-250"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-md`}>
              <IconComponent className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Quick Capture</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{config.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(Object.keys(typeConfig) as CaptureType[]).map(t => {
            const cfg = typeConfig[t]
            const Icon = cfg.icon
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-250 whitespace-nowrap ${
                  type === t
                    ? 'bg-gradient-to-r ' + cfg.color + ' text-white shadow-md'
                    : ''
                }`}
                style={type === t ? {} : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => {
                  if (type !== t) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => {
                  if (type !== t) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {cfg.label}
              </button>
            )
          })}
        </div>

        {/* Input Area */}
        <div className="rounded-2xl border-2 p-6 shadow-sm transition-colors duration-250" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--glass-border)' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={config.placeholder}
            className="w-full min-h-[200px] resize-none focus:outline-none text-lg transition-colors duration-250"
            style={{ color: 'var(--text-primary)', backgroundColor: 'transparent' }}
            autoFocus
          />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t transition-colors duration-250" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {content.length} characters
            </div>
            <button
              onClick={() => setIsListening(!isListening)}
              className="p-3 rounded-lg transition-all duration-250"
              style={isListening ? { backgroundColor: '#b91c1c', color: 'white' } : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                if (!isListening) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={(e) => {
                if (!isListening) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
              }}
            >
              <Mic className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className={`w-full py-4 px-6 bg-gradient-to-r ${config.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            <Send className="w-5 h-5" strokeWidth={2} />
            {config.action}
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 font-medium transition-colors duration-250"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuickCapturePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>Loading...</div>}>
      <QuickCaptureContent />
    </Suspense>
  )
}
