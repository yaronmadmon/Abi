'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { Task } from '@/types/home'

export default function NowCard() {
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])
  const [nextAppointment, setNextAppointment] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Load urgent tasks (due today or overdue, not completed)
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const today = new Date().toISOString().split('T')[0]
    
    const urgent = tasks
      .filter((t: Task) => !t.completed && t.dueDate && t.dueDate <= today)
      .sort((a: Task, b: Task) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 3)

    setUrgentTasks(urgent)
  }

  const hasContent = urgentTasks.length > 0 || nextAppointment

  if (!hasContent) {
    return (
      <div className="glass-card p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Now</h2>
        <p className="text-sm text-gray-500">Nothing urgent. You're all set.</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Now</h2>
        <Link 
          href="/home"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          See all →
        </Link>
      </div>

      <div className="space-y-3">
        {nextAppointment && (
          <div className="flex items-start gap-3 p-2 rounded-lg bg-blue-50/50">
            <Calendar className="w-4 h-4 text-[#4a5568] mt-0.5" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{nextAppointment.title}</p>
              <p className="text-xs text-gray-500">{nextAppointment.time}</p>
            </div>
          </div>
        )}

        {urgentTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-[#4a5568] mt-0.5" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              <p className="text-xs text-gray-500 capitalize">{task.category.replace('-', ' ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
