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
          const incomplete = tasks.filter((task) => !task.completed)
          setIncompleteCount(incomplete.length)
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
      if (e.key === 'tasks') {
        loadCount()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom events from same-tab updates
    const handleCustomStorage = () => {
      loadCount()
    }
    window.addEventListener('tasksUpdated', handleCustomStorage)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tasksUpdated', handleCustomStorage)
    }
  }, [])

  return (
    <Link
      href="/dashboard/tasks"
      className="glass-card p-5 hover:shadow-soft-lg transition-all duration-200 card-press relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-soft">
            <CheckSquare className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">To-Do</h3>
            <p className="text-sm text-gray-500">
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
