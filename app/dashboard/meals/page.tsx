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
    <div className="min-h-screen p-4 pb-16 transition-colors duration-250" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <PageContainer maxWidth="2xl" className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat className="w-8 h-8 transition-colors duration-250" strokeWidth={1.5} style={{ color: 'var(--accent-primary)' }} />
          <h1 className="text-3xl font-bold transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>Meal Planner</h1>
        </div>
        <p className="transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>Plan meals that fit your week</p>
      </PageContainer>

      {/* Main Content */}
      <PageContainer maxWidth="2xl">
        {/* Primary CTA */}
        {!showPlanner && (
          <button
            onClick={() => setShowPlanner(true)}
            className="w-full mb-6 px-6 py-4 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-250 flex items-center justify-center gap-3 text-lg font-medium"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Sparkles className="w-6 h-6" strokeWidth={2} />
            Cook with Abby AI
          </button>
        )}

        {/* Planner Flow */}
        {showPlanner && (
          <div className="rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
            <MealPlannerFlow
              onComplete={handleMealsGenerated}
              onCancel={() => setShowPlanner(false)}
            />
          </div>
        )}

        {/* Meal Calendar */}
        {meals.length > 0 && (
          <div className="rounded-2xl shadow-lg p-6 transition-colors duration-250" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 transition-colors duration-250" strokeWidth={1.5} style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-xl font-semibold transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>Your Meals</h2>
            </div>
            <MealCalendar meals={meals} />
          </div>
        )}

        {/* Empty State */}
        {meals.length === 0 && !showPlanner && (
          <div className="text-center py-12 px-6">
            <ChefHat className="w-16 h-16 mx-auto mb-4 transition-colors duration-250" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-medium mb-2 transition-colors duration-250" style={{ color: 'var(--text-primary)' }}>No meals planned yet</h3>
            <p className="text-sm transition-colors duration-250" style={{ color: 'var(--text-secondary)' }}>
              Create a meal plan to get started
            </p>
          </div>
        )}
      </PageContainer>
    </div>
  )
}
