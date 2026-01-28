'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Task, FamilyMember } from '@/types/home'
import AIPen from '@/components/AIPen'
import { showToast } from '@/components/feedback/ToastContainer'
import PageContainer from '@/components/ui/PageContainer'
import { logger } from '@/lib/logger'
import { Share2 } from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Task['category']>('other')
  const [showAddForm, setShowAddForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMember | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

  useEffect(() => {
    loadTasks()
    // Load family members for sharing
    try {
      const stored = localStorage.getItem('family')
      if (stored) {
        const parsed = JSON.parse(stored) as FamilyMember[]
        setFamilyMembers(parsed)
      }
    } catch (error) {
      logger.error('Error loading family members', error as Error)
    }
  }, [])

  const loadTasks = () => {
    try {
      const stored = localStorage.getItem('tasks')
      if (stored) {
        const parsed = JSON.parse(stored)
        setTasks(parsed)
        logger.debug('✅ Loaded tasks', { count: parsed.length })
      } else {
        setTasks([])
        logger.debug('ℹ️ No tasks found in localStorage')
      }
    } catch (error) {
      logger.error('❌ Error loading tasks', error as Error)
      setTasks([])
    }
  }

  const saveTasks = (newTasks: Task[]) => {
    try {
      localStorage.setItem('tasks', JSON.stringify(newTasks))
      setTasks(newTasks)
      // Trigger custom event for badge updates
      window.dispatchEvent(new Event('tasksUpdated'))
    } catch (error) {
      logger.error('Failed to save tasks to localStorage', error as Error)
      // Check if it's a quota exceeded error
      if (error instanceof Error && (error.name === 'QuotaExceededError' || (error as any).code === 22)) {
        showToast('Storage is full. Please clear browser data or remove some tasks.', 'error')
      } else {
        showToast('Failed to save tasks. Please try again.', 'error')
      }
      throw error // Re-throw so caller knows save failed
    }
  }

  const addTask = async (title: string, category: Task['category'] = 'other', dueDate?: string) => {
    const task: Task = {
      id: Date.now().toString(),
      title,
      category,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      sharedTo: selectedFamilyMember ? {
        id: selectedFamilyMember.id,
        name: selectedFamilyMember.name,
        email: selectedFamilyMember.email,
        phone: selectedFamilyMember.phone,
      } : undefined,
    }
    saveTasks([...tasks, task])
    setNewTaskTitle('')
    setShowAddForm(false)
    setShowShare(false)
    setSelectedFamilyMember(null)
    showToast('Added to your to-dos! ✓', 'success')

    // Share with family member if selected
    if (task.sharedTo) {
      try {
        // Get user's notification preferences
        const settingsStr = localStorage.getItem('abiSettings.v1')
        const settings = settingsStr ? JSON.parse(settingsStr) : {}
        
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: task.sharedTo,
            item: {
              type: 'task',
              title: task.title,
              date: task.dueDate,
            },
            preferences: {
              emailNotifications: settings.emailNotifications !== false,
              smsNotifications: settings.smsNotifications === true,
            },
          }),
        })

        if (response.ok) {
          showToast(`Shared with ${task.sharedTo.name}`, 'success')
        } else {
          console.error('Failed to share task')
        }
      } catch (error) {
        console.error('Error sharing task:', error)
      }
    }
  }

  const toggleTask = (id: string) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
      saveTasks(updatedTasks)
      // Use the UPDATED task state for the toast message
      const updatedTask = updatedTasks.find((t) => t.id === id)
      if (updatedTask) {
        showToast(updatedTask.completed ? 'To-Do completed! Great job! 🎉' : 'To-Do marked incomplete', 'success')
      }
    } catch (error) {
      showToast('Couldn\'t update that. Try again?', 'error')
    }
  }

  const deleteTask = (id: string) => {
    try {
      saveTasks(tasks.filter((task) => task.id !== id))
      showToast('To-Do deleted ✓', 'success')
    } catch (error) {
      showToast('Couldn\'t delete that. Try again?', 'error')
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
      <PageContainer>
        <div className="mb-6 flex items-center justify-between">
          <Link href="/today" className="transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            ← Back
          </Link>
          <h1 className="text-3xl font-bold transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>To-Do</h1>
          <div className="w-12"></div>
        </div>

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 px-6 py-4 border-2 border-dashed rounded-xl transition-all duration-250 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--glass-border)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)'
              e.currentTarget.style.backgroundColor = 'rgba(139, 158, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)'
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
            }}
          >
            <span className="text-lg">+</span>
            <span className="font-medium transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>New Task</span>
          </button>
        ) : (
          <div className="glass-card p-5 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>
                  To-Do Title <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-3 pr-10 rounded-lg border focus:outline-none transition-all duration-250"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)'
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(139, 158, 255, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>
                    <Share2 className="w-4 h-4 inline mr-1" strokeWidth={2} />
                    Share with family member (optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShare(!showShare)
                      if (showShare) {
                        setSelectedFamilyMember(null)
                      }
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg transition-colors duration-250"
                    style={{
                      backgroundColor: showShare ? 'rgba(139, 158, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: showShare ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!showShare) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showShare) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                      }
                    }}
                  >
                    {showShare ? 'Cancel' : 'Share'}
                  </button>
                </div>
                {showShare && (
                  <select
                    value={selectedFamilyMember?.id || ''}
                    onChange={(e) => {
                      const member = familyMembers.find(m => m.id === e.target.value)
                      setSelectedFamilyMember(member || null)
                    }}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all duration-250"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)'
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(139, 158, 255, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <option value="" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>Select family member...</option>
                    {familyMembers.map((member) => (
                      <option key={member.id} value={member.id} style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                )}
                {selectedFamilyMember && (
                  <p className="mt-2 text-xs transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
                    Will share with {selectedFamilyMember.name}
                    {selectedFamilyMember.email && ` (${selectedFamilyMember.email})`}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewTaskTitle('')
                    setShowShare(false)
                    setSelectedFamilyMember(null)
                  }}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors duration-250"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
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
                  className="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-250"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.opacity = '0.9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.opacity = '1'
                    }
                  }}
                >
                  Add To-Do
                </button>
              </div>
            </div>
          </div>
        )}

        {Object.keys(groupedTasks).length === 0 ? (
          <div className="glass-card p-8 text-center transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
            No tasks yet. Add one to get started!
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([date, dateTasks]) => (
              <div key={date} className="glass-card p-4">
                <h2 className="font-semibold mb-3 transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>{date}</h2>
                <div className="space-y-2">
                  {dateTasks.map((task) => {
                    if (!task || !task.id) return null;
                    return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-250"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="w-5 h-5 rounded transition-colors duration-250"
                        style={{ borderColor: 'var(--glass-border)', accentColor: 'var(--accent-primary)' }}
                      />
                      <div className="flex-1">
                        <p
                          className={`transition-colors duration-250 ${
                            task.completed ? 'line-through' : ''
                          }`}
                          style={{ color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}
                        >
                          {task.title || 'Untitled Task'}
                        </p>
                        <span className="text-xs transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
                          {task.category ? task.category.replace('-', ' ') : 'other'}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="transition-colors duration-250"
                        style={{ color: 'var(--error)' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        ×
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  )
}
