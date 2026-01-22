'use client'

import { useState } from 'react'
import { Sparkles, Calendar, ChefHat } from 'lucide-react'
import MealPlannerFlow from '@/components/meals/MealPlannerFlow'
import MealCalendar from '@/components/meals/MealCalendar'
import PageContainer from '@/components/ui/PageContainer'

export default function MealsPage() {
  const [showPlanner, setShowPlanner] = useState(false)
  const [meals, setMeals] = useState<any[]>([])

  const handleMealsGenerated = (newMeals: any[]) => {
    setMeals(prev => [...prev, ...newMeals])
    setShowPlanner(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 pb-16">
      {/* Header */}
      <PageContainer maxWidth="2xl" className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat className="w-8 h-8 text-orange-600" strokeWidth={1.5} />
          <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
        </div>
        <p className="text-gray-600">Plan meals that fit your week</p>
      </PageContainer>

      {/* Main Content */}
      <PageContainer maxWidth="2xl">
        {/* Primary CTA */}
        {!showPlanner && (
          <button
            onClick={() => setShowPlanner(true)}
            className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg font-medium"
          >
            <Sparkles className="w-6 h-6" strokeWidth={2} />
            Cook with Abby AI
          </button>
        )}

        {/* Planner Flow */}
        {showPlanner && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <MealPlannerFlow
              onComplete={handleMealsGenerated}
              onCancel={() => setShowPlanner(false)}
            />
          </div>
        )}

        {/* Meal Calendar */}
        {meals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-orange-600" strokeWidth={1.5} />
              <h2 className="text-xl font-semibold text-gray-900">Your Meals</h2>
            </div>
            <MealCalendar meals={meals} />
          </div>
        )}

        {/* Empty State */}
        {meals.length === 0 && !showPlanner && (
          <div className="text-center py-12 px-6">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No meals planned yet</h3>
            <p className="text-gray-500 text-sm">
              Create a meal plan to get started
            </p>
          </div>
        )}
      </PageContainer>
    </div>
  )
}
