'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Sparkles, Check, Calendar, ShoppingCart, Clock, ChefHat, BookOpen, Wand2, Trash2 } from 'lucide-react'
import { selectRecipesForPlan, Recipe } from '@/data/recipeDatabase'
import PageContainer from '@/components/ui/PageContainer'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'baking'
type TimeRange = 'day' | 'week' | 'custom'
type PlanningMode = 'curated' | 'ai'

interface GeneratedMeal {
  id: string
  recipeId?: string // Original recipe ID for reference
  date: string
  mealType: MealType
  title: string
  description: string
  imageUrl: string
  ingredients: { name: string; quantity: string }[]
  instructions?: string[]
  prepTime: number
  tags: string[]
  isLeftover?: boolean
  leftoverFrom?: string
}

export default function MealPlannerPage() {
  const router = useRouter()
  const [step, setStep] = useState<'mode' | 'type' | 'range' | 'planning' | 'results' | 'confirm'>('mode')
  const [planningMode, setPlanningMode] = useState<PlanningMode>('curated')
  const [selectedTypes, setSelectedTypes] = useState<MealType[]>(['dinner'])
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [customDays, setCustomDays] = useState(7)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMeals, setGeneratedMeals] = useState<GeneratedMeal[]>([])
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)

  const mealTypeConfig = {
    breakfast: { label: 'Breakfast', emoji: '🍳', color: 'from-yellow-400 to-yellow-500' },
    lunch: { label: 'Lunch', emoji: '🥪', color: 'from-green-400 to-green-500' },
    dinner: { label: 'Dinner', emoji: '🍽️', color: 'from-blue-400 to-blue-500' },
    baking: { label: 'Baking', emoji: '🧁', color: 'from-pink-400 to-pink-500' },
  }

  const toggleMealType = (type: MealType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleDeleteMeal = (mealId: string) => {
    if (!confirm('Are you sure you want to remove this meal?')) return
    
    setGeneratedMeals(prev => prev.filter(meal => meal.id !== mealId))
  }

  const dayToDate = (day: string, offset: number = 0): string => {
    const dayMap: Record<string, number> = {
      mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0
    }
    
    const today = new Date()
    const todayDay = today.getDay()
    const targetDay = dayMap[day]
    
    let daysToAdd = targetDay - todayDay + (offset * 7)
    if (daysToAdd < 0) daysToAdd += 7
    
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysToAdd)
    
    return targetDate.toISOString().split('T')[0]
  }

  const handleCreatePlan = async () => {
    setStep('planning')
    setIsGenerating(true)

    try {
      // Determine days to generate
      const days = timeRange === 'day' ? ['mon'] 
        : timeRange === 'week' ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        : Array.from({ length: customDays }, (_, i) => {
            const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
            return dayNames[i % 7]
          })

      let meals: GeneratedMeal[]

      if (planningMode === 'curated') {
        // Use curated recipe database - get recipes for each meal type
        meals = []
        
        for (const mealType of selectedTypes) {
          const recipesForType = selectRecipesForPlan({
            mealTypes: [mealType],
            daysCount: days.length,
            cuisines: ['american', 'italian', 'asian', 'mexican'],
            preferences: ['family-friendly', 'quick'],
            quick: true
          })

          // Assign each recipe to a different day
          recipesForType.slice(0, days.length).forEach((recipe, dayIndex) => {
            const date = dayToDate(days[dayIndex])
            meals.push({
              id: `meal-${recipe.id}-${date}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              recipeId: recipe.id, // Keep original recipe ID for reference
              date,
              mealType: recipe.mealType,
              title: recipe.title,
              description: recipe.description,
              imageUrl: recipe.imageUrl,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              prepTime: recipe.prepTime,
              tags: recipe.tags
            })
          })
        }
      } else {
        // Use AI generation
        const response = await fetch('/api/ai/meals/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealTypes: selectedTypes,
            days,
            cuisines: ['american', 'italian', 'asian'],
            preferences: {
              options: ['chicken', 'vegetarian'],
              familyFriendly: true,
              quick: true
            }
          })
        })

        if (!response.ok) throw new Error('Failed to generate meals')

        const data = await response.json()
        meals = data.meals
      }

      // Apply leftover logic: Dinner → next-day lunch reuse
      const mealsWithLeftovers = meals.map((meal, index) => {
        if (meal.mealType === 'lunch' && index > 0) {
          const prevDinner = meals.slice(0, index).reverse().find(m => m.mealType === 'dinner')
          if (prevDinner && Math.random() > 0.6) { // 40% chance of leftover
            return {
              ...meal,
              title: `${prevDinner.title} (Leftovers)`,
              description: `Enjoy yesterday's ${prevDinner.title}`,
              imageUrl: prevDinner.imageUrl,
              ingredients: prevDinner.ingredients,
              prepTime: 5,
              isLeftover: true,
              leftoverFrom: prevDinner.id
            }
          }
        }
        return meal
      })

      // Auto-save to weekly meals
      const storedMeals = localStorage.getItem('weeklyMeals') || '[]'
      const weeklyMeals = JSON.parse(storedMeals)
      const updatedWeekly = [...weeklyMeals, ...mealsWithLeftovers]
      localStorage.setItem('weeklyMeals', JSON.stringify(updatedWeekly))
      window.dispatchEvent(new Event('mealsUpdated'))

      // Auto-generate and save shopping list
      const allIngredients = mealsWithLeftovers
        .filter(m => !m.isLeftover) // Skip leftover meals
        .flatMap(m => m.ingredients.map(ing => ing.name.toLowerCase().trim()))
      const uniqueIngredients = Array.from(new Set(allIngredients))

      await fetch('/api/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: uniqueIngredients })
      })

      setGeneratedMeals(mealsWithLeftovers)
      setStep('results')
    } catch (error) {
      console.error('Error generating meals:', error)
      alert('Failed to generate meal plan. Please try again.')
      setStep('type')
    } finally {
      setIsGenerating(false)
    }
  }

  // Group meals by date and sort by meal type
  const mealsByDate: Record<string, GeneratedMeal[]> = {}
  const mealTypeOrder = { breakfast: 1, lunch: 2, dinner: 3, baking: 4 }
  
  generatedMeals.forEach(meal => {
    if (!mealsByDate[meal.date]) mealsByDate[meal.date] = []
    mealsByDate[meal.date].push(meal)
  })
  
  // Sort meals within each day by meal type
  Object.keys(mealsByDate).forEach(date => {
    mealsByDate[date].sort((a, b) => mealTypeOrder[a.mealType] - mealTypeOrder[b.mealType])
  })
  
  const sortedDates = Object.keys(mealsByDate).sort()

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <PageContainer className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => {
              if (step === 'mode') router.back()
              else if (step === 'type') setStep('mode')
              else if (step === 'range') setStep('type')
              else setStep('type')
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
              planningMode === 'curated' 
                ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              {planningMode === 'curated' ? (
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
              ) : (
                <Wand2 className="w-5 h-5 text-white" strokeWidth={2} />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {planningMode === 'curated' ? 'Curated Recipes' : 'Abby AI Meal Planner'}
              </h1>
              <p className="text-xs text-gray-500">
                {step === 'mode' && 'Choose your planning style'}
                {step === 'type' && 'What are we planning?'}
                {step === 'range' && 'How many days?'}
                {step === 'planning' && 'Creating your plan...'}
                {step === 'confirm' && 'Review your plan'}
                {step === 'results' && 'Your meal plan'}
              </p>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Content */}
      <PageContainer className="px-6 py-6">
        {/* Step 0: Mode Selection */}
        {step === 'mode' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you like to plan?</h2>
              <p className="text-gray-600">Choose your planning style</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Curated Recipes Option */}
              <button
                onClick={() => {
                  setPlanningMode('curated')
                  setStep('type')
                }}
                className="relative p-6 rounded-2xl border-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">Browse Curated Recipes</h3>
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">RECOMMENDED</span>
                    </div>
                    <p className="text-orange-100 mb-4">Choose from our collection of tested, family-favorite recipes</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                        ⚡ Instant
                      </div>
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                        🎯 Curated Quality
                      </div>
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                        💰 No AI Cost
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-orange-500" strokeWidth={3} />
                  </div>
                </div>
              </button>

              {/* AI Generation Option */}
              <button
                onClick={() => {
                  setPlanningMode('ai')
                  setStep('type')
                }}
                className="relative p-6 rounded-2xl border-3 border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Wand2 className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Generate with Abby</h3>
                    <p className="text-gray-600 mb-4">Let Abby create custom meal ideas based on your preferences</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        ✨ Creative
                      </div>
                      <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                        🎲 Variety
                      </div>
                      <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        ⏱️ 3-5 sec
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Both options create the same quality meal plans. Choose what feels right!
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Meal Type Selection */}
        {step === 'type' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are we planning?</h2>
              <p className="text-gray-600">Select the meals you want to plan</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(mealTypeConfig) as MealType[]).map(type => {
                const config = mealTypeConfig[type]
                const isSelected = selectedTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleMealType(type)}
                    className={`relative p-6 rounded-2xl border-3 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-gradient-to-br ' + config.color + ' text-white shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 text-orange-500" strokeWidth={3} />
                      </div>
                    )}
                    <div className="text-4xl mb-3">{config.emoji}</div>
                    <div className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {config.label}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setStep('range')}
              disabled={selectedTypes.length === 0}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Time Range Selection */}
        {step === 'range' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How many days?</h2>
              <p className="text-gray-600">Choose your planning horizon</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'day' as TimeRange, label: 'Just Today', desc: 'Plan for today only' },
                { value: 'week' as TimeRange, label: 'This Week', desc: '7 days of meals' },
                { value: 'custom' as TimeRange, label: 'Custom Range', desc: 'Pick your own days' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    timeRange === option.value
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                    {timeRange === option.value && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {timeRange === 'custom' && (
              <div className="bg-gray-50 rounded-xl p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg font-semibold"
                />
              </div>
            )}

            <button
              onClick={handleCreatePlan}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" strokeWidth={2} />
              Create Plan
            </button>
          </div>
        )}

        {/* Step 3: Planning State */}
        {step === 'planning' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl animate-pulse ${
              planningMode === 'curated'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              {planningMode === 'curated' ? (
                <BookOpen className="w-10 h-10 text-white" strokeWidth={2} />
              ) : (
                <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {planningMode === 'curated' ? 'Selecting your recipes' : 'Creating your meal plan'}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {planningMode === 'curated' 
                  ? 'Choosing the perfect recipes from our curated collection...'
                  : 'Planning delicious meals, applying leftover logic, and generating your shopping list...'
                }
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full animate-bounce ${
                planningMode === 'curated' ? 'bg-orange-500' : 'bg-blue-500'
              }`} style={{ animationDelay: '0ms' }} />
              <div className={`w-2 h-2 rounded-full animate-bounce ${
                planningMode === 'curated' ? 'bg-orange-500' : 'bg-blue-500'
              }`} style={{ animationDelay: '150ms' }} />
              <div className={`w-2 h-2 rounded-full animate-bounce ${
                planningMode === 'curated' ? 'bg-orange-500' : 'bg-blue-500'
              }`} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Step 4: Confirmation - Add to Shopping List? */}
        {step === 'confirm' && (
          <div className="space-y-6">
            {/* Plan Preview */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <ChefHat className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Plan Ready!</h2>
                  <p className="text-sm text-gray-600">
                    {generatedMeals.length} meals planned
                  </p>
                </div>
              </div>
            </div>

            {/* Shopping List Question */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <ShoppingCart className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" strokeWidth={2} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Add ingredients to shopping list?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    I can add all the ingredients you need for these meals to your shopping list right now.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• {Array.from(new Set(generatedMeals.flatMap(m => m.ingredients.map(i => i.name)))).length} unique ingredients</p>
                    <p>• Organized by category</p>
                    <p>• Ready for your next grocery trip</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    // Save meals and add to shopping list
                    localStorage.setItem('weeklyMeals', JSON.stringify(generatedMeals))
                    
                    const allIngredients = generatedMeals.flatMap(m => 
                      m.ingredients.map(ing => ing.name.toLowerCase().trim())
                    )
                    const uniqueIngredients = Array.from(new Set(allIngredients))
                    
                    await fetch('/api/shopping/add', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        items: uniqueIngredients,
                        category: 'Meal Plan Ingredients'
                      })
                    })

                    window.dispatchEvent(new Event('mealsUpdated'))
                    setStep('results')
                  }}
                  className="py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Yes, Add All
                </button>
                <button
                  onClick={() => {
                    // Just save meals without adding to shopping list
                    localStorage.setItem('weeklyMeals', JSON.stringify(generatedMeals))
                    window.dispatchEvent(new Event('mealsUpdated'))
                    setStep('results')
                  }}
                  className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  No Thanks
                </button>
              </div>
            </div>

            {/* Quick Preview of Meals */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Meals in this plan:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedMeals.slice(0, 6).map(meal => (
                  <div key={meal.id} className="bg-white rounded-xl border border-gray-200 p-3 flex gap-3">
                    <img
                      src={meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={meal.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-orange-600 uppercase mb-1">
                        {meal.mealType}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {meal.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {generatedMeals.length > 6 && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  +{generatedMeals.length - 6} more meals
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {step === 'results' && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Plan Created!</h2>
                  <p className="text-sm text-gray-600">
                    {generatedMeals.length} meals added • Shopping list updated
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-700 bg-white px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" />
                  Added to calendar
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-700 bg-white px-3 py-1 rounded-full">
                  <ShoppingCart className="w-4 h-4" />
                  Groceries ready
                </div>
              </div>
            </div>

            {/* Meal Plan by Day */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Meal Plan</h3>
              <div className="space-y-4">
                {sortedDates.map(date => {
                  const dayMeals = mealsByDate[date]
                  const isExpanded = expandedDay === date
                  return (
                    <div key={date} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : date)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {dayMeals.length} meals planned
                          </div>
                        </div>
                        <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronLeft className="w-5 h-5 text-gray-400 -rotate-90" />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-200 divide-y divide-gray-100">
                          {dayMeals.map(meal => {
                            const isMealExpanded = expandedMeal === meal.id
                            return (
                              <div key={meal.id} className="p-4 relative">
                                {/* Delete button */}
                                <button
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  className="absolute top-4 right-4 w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center text-red-600 hover:text-red-700 transition-colors z-10"
                                  title="Remove this meal"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex gap-4 mb-3 pr-10">
                                  <img
                                    src={meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                                    alt={meal.title}
                                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-orange-600 uppercase">
                                        {meal.mealType}
                                      </span>
                                      {meal.isLeftover && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                          Leftovers
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">{meal.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{meal.description}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {meal.prepTime} min
                                      </div>
                                      <div>{meal.ingredients.length} ingredients</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Recipe Details Toggle */}
                                <button
                                  onClick={() => setExpandedMeal(isMealExpanded ? null : meal.id)}
                                  className="text-sm text-orange-600 hover:text-orange-700 font-medium mb-2"
                                >
                                  {isMealExpanded ? '▼ Hide recipe' : '▶ Show full recipe'}
                                </button>

                                {/* Full Recipe Details */}
                                {isMealExpanded && (
                                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-orange-200">
                                    {/* Ingredients */}
                                    <div>
                                      <h5 className="font-semibold text-gray-900 mb-2">Ingredients:</h5>
                                      <ul className="space-y-1">
                                        {meal.ingredients.map((ing, idx) => (
                                          <li key={idx} className="text-sm text-gray-700">
                                            • {ing.quantity} {ing.name}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Instructions */}
                                    {meal.instructions && meal.instructions.length > 0 && (
                                      <div>
                                        <h5 className="font-semibold text-gray-900 mb-2">Instructions:</h5>
                                        <ol className="space-y-2">
                                          {meal.instructions.map((instruction, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">
                                              <span className="font-medium text-orange-600">{idx + 1}.</span> {instruction}
                                            </li>
                                          ))}
                                        </ol>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pb-6">
              <button
                onClick={() => router.push('/kitchen')}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Done
              </button>
              <button
                onClick={() => {
                  setStep('type')
                  setGeneratedMeals([])
                }}
                className="w-full py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Create Another Plan
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  )
}
