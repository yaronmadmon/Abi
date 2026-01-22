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
          <Link href="/today" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Overview</h1>
          <div className="w-12"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="glass-card p-4 mb-4">
              <h2 className="font-semibold text-gray-900 mb-4">This Week</h2>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const dayTasks = getTasksForDay(day)
                  const dayMeals = getMealsForDay(day)
                  return (
                    <div key={day} className="text-center">
                      <div className="font-medium text-gray-700 mb-2 text-sm">
                        {day.charAt(0).toUpperCase() + day.slice(1).slice(0, 3)}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.length > 0 && (
                          <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                          </div>
                        )}
                        {dayMeals.length > 0 && (
                          <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
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
              <h2 className="font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
              {upcomingTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming tasks</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/50"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">
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
