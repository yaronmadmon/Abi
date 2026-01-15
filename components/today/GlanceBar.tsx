'use client'

import { useState, useEffect } from 'react'
import { Sun, CheckCircle2, UtensilsCrossed, ChevronDown } from 'lucide-react'
import type { Meal, Task } from '@/types/home'

export default function GlanceBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [tomorrowItems, setTomorrowItems] = useState<{ meals: Meal[]; tasks: Task[] }>({
    meals: [],
    tasks: [],
  })

  const weekdayKey = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

  useEffect(() => {
    loadTomorrowData()
  }, [])

  const loadTomorrowData = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDate = tomorrow.toISOString().split('T')[0]
    const tomorrowDay = weekdayKey(tomorrow)

    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const meals = JSON.parse(localStorage.getItem('meals') || '[]')

    const tomorrowTasks = tasks
      .filter((t: Task) => !t.completed && t.dueDate === tomorrowDate)
      .slice(0, 2)

    const tomorrowMeals = meals.filter((m: Meal) => m.day === tomorrowDay).slice(0, 2)

    setTomorrowItems({ meals: tomorrowMeals, tasks: tomorrowTasks })
  }

  const hasContent = tomorrowItems.meals.length > 0 || tomorrowItems.tasks.length > 0

  if (!hasContent && !isExpanded) return null

  return (
    <div className="glass-card p-3 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 flex-1">
          <Sun className="w-4 h-4 text-[#4a5568]" strokeWidth={1.5} />
          <span className="text-xs text-gray-600">Sunny, 72°F</span>
        </div>
        {hasContent && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Tomorrow</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
          </div>
        )}
      </button>

      {isExpanded && hasContent && (
        <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2 animate-fade-in">
          {tomorrowItems.tasks.map((task) => (
            <div key={task.id} className="text-xs text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4a5568]" strokeWidth={1.5} />
              <span>{task.title}</span>
            </div>
          ))}
          {tomorrowItems.meals.map((meal) => (
            <div key={meal.id} className="text-xs text-gray-600 flex items-center gap-2">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#4a5568]" strokeWidth={1.5} />
              <span>{meal.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
