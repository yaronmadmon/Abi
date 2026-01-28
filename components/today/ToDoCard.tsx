'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckSquare } from 'lucide-react'
import type { Task } from '@/types/home'

export default function ToDoCard() {
  const [incompleteCount, setIncompleteCount] = useState(0)

  useEffect(() => {
    const loadCount = () => {
      try {
        const stored = localStorage.getItem('tasks')
        if (stored) {
          const tasks: Task[] = JSON.parse(stored)
          const today = new Date().toISOString().split('T')[0]
          // Count active tasks: overdue, due today, or upcoming
          const activeTasks = tasks.filter((task) => {
            if (task.completed) return false
            if (!task.dueDate) return false
            // Include overdue, due today, or upcoming (next 7 days)
            const taskDate = task.dueDate
            const daysDiff = Math.floor((new Date(taskDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
            return taskDate < today || taskDate === today || (daysDiff > 0 && daysDiff <= 7)
          })
          setIncompleteCount(activeTasks.length)
        } else {
          setIncompleteCount(0)
        }
      } catch (error) {
        console.error('Error loading To-Do count:', error)
        setIncompleteCount(0)
      }
    }

    loadCount()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks' || e.key === 'appointments') {
        loadCount()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom events from same-tab updates
    const handleCustomStorage = () => {
      loadCount()
    }
    window.addEventListener('tasksUpdated', handleCustomStorage)
    window.addEventListener('appointmentsUpdated', handleCustomStorage)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tasksUpdated', handleCustomStorage)
      window.removeEventListener('appointmentsUpdated', handleCustomStorage)
    }
  }, [])

  return (
    <Link
      href="/dashboard/tasks"
      className="glass-card p-5 transition-all duration-250 card-press relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: 'var(--accent-primary)',
              boxShadow: '0 4px 15px rgba(139, 158, 255, 0.3)'
            }}
          >
            <CheckSquare className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>To-Do</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {incompleteCount === 0
                ? 'All done!'
                : incompleteCount === 1
                ? '1 item remaining'
                : `${incompleteCount} items remaining`}
            </p>
          </div>
        </div>
      </div>
      {incompleteCount > 0 && (
        <div className="pending-badge">
          {incompleteCount > 99 ? '99+' : incompleteCount}
        </div>
      )}
    </Link>
  )
}
