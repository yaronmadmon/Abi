'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Meal } from '@/types/home'
import AIInputBar from '@/components/AIInputBar'
import { showToast } from '@/components/feedback/ToastContainer'

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [newMealName, setNewMealName] = useState('')
  const [selectedDay, setSelectedDay] = useState('monday')
  const [selectedMealType, setSelectedMealType] = useState<Meal['mealType']>('dinner')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = () => {
    const stored = localStorage.getItem('meals')
    if (stored) {
      setMeals(JSON.parse(stored))
    }
  }

  const saveMeals = (newMeals: Meal[]) => {
    localStorage.setItem('meals', JSON.stringify(newMeals))
    setMeals(newMeals)
  }

  const addMeal = (name: string, day: string, mealType: Meal['mealType']) => {
    try {
      const meal: Meal = {
        id: Date.now().toString(),
        name,
        day,
        mealType,
        createdAt: new Date().toISOString(),
      }
      saveMeals([...meals, meal])
      setNewMealName('')
      setShowAddForm(false)
      showToast('Meal added', 'success')
    } catch (error) {
      showToast('Couldn\'t add meal', 'error')
    }
  }

  const deleteMeal = (id: string) => {
    try {
      saveMeals(meals.filter((meal) => meal.id !== id))
      showToast('Meal deleted', 'success')
    } catch (error) {
      showToast('Couldn\'t delete meal', 'error')
    }
  }

  const handleAIIntent = (route: string, payload: any) => {
    if (route === 'meals') {
      const day = payload.day || 'monday'
      const mealType = (payload.mealType || 'dinner') as Meal['mealType']
      addMeal(payload.name || 'New meal', day, mealType)
      // Reload meals to show the new one
      loadMeals()
      showToast('Meal added', 'success')
    }
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

  const mealTypes: Meal['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack']

  const getMealsForDay = (day: string) => {
    return meals.filter((meal) => meal.day === day)
  }

  return (
    <div className="min-h-screen p-6 pb-40">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
          <div className="w-12"></div>
        </div>

        <AIInputBar onIntent={handleAIIntent} />

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-secondary w-full mb-6"
          >
            + Add Meal Manually
          </button>
        ) : (
          <div className="glass-card p-4 mb-6">
            <input
              type="text"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              placeholder="Meal name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newMealName.trim()) {
                  addMeal(newMealName.trim(), selectedDay, selectedMealType)
                }
              }}
            />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedMealType}
                onChange={(e) =>
                  setSelectedMealType(e.target.value as Meal['mealType'])
                }
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mealTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (newMealName.trim()) {
                    addMeal(newMealName.trim(), selectedDay, selectedMealType)
                  }
                }}
                className="btn-primary flex-1"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewMealName('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map((day) => {
            const dayMeals = getMealsForDay(day)
            return (
              <div key={day} className="glass-card p-3">
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  {day.charAt(0).toUpperCase() + day.slice(1).slice(0, 3)}
                </h3>
                <div className="space-y-2">
                  {dayMeals.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center">No meals</p>
                  ) : (
                    dayMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="bg-white/60 rounded-lg p-2 text-xs"
                      >
                        <div className="font-medium text-gray-900">
                          {meal.name}
                        </div>
                        <div className="text-gray-500">{meal.mealType}</div>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="text-red-400 hover:text-red-600 mt-1"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
