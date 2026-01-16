'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Home, Calendar } from 'lucide-react'
import Link from 'next/link'
import SummaryCard from '@/components/section/SummaryCard'
import AIInputBar from '@/components/AIInputBar'
import type { Task } from '@/types/home'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = () => {
    const stored = localStorage.getItem('tasks')
    if (stored) {
      const allTasks = JSON.parse(stored)
      setTasks(allTasks)
      const today = new Date().toISOString().split('T')[0]
      setUrgentTasks(
        allTasks
          .filter((t: Task) => !t.completed && t.dueDate && t.dueDate <= today)
          .slice(0, 3)
      )
    }
  }

  const handleAIIntent = (route: string, payload: any) => {
    if (route === 'tasks') {
      loadTasks()
    } else if (route === 'notes' && payload?.id) {
      // Navigate to notes list page when note is created
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/notes'
      }
    }
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : 'No date'
    if (!acc[date]) acc[date] = []
    acc[date].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Home</h1>
          <p className="text-sm text-gray-500">Daily life & smart home</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCard
            title="Tasks"
            subtitle={`${tasks.filter((t) => !t.completed).length} remaining`}
            icon={CheckSquare}
            href="/dashboard/tasks"
            variant="gradient"
          >
            {urgentTasks.length > 0 ? (
              <div className="space-y-2">
                {urgentTasks.map((task) => (
                  <div key={task.id} className="text-sm text-gray-700">
                    • {task.title}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">All caught up!</p>
            )}
          </SummaryCard>


          <SummaryCard
            title="Calendar"
            subtitle="Upcoming events"
            icon={Calendar}
            href="/home/calendar"
          >
            <p className="text-sm text-gray-500">No events scheduled</p>
          </SummaryCard>
        </div>

        {/* AI Input - defaults to task if ambiguous */}
        <AIInputBar onIntent={handleAIIntent} context="task" />

        {/* Full Task List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">All Tasks</h2>
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-500">
              No tasks yet. Add one to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTasks).map(([date, dateTasks]) => (
                <div key={date} className="glass-card p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">{date}</h3>
                  <div className="space-y-2">
                    {dateTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {
                            const updated = tasks.map((t) =>
                              t.id === task.id ? { ...t, completed: !t.completed } : t
                            )
                            localStorage.setItem('tasks', JSON.stringify(updated))
                            loadTasks()
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p
                            className={`${
                              task.completed
                                ? 'line-through text-gray-400'
                                : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {task.category.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
