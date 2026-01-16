'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, UtensilsCrossed, ShoppingCart, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { HomeProfile, Task } from '@/types/home'

export default function DashboardPage() {
  const [profile, setProfile] = useState<HomeProfile | null>(null)
  const [incompleteTodoCount, setIncompleteTodoCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('homeProfile')
    if (stored) {
      setProfile(JSON.parse(stored))
    }

    const loadTodoCount = () => {
      try {
        const stored = localStorage.getItem('tasks')
        if (stored) {
          const tasks: Task[] = JSON.parse(stored)
          const incomplete = tasks.filter((task) => !task.completed)
          setIncompleteTodoCount(incomplete.length)
        }
      } catch (error) {
        console.error('Error loading To-Do count:', error)
      }
    }

    loadTodoCount()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks') {
        loadTodoCount()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom events from same-tab updates
    const handleCustomStorage = () => {
      loadTodoCount()
    }
    window.addEventListener('tasksUpdated', handleCustomStorage)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tasksUpdated', handleCustomStorage)
    }
  }, [])

  const modules = [
    {
      title: 'To-Do',
      description: 'Manage your daily tasks',
      href: '/dashboard/tasks',
      Icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Meals',
      description: 'Plan your weekly meals',
      href: '/dashboard/meals',
      Icon: UtensilsCrossed,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Shopping',
      description: 'Your shopping list',
      href: '/dashboard/shopping',
      Icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Weekly View',
      description: 'See your week at a glance',
      href: '/dashboard/weekly',
      Icon: Calendar,
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div className="min-h-screen p-6 pb-40" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Home
          </h1>
          <p className="text-gray-600">
            {profile?.numberOfPeople
              ? `Managing a ${profile.homeType} for ${profile.numberOfPeople} ${profile.numberOfPeople === 1 ? 'person' : 'people'}`
              : 'Your home management hub'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {modules.map((module) => {
            const isTodo = module.title === 'To-Do'
            return (
              <Link
                key={module.title}
                href={module.href}
                className="glass-card p-6 hover:shadow-soft-lg transition-all duration-200 card-press relative"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 shadow-soft`}>
                  <module.Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {module.title}
                </h2>
                <p className="text-gray-600">{module.description}</p>
                {isTodo && incompleteTodoCount > 0 && (
                  <div className="pending-badge">
                    {incompleteTodoCount > 99 ? '99+' : incompleteTodoCount}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
