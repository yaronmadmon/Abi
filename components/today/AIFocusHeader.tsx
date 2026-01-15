'use client'

import { useState, useEffect } from 'react'

export default function AIFocusHeader() {
  const [insight, setInsight] = useState<string>('')

  useEffect(() => {
    // Generate simple insight based on current data
    // In future, this will use AI to generate contextual insights
    const generateInsight = () => {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      const meals = JSON.parse(localStorage.getItem('meals') || '[]')
      const shopping = JSON.parse(localStorage.getItem('shoppingItems') || '[]')

      const urgentTasks = tasks.filter((t: any) => !t.completed && t.dueDate)
      const todayWeekday = new Date()
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase()
      const todayMeals = meals.filter((m: any) => {
        return m.day === todayWeekday
      })

      if (urgentTasks.length > 0) {
        return `${urgentTasks.length} thing${urgentTasks.length > 1 ? 's' : ''} to focus on today.`
      }
      if (todayMeals.length > 0) {
        return `${todayMeals.length} meal${todayMeals.length > 1 ? 's' : ''} planned. You're all set.`
      }
      if (shopping.length > 0) {
        return `${shopping.length} item${shopping.length > 1 ? 's' : ''} on your list.`
      }
      return 'All set for today. Take a moment to breathe.'
    }

    setInsight(generateInsight())
  }, [])

  if (!insight) return null

  return (
    <div className="glass-card p-4 mb-4 animate-fade-in">
      <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
    </div>
  )
}
