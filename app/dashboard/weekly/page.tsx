'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Task, Meal, ShoppingItem } from '@/types/home'
import PageContainer from '@/components/ui/PageContainer'

export default function WeeklyPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedTasks = localStorage.getItem('tasks')
    const storedMeals = localStorage.getItem('weeklyMeals')
    const storedShopping = localStorage.getItem('shoppingItems')

    if (storedTasks) setTasks(JSON.parse(storedTasks))
    if (storedMeals) setMeals(JSON.parse(storedMeals))
    if (storedShopping) setShoppingItems(JSON.parse(storedShopping))
  }

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]

  const getTasksForDay = (day: string) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase()
      return taskDate === day
    })
  }

  const getMealsForDay = (day: string) => {
    return meals.filter((meal) => meal.day === day)
  }

  const upcomingTasks = tasks
    .filter((task) => !task.completed && task.dueDate)
    .slice(0, 5)

  const pendingShopping = shoppingItems.filter((item) => !item.completed).slice(0, 5)

  return (
    <div className="min-h-screen p-6 pb-40" style={{ backgroundColor: 'var(--background)' }}>
      <PageContainer maxWidth="6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/today" className="transition-colors duration-250" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            ← Back
          </Link>
          <h1 className="text-3xl font-bold transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>Weekly Overview</h1>
          <div className="w-12"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="glass-card p-4 mb-4">
              <h2 className="font-semibold mb-4 transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>This Week</h2>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const dayTasks = getTasksForDay(day)
                  const dayMeals = getMealsForDay(day)
                  return (
                    <div key={day} className="text-center">
                      <div className="font-medium mb-2 text-sm transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>
                        {day.charAt(0).toUpperCase() + day.slice(1).slice(0, 3)}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.length > 0 && (
                          <div className="text-xs px-2 py-1 rounded transition-colors duration-250" style={{ backgroundColor: 'rgba(139, 158, 255, 0.2)', color: 'var(--accent-primary)' }}>
                            {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                          </div>
                        )}
                        {dayMeals.length > 0 && (
                          <div className="text-xs px-2 py-1 rounded transition-colors duration-250" style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)', color: 'var(--success)' }}>
                            {dayMeals.length} meal{dayMeals.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="glass-card p-4">
              <h2 className="font-semibold mb-4 transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>Upcoming Tasks</h2>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>No upcoming tasks</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg transition-colors duration-250"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <div className="w-2 h-2 rounded-full transition-colors duration-250" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                      <div className="flex-1">
                        <p className="text-sm transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                        <p className="text-xs transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
                          {task.dueDate &&
                            new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Shopping</h2>
              {pendingShopping.length === 0 ? (
                <p className="text-gray-500 text-sm">All done! 🎉</p>
              ) : (
                <div className="space-y-2">
                  {pendingShopping.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/50"
                    >
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <p className="text-sm text-gray-900">{item.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Tasks</span>
                    <span className="font-semibold text-gray-900">
                      {tasks.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">
                      {tasks.filter((t) => t.completed).length}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Meals Planned</span>
                    <span className="font-semibold text-gray-900">
                      {meals.length}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Shopping Items</span>
                    <span className="font-semibold text-gray-900">
                      {shoppingItems.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
