'use client'

import { useState } from 'react'
import { Clock, ShoppingCart } from 'lucide-react'

interface MealItem {
  id: string
  date: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'baker'
  title: string
  description: string
  ingredients: { name: string; quantity: string }[]
  prepTime: number
  tags: string[]
}

interface MealCalendarProps {
  meals: MealItem[]
}

export default function MealCalendar({ meals }: MealCalendarProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null)

  const mealTypeColors = {
    breakfast: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    lunch: 'bg-green-50 border-green-200 text-green-800',
    dinner: 'bg-blue-50 border-blue-200 text-blue-800',
    baker: 'bg-pink-50 border-pink-200 text-pink-800'
  }

  const mealTypeIcons = {
    breakfast: '🍳',
    lunch: '🥪',
    dinner: '🍽',
    baker: '🧁'
  }

  // Group meals by date
  const mealsByDate = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = []
    acc[meal.date].push(meal)
    return acc
  }, {} as Record<string, MealItem[]>)

  const sortedDates = Object.keys(mealsByDate).sort()

  const handleAddToShopping = async () => {
    if (!selectedMeal) return

    try {
      // Normalize and add ingredients to shopping list
      const items = selectedMeal.ingredients.map(ing => ing.name)
      
      await fetch('/api/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })

      alert(`Added ${items.length} items to shopping list`)
      setSelectedMeal(null)
    } catch (error) {
      console.error('Error adding to shopping:', error)
      alert('Failed to add items to shopping list')
    }
  }

  return (
    <div className="space-y-4">
      {sortedDates.map(date => (
        <div key={date} className="space-y-2">
          <div className="text-sm font-medium text-gray-600">
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <div className="space-y-2">
            {mealsByDate[date].map(meal => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                  mealTypeColors[meal.mealType]
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{mealTypeIcons[meal.mealType]}</span>
                      <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                        {meal.mealType}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 mb-1">{meal.title}</div>
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      {meal.prepTime} min
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{mealTypeIcons[selectedMeal.mealType]}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {selectedMeal.mealType}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedMeal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMeal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-4">{selectedMeal.description}</p>

            <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" strokeWidth={2} />
                {selectedMeal.prepTime} min
              </div>
            </div>

            {/* Tags */}
            {selectedMeal.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedMeal.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Ingredients */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Ingredients</h4>
              <ul className="space-y-2">
                {selectedMeal.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{ing.name}</span>
                    <span className="text-gray-500">{ing.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add to Shopping */}
            <button
              onClick={handleAddToShopping}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              Add to Shopping List
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
