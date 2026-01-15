'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Task } from '@/types/home'
import AIInputBar from '@/components/AIInputBar'
import AIPen from '@/components/AIPen'
import { showToast } from '@/components/feedback/ToastContainer'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Task['category']>('other')
  const [showAddForm, setShowAddForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = () => {
    try {
      const stored = localStorage.getItem('tasks')
      if (stored) {
        const parsed = JSON.parse(stored)
        setTasks(parsed)
        console.log('✅ Loaded tasks:', parsed.length)
      } else {
        setTasks([])
        console.log('ℹ️ No tasks found in localStorage')
      }
    } catch (error) {
      console.error('❌ Error loading tasks:', error)
      setTasks([])
    }
  }

  const saveTasks = (newTasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(newTasks))
    setTasks(newTasks)
    // Trigger custom event for badge updates
    window.dispatchEvent(new Event('tasksUpdated'))
  }

  const addTask = (title: string, category: Task['category'] = 'other', dueDate?: string) => {
    const task: Task = {
      id: Date.now().toString(),
      title,
      category,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    saveTasks([...tasks, task])
    setNewTaskTitle('')
    setShowAddForm(false)
    showToast('Task added', 'success')
  }

  const toggleTask = (id: string) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
      saveTasks(updatedTasks)
      const task = tasks.find((t) => t.id === id)
      if (task) {
        showToast(task.completed ? 'To-Do marked incomplete' : 'To-Do completed', 'success')
      }
    } catch (error) {
      showToast('Couldn\'t update To-Do', 'error')
    }
  }

  const deleteTask = (id: string) => {
    try {
      saveTasks(tasks.filter((task) => task.id !== id))
      showToast('To-Do deleted', 'success')
    } catch (error) {
      showToast('Couldn\'t delete To-Do', 'error')
    }
  }

  const handleAIIntent = (route: string, payload: any) => {
    console.log('📥 handleAIIntent called with:', route, payload)
    if (route === 'tasks') {
      // Task was already created by tasksHandler.create() in routeIntent
      // Reload tasks to show the new one - try multiple times to ensure it's loaded
      const reloadTasks = () => {
        loadTasks()
        // Verify the task was actually saved
        const stored = localStorage.getItem('tasks')
        if (stored) {
          const tasks = JSON.parse(stored)
          const found = tasks.find((t: Task) => t.title === payload.title)
          if (!found) {
            console.warn('⚠️ Task not found after save, retrying...')
            setTimeout(reloadTasks, 200)
          } else {
            console.log('✅ Task confirmed in localStorage')
          }
        }
      }
      
      setTimeout(reloadTasks, 100) // Small delay to ensure localStorage is updated
      
      // Show success confirmation
      showToast('To-Do added', 'success')
    } else if (route === 'reminders') {
      // Reminders are also stored as tasks
      const reloadTasks = () => {
        loadTasks()
      }
      setTimeout(reloadTasks, 100)
      showToast('Reminder added', 'success')
    }
  }
  
  // Also listen for storage events to update when tasks change from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks') {
        loadTasks()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const categories: Task['category'][] = [
    'cleaning',
    'errands',
    'kids',
    'home-maintenance',
    'other',
  ]

  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : 'No date'
    if (!acc[date]) acc[date] = []
    acc[date].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  return (
    <div className="min-h-screen p-6 pb-40">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">To-Do</h1>
          <div className="w-12"></div>
        </div>

        <AIInputBar onIntent={handleAIIntent} />

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            <span className="font-medium text-gray-700">Add To-Do</span>
          </button>
        ) : (
          <div className="glass-card p-5 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To-Do Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTaskTitle.trim()) {
                        addTask(newTaskTitle.trim(), selectedCategory)
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <AIPen
                      text={newTaskTitle}
                      onPolished={(polished) => setNewTaskTitle(polished)}
                      disabled={false}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as Task['category'])
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date (optional)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value && newTaskTitle.trim()) {
                        addTask(newTaskTitle.trim(), selectedCategory, e.target.value)
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewTaskTitle('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newTaskTitle.trim()) {
                      addTask(newTaskTitle.trim(), selectedCategory)
                    }
                  }}
                  disabled={!newTaskTitle.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add To-Do
                </button>
              </div>
            </div>
          </div>
        )}

        {Object.keys(groupedTasks).length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">
            No tasks yet. Add one to get started!
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([date, dateTasks]) => (
              <div key={date} className="glass-card p-4">
                <h2 className="font-semibold text-gray-700 mb-3">{date}</h2>
                <div className="space-y-2">
                  {dateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
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
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
