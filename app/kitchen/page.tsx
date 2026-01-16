'use client'

import { useState, useEffect } from 'react'
import { UtensilsCrossed, ShoppingCart, BookOpen, Package } from 'lucide-react'
import SummaryCard from '@/components/section/SummaryCard'
import AIInputBar from '@/components/AIInputBar'
import type { Meal, ShoppingItem } from '@/types/home'

export default function KitchenPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [todayMeals, setTodayMeals] = useState<Meal[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedMeals = localStorage.getItem('meals')
    const storedShopping = localStorage.getItem('shoppingItems')

    if (storedMeals) {
      const allMeals = JSON.parse(storedMeals)
      setMeals(allMeals)
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      setTodayMeals(allMeals.filter((m: Meal) => m.day === today))
    }

    if (storedShopping) {
      setShoppingItems(JSON.parse(storedShopping))
    }
  }

  const handleAIIntent = (route: string, payload: any) => {
    if (route === 'meals' || route === 'shopping') {
      loadData()
    }
  }

  const pendingShopping = shoppingItems.filter((item) => !item.completed).slice(0, 3)

  return (
    <div className="min-h-screen p-6 page-with-bottom-nav" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kitchen</h1>
          <p className="text-sm text-gray-500">Recipes, groceries & pantry</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCard
            title="Today's Meals"
            subtitle={`${todayMeals.length} planned`}
            icon={UtensilsCrossed}
            href="/dashboard/meals"
            variant="gradient"
          >
            {todayMeals.length > 0 ? (
              <div className="space-y-2">
                {todayMeals.map((meal) => (
                  <div key={meal.id} className="text-sm text-gray-700">
                    • {meal.name} ({meal.mealType})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No meals planned for today</p>
            )}
          </SummaryCard>

          <SummaryCard
            title="Shopping List"
            subtitle={`${pendingShopping.length} items`}
            icon={ShoppingCart}
            href="/dashboard/shopping"
          >
            {pendingShopping.length > 0 ? (
              <div className="space-y-2">
                {pendingShopping.map((item) => (
                  <div key={item.id} className="text-sm text-gray-700">
                    • {item.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Shopping list is empty</p>
            )}
          </SummaryCard>

        </div>

        {/* AI Input */}
        <AIInputBar onIntent={handleAIIntent} />

        {/* Full Lists */}
        <div className="space-y-6 mt-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">This Week&apos;s Meals</h2>
            <div className="grid grid-cols-7 gap-2">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const dayMeals = meals.filter((m) => m.day === day)
                return (
                  <div key={day} className="glass-card p-3">
                    <h3 className="text-xs font-medium text-gray-700 mb-2 text-center">
                      {day.slice(0, 3).toUpperCase()}
                    </h3>
                    {dayMeals.length > 0 ? (
                      <div className="space-y-1">
                        {dayMeals.map((meal) => (
                          <div key={meal.id} className="text-xs text-gray-600">
                            {meal.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center">-</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
